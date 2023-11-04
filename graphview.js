class GraphView {
    #nodeRadius = 5;
    #margin = { top: 15, bottom: 15, left: 20, right: 15 };

    constructor(svgId, nodes, edges) {
        this.svg = d3.select(svgId);
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = this.svg.node().getBoundingClientRect().height;
        this.layer1 = this.svg.append("g");
        this.layer2 = this.layer1.append("g");

        this.setGraph(nodes, edges);

        this.zoomLevel = d3.zoomIdentity;
        this.currentSource = null;
        this.currentTarget = null;
        this.tmpLine = null;

        this.layout = "fda";
    }

    setGraph(nodes, edges) {
        this.nodes = JSON.parse(JSON.stringify(nodes));
        this.edges = JSON.parse(JSON.stringify(edges));

        this.nodes.forEach((n) => {
            n.rank = Number(n.rank);
            n.fx = null;
            n.fy = null;
            n.showText = false;
        });

        if (this.sim) this.sim.on("tick", null);

        this.sim = d3
            .forceSimulation(this.nodes)
            .force(
                "link",
                d3.forceLink(this.edges).id((n) => n.id)
            )
            .force(
                "repulse",
                d3
                    .forceManyBody()
                    .strength(-50)
                    .distanceMax(50 * this.#nodeRadius)
            )
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .stop();

        this.calcDegree();
        this.sim.nodes(this.nodes);
        this.layout = "fda";
    }

    calcDegree() {
        this.nodes.forEach((n) => (n.degree = 0));
        this.edges.forEach((e) => {
            e.source.degree++;
            e.target.degree++;
        });
    }

    showText(currentLabelType) {
        const t = d3.transition().duration(750);
        this.layer1
            .selectAll(".names")
            .data(
                this.nodes.filter((n) => n.showText),
                (n) => n.id
            )
            .join(
                (enter) =>
                    enter
                        .append("text")
                        .attr("class", "names")
                        .attr("x", (n) => n.x)
                        .attr("y", (n) => n.y)
                        .attr("text-anchor", "middle")
                        .attr("font-size", 10)
                        .text((d) => {
                            // Return the appropriate property based on currentLabelType
                            if (currentLabelType === "id") return d.id;
                            if (currentLabelType === "genre") return d.genre;
                            if (currentLabelType === "name") return d.name;
                            if (currentLabelType === "director_name")
                                return d.director_name;
                            // Default to id if none is matched, or add another default as needed
                            return d.id;
                        }),
                (update) => update.attr("x", (n) => n.x).attr("y", (n) => n.y),
                (exit) => exit.remove()
            );
    }

    addAllText(currentLabelType) {
        this.nodes.forEach((n) => (n.showText = true));
        this.showText(currentLabelType);
    }

    removeAllText() {
        this.nodes.forEach((n) => (n.showText = false));
        this.showText();
    }

    startSim(ystop) {
        let ticked = () => {
            let xbound = (x) =>
                Math.max(
                    this.#nodeRadius,
                    Math.min(this.width - this.#nodeRadius, x)
                );
            let ybound = (y) =>
                Math.max(
                    this.#nodeRadius,
                    Math.min(ystop - this.#nodeRadius, y)
                );

            this.layer1
                .selectAll(".links")
                .attr("x1", (e) => e.source.x)
                .attr("y1", (e) => e.source.y)
                .attr("x2", (e) => e.target.x)
                .attr("y2", (e) => e.target.y);

            this.layer1
                .selectAll(".nodes")
                .attr("cx", (n) => (n.x = xbound(n.x)))
                .attr("cy", (n) => (n.y = ybound(n.y)));

            this.showText();
        };

        this.sim.on("tick", ticked);
        this.sim.restart();
    }

    draw() {
        /*
        Basic draw routine. 
        */
        const t = d3.transition().duration(750);

        if (this.layout === "fda") {
            this.layer1.selectAll(".arcs").transition(t).remove();
            this.layer1
                .selectAll(".links")
                .data(this.edges, (e) => e.source.id + e.target.id)
                .join(
                    (enter) =>
                        enter
                            .append("line")
                            .attr("class", "links")
                            .attr("x1", (e) => e.source.x)
                            .attr("y1", (e) => e.source.y)
                            .attr("x2", (e) => e.target.x)
                            .attr("y2", (e) => e.target.y)
                            .attr("stroke", "black")
                            .attr("opacity", 0.5)
                            .attr("transform", this.zoomLevel),
                    (update) => update,
                    (exit) =>
                        exit.transition(t).attr("stroke-width", 1e-12).remove()
                );
        } else if (this.layout === "linear") {
            this.drawArcs();
        }

        this.layer1
            .selectAll(".nodes")
            .data(this.nodes, (d) => d.id)
            .join(
                (enter) =>
                    enter
                        .append("circle")
                        .attr("class", "nodes")
                        .attr("cx", (n) => n.x)
                        .attr("cy", (n) => n.y)
                        .attr("r", this.#nodeRadius)
                        .attr("fill", "lightblue")
                        .attr("stroke", "black")
                        .attr("transform", this.zoomLevel),
                (update) =>
                    this.layout === "fda"
                        ? update
                        : update
                              .transition(t)
                              .attr("cx", (n) => n.x)
                              .attr("cy", (n) => n.y),
                (exit) => exit.transition(t).attr("r", 1e-12).remove()
            )
            .raise();

        if (this.layout === "fda") {
            this.sim.nodes(this.nodes);

            this.sim.alpha(0.5);
            this.sim.restart();
        }
    }

    drawArcs() {
        const t = d3.transition().duration(750);
        function arc(d) {
            const x1 = d.source.fx;
            const x2 = d.target.fx;
            const y = d.source.y;
            const r = Math.abs(x2 - x1) / 1.5;
            return `M${x1},${y}A${r},${r} 0,0,${x1 > x2 ? 1 : 0} ${x2},${y}`;
        }

        this.layer1
            .selectAll(".arcs")
            .data(this.edges, (e) => e.source.id + e.target.id)
            .join(
                (enter) =>
                    enter
                        .append("path")
                        .attr("class", "arcs")
                        .attr("fill", "none")
                        .attr("stroke-opacity", 0.6)
                        .attr("stroke-width", 1.5)
                        .attr("stroke", "grey")
                        .attr("opacity", 0.3)
                        .attr("d", arc),
                (update) => update,
                (exit) =>
                    exit.transition(t).attr("stroke-width", 1e-12).remove()
            );
    }

    addClickListener() {
        this.svg.on("click", (e) => {
            if (this.currentSource) return;

            let [x, y] = d3.pointer(e);
            this.nodes.push({
                id: this.nodes.length.toString(),
                x: x,
                y: y,
                year: 2023,
            });
            this.draw();
            this.addDragListener();
        });

        this.svg.on("dblclick", null);

        this.layer1.selectAll(".nodes").on("click", () => {});
    }

    addDragListener() {
        // Load movie image links
        var tthis = this;
        var tooltip = d3.select("#tooltip");

        this.layer1
            .selectAll(".nodes")
            .on("mousedown", (e, d) => {
                this.svg.on(".zoom", null);
                this.svg.on("click", null);

                d.fx = d.x;
                d.fy = d.y;

                let [x, y] = d3.pointer(e);

                this.currentSource = d;
                this.tmpLine = this.layer2
                    .append("line")
                    // .attr("class", "links")
                    .attr("x1", this.currentSource.x)
                    .attr("y1", this.currentSource.y)
                    .attr("x2", x)
                    .attr("y2", y)
                    .attr("stroke", "black")
                    .attr("transform", this.zoomLevel);
            })
            .on("mouseover", function (e, d) {
                console.log(d.genre);
                if (tthis.currentSource) {
                    tthis.currentTarget = d;
                    d3.select(this).attr("fill", "red").attr("r", 10);
                } else {
                    d3.select(this).classed("node-highlight", true);
                    d3.selectAll(".links")
                        .filter(
                            (e) => e.source.id === d.id || e.target.id === d.id
                        )
                        .classed("link-highlight", true);
                    d3.selectAll(".arcs")
                        .filter(
                            (e) => e.source.id === d.id || e.target.id === d.id
                        )
                        .classed("link-highlight", true);
                }
                tooltip
                    .html(
                        `
            <img src="${d.img_link}" alt="Movie Poster" style="max-width:100px;"/>
            <div><strong>Name:</strong> ${d.name}</div>
            <div><strong>ID:</strong> ${d.id}</div>
            <div><strong>Rank:</strong> ${d.rank}</div>
            <div><strong>Year:</strong> ${d.year}</div>
            <div><strong>IMDB Rating:</strong> ${d.imdb_rating}</div>
            <div><strong>Duration:</strong> ${d.duration}</div>
            <div><strong>Genre/s:</strong> ${d.genre}</div>
            <div><strong>Director/s:</strong> ${d.director_name}</div>
            <div><strong>Writers/s:</strong> ${d.writter_name}</div>
            <div><strong>Cast/s:</strong> ${d.cast_name}</div>
        `
                    )
                    .style("left", e.pageX + "px")
                    .style("top", e.pageY - 28 + "px")
                    .style("opacity", 1);
                document.getElementById("movie-name").innerHTML = d.name;
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("fill", "lightblue")
                    .attr("r", 5)
                    .classed("node-highlight", false);
                d3.selectAll(".links").classed("link-highlight", false);
                d3.selectAll(".arcs").classed("link-highlight", false);
                tthis.currentTarget = null;
                document.getElementById("movie-name").innerHTML = null;
                tooltip.style("opacity", 0);
            });

        this.svg.on("mousemove", (e) => {
            if (this.currentSource) {
                let [x, y] = d3.pointer(e);
                this.tmpLine
                    .attr("x2", x)
                    .attr("y2", y)
                    .attr("transform", this.zoomLevel);
            }
        });

        this.svg.on("mouseup", () => {
            this.layer2.selectAll("line").remove();

            if (this.currentTarget) {
                if (this.currentSource === this.currentTarget) {
                    alert("Self loops not allowed");
                    return;
                }

                let newEdge = {
                    source: this.currentSource,
                    target: this.currentTarget,
                };
                this.edges.forEach((e) => {
                    if (
                        newEdge.source.id === e.source.id &&
                        newEdge.target.id === e.target.id
                    ) {
                        alert("edge already exists");
                        return;
                    } else if (
                        newEdge.target.id === e.source.id &&
                        newEdge.source.id === e.target.id
                    ) {
                        alert("edge already exists");
                        return;
                    }
                });

                if (this.layout === "fda") {
                    this.currentSource.fx = null;
                    this.currentSource.fy = null;
                }

                this.edges.push(newEdge);
                d3.selectAll(".nodes").attr("fill", "lightblue").attr("r", 5);
                this.draw();
                setTimeout(() => this.addClickListener(), 200);
            }
            this.currentSource = null;
            this.currentTarget = null;
        });
    }

    linearLayout(field) {
        this.layout = "linear";
        this.sim.stop();
        let y = this.height / 3;
        let xextent = d3.extent(this.nodes, (d) => Number(d[field]));
        let xscale = d3
            .scaleLinear()
            .domain(xextent)
            .range([this.#margin.left, this.width - this.#margin.right]);
        this.layer1.selectAll(".links").remove();
        this.nodes.forEach((n) => {
            n.x = n.fx = xscale(Number(n[field]));
            n.y = y;
        });
        this.draw();
        setTimeout(() => {
            this.sim = d3
                .forceSimulation(this.nodes)
                .force("collide", d3.forceCollide(this.#nodeRadius))
                .force("y", d3.forceY(this.height / 2).strength(1e-2));

            this.startSim(y);
        }, 1000);
    }

    highlightNodes(subNodes) {
        this.removeHighlight();

        this.layer1
            .selectAll(".links")
            .classed(
                "link-unfocused",
                (e) =>
                    !subNodes.includes(e.source) && !subNodes.includes(e.target)
            );

        this.layer1
            .selectAll(".nodes")
            .filter((n) => !subNodes.includes(n))
            .classed("node-unfocused", true)
            .attr("r", this.#nodeRadius);

        this.layer1
            .selectAll(".nodes")
            .filter((n) => subNodes.includes(n))
            .classed("node-focused", true)
            .attr("r", 2 * this.#nodeRadius);
    }

    removeHighlight() {
        this.layer1.selectAll(".links").classed("link-unfocused", false);
        this.layer1
            .selectAll(".nodes")
            .classed("node-unfocused", false)
            .classed("node-focused", false)
            .attr("r", this.#nodeRadius);
    }

    putText(subNodes) {
        this.nodes.forEach(
            (n) => (n.showText = subNodes.includes(n) ? true : false)
        );
        this.showText();
    }

    queryId(searchTerm) {
        let searchResults = this.nodes.filter((n) => {
            searchTerm = searchTerm.toString().toLowerCase();
            let directors = n.director_name
                .split(",")
                .map((d) => d.trim().toLowerCase());
            let writers = n.writter_name
                .split(",")
                .map((w) => w.trim().toLowerCase());

            return (
                n.id.toString().toLowerCase() === searchTerm ||
                n.name.toLowerCase().includes(searchTerm) ||
                n.genre.toLowerCase().includes(searchTerm) ||
                n.cast_name.toLowerCase().includes(searchTerm) ||
                directors.some((director) => director.includes(searchTerm)) ||
                writers.some((writer) => writer.includes(searchTerm))
            );
        });

        if (searchResults.length > 0) {
            this.highlightNodes(searchResults);
            this.putText(searchResults);
        } else {
            this.removeHighlight();
            this.putText([]);
        }

        return searchResults;
    }
}
