# CSC-343-HW4

# How I achieve the all the functionalities

I first loaded all the needed information into the graph, then wrote a separate javascript file called replaceCorrectLink. Once this file is ran,
it will replaced all the incorrect image links in the original out\*putgraph.json with the correct links from movie-img_links.json. Then in index.js,
I loaded all the needed information into the graph in pairs.

For #1, I used an html tag called _select_, it's basically a drop down menu that lets the user select different options, it shows different lables
depending on what was selected.
For #2, I used tooltips and mouseover/mouseout, once the mouse is on top of a node, it will show a small windows, in this small window, i added
the information of each node, (i.e. movie name, movie ID movie rank etc.).
For #3, I started by calling the findLargestComponent() function, it will give me the largest component in the graph. Then iterates over each node within the nodes collection of the largest component. After that, run BFS on each of the nodes which will find the shortest path, then the lengths of all shortest paths from the current node are summed up using reduce(), which accumulates the values of each path length into sum variable. Finally, the function returns the average path length by dividing the total su, of path lengths by the number of possible pairs of nodes. The number of pairs is give by n \* (n - 1) where n is the number of nodes in the component.
For #4, I modified the queryID function, set the search string to lowercase, loop thru each of the existing nodes, check if the node contains the information that we are searching for, if so, return that node and highlight it.
for #5, I did the samething as #1, I have two input fields, one for the ID of the node to modify, the other for the content to modify to. I also have a drop down menu for what type of content to change(i.e. movie name, movie Id etc.).
For #6, I have two input fields, one for source and the other for target, it will go both ways, once the edge is found, i called filtered to delete the edge, it will also show on the graph

## Prerequisites

Welcome to the repository for CSC 343 Homework 4!

This README will guide you through setting up the project and getting the graph visualization running in your local browser.
**Make sure to read the instructions here thoroughly from start to end before writing any code**.

## Setup

1. **Creating a new branch and Cloning the Repository**:
    - First, you will need to create a new branch in your GitHub repository to hold your work.
    - Create a [branch](https://help.github.com/articles/creating-and-deleting-branches-within-your-repository/) through the GitHub interface.
    - Name your `<branch>` as `yourlastname_yourfirstname_dev` (**very important , do NOT name it anything else**)
    - Clone this repository to your local machine with a command similar to:
    - ```bash
      git clone -b <branch> https://github.com/CSC343-HCI-F23/csc343-f23-hw4-<your-username>.git
      ```
        where `<your-username>` is your GitHub username.
2. **Install dependencies**:

    Assuming you installed Node.js and npm correctly in Homework 1, navigate to the root of the cloned repository and run the following command to install
    the necessary Node.js dependencies.

    ```bash
    cd csc343-f23-hw4-<your-username>
    npm install
    ```

3. **Copy the output graph data file from Homework 1 into the root of your cloned repository**:

    By graph data, we refer to `output_graph.json` file that you produced at the end of Homework 1, which should contain your `nodes`, `edges` and `nodeDegree` attributes.
    It is expected to have the following format:

    ```json
    {
        "nodes": [],
        "edges": [],
        "nodeDegrees": []
    }
    ```

## Implementation

1. **Read the Graph data**:

    A `GraphClass.js` file is provided to which defines a minimal data structure for the graph data. You are to read the graph data from `output_graph.json`
    into this data structure.

2. **Render the Graph**:

    Implement the main rendering functionality (and all associated functionality to support interactions with the visualization) in the file `index.js` which imports the `GraphClass`. The starter function definitions for `loadAndRenderGraph()`, `renderGraph(graphData)` and `displayGraphStatistics(graphObj)` are the same as those which were given in Homework 2 & Homework 3. You are expected to swap in your `index.js` file from Homework 3, and to modify/add new methods to support the visualization functionality required in Homework 4. If you plan to build on top of the official solution for Homework 3, the file `graphview.js` is also required.

3. **Use the provided JSON file for movie posters**:
   A JSON file `movie-img_links.json` is provided as part of this repository which contains corrected URL's for movie poster images, which you will need for problem (2).

4. **Compute Graph Statistics**:

    `GraphClass.js` contains a basic function definition for Average Shortest Path Length (APL) corresponding to problem (3). Implement this method and render the computed APL statistic on the canvas of your graph visualization (**hint**: A possible approach here would be to call this function inside the `displayGraphStatistics(graphObj)` method in `index.js`). Of course, you should also add all of your previous statistics calculation methods from Homework 2 and Homework 3 in `GraphClass.js` and must still be able to render them on the canvas.

    Also, you **should not edit** these files:

    - `./tests.js`
    - `./server.js`
    - `.github/workflows/run-tests-on-pull.yml`

5. **Test your code**:

    A unit test for APL has been provided for you in the `./tests.js` file.
    To run the provided test, just type/run `npm test` from command line from the root of the repository. The test is to verify the correct implementation of problem (3).

    If your code passes the test cases, you will see output like:

    ```
      GraphClass
         #computeAPL()
         ✔ should compute the correct Average Shortest Path Length (APL) for the dummy graph data

      1 passing (2ms)
    ```

## Viewing the Graph Visualization in Browser

1. **Study the provided HTML file**:

    Just like Homework 2 and Homework 3, the project includes an HTML file `index.html`, pre-configured with some starter metadata, elements and styles,
    to assist you in displaying your graph visualization. We provide some helpful div's with `id`'s and `class` names that should be self-explanatory. You are expected to swap in your `index.html` from Homework 3, and to add any additional modifications needed to support the functionality of Homework 4.
    Feel free to re-structure, and restyle this HTML file (including changing div/class names) to suit your needs. **`index.html` will be the webpage on which your graph is rendered**.

2. **Start the HTTP Server**:

    To view the interactive graph visualization, you'll need to serve the HTML file `index.html`, through an HTTP server. Run the following command to start the server:

    ```bash
      node server.js
    ```

    By default, the server runs on port **3000**. We provide a pre-configured `server.js` file for serving webpages. **You should not modify it**.

3. **View in Browser**:

    Open your web browser e.g. Chrome and navigate to: <http://localhost:3000>

You should now be able to see the interactive graph visualization.

## Submitting your code

As you are working on the code, you should regularly `git commit` to save your current changes locally and `git push` to push all saved changes to the remote repository on GitHub.

To submit your assignment, [create a pull request on GitHub](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request), where the "base" branch is "master" or "main", and the "compare" branch is the branch you
created at the beginning of this assignment.
Then, go to the "Files changed" tab and make sure that all your changes look as you would expect them to.

There are test cases that will be run automatically (via., [Github Actions](https://github.com/features/actions)) when a pull request is submitted. These are the same as `npm test`.
So if your code passed `npm test` in your machine, it’s highly likely that it will pass in GitHub. Nevertheless, you should make sure that you see a green tick mark or a message saying “All Checks Have Passed” like this:

![like this:](passed.png)

**_Once you create your pull requests, leave them open. Do NOT merge them into main/master and do NOT close them._**
