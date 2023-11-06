import fs from "fs/promises"; // Import with ES Modules syntax
import movieImgLinks from "./movie-img_links.json" assert { type: "json" };
import outputGraph from "./output_graph.json" assert { type: "json" };

// Create a map for quick lookup of large image links by id
const largeImgLinksMap = movieImgLinks.reduce((map, obj) => {
    map[obj.id] = obj.large_img_link;
    return map;
}, {});

// Replace the img_link in output_graph.json with the large_img_link from movie-img_links.json
outputGraph.nodes.forEach((node) => {
    if (largeImgLinksMap[node.id]) {
        node.img_link = largeImgLinksMap[node.id];
    }
});

// Write the modified output graph back to output_graph.json
// Using fs promises API for modern async handling
await fs
    .writeFile("./output_graph.json", JSON.stringify(outputGraph, null, 2))
    .then(() =>
        console.log(
            "output_graph.json has been updated with large image links."
        )
    )
    .catch((err) =>
        console.error("An error occurred while writing JSON to file.", err)
    );
