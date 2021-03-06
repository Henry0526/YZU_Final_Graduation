// window.onload = function () {
//     origin_svg = document.getElementById('SVG_for_relation').getBoundingClientRect();
// }

// var origin_svg;

// function for mousein leaf node
function mouseout_leaf(d) {
    div.transition()
        .duration(500)
        .style("opacity", 0);
}

// function for mouseout leaf node
function mousein_leaf(d) {
    div.transition()
        .duration(200)
        .style("opacity", .9);
    div.html(
        "原文:    " + d.name + "<br/>"
        + "中文翻譯: " + d.translated + "<br/>"
        + "語言:    " + d.language + "<br/>"
        + "文章出現總比率" + d.all_essay_appear_ratio
    );
    div.style("right", (svg.style(origin_svg.right) - 680) + "px")
        .style("top", (svg.style(origin_svg.top) - 28) + "px");
    // .style("left", (d3.event.pageX) + "px")
    // .style("top", (d3.event.pageY - 28) + "px");
}

var width = 2000,
    height = 1500,
    root;


// --------------------------------------------
// Define the div for the tooltip_detail
var div = d3.select("body").append("div")
    .attr("class", "tooltip_detail")
    .style("opacity", 0);
// --------------------------------------------

var force = d3.layout.force()
    .linkDistance(300)
    .charge(-750)
    .gravity(0.23)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("body").append("svg").attr("id", "SVG_for_relation")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

// d3.json("./graph.json", function(error, json) {
d3.json("./relation.json", function (error, json) {
    if (error) throw error;

    root = json;
    update();
});

function update() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();

    // Update links.
    link = link.data(links, function (d) {
        return d.target.id;
    });

    link.exit().remove();

    link.enter().insert("line", ".node")
        .attr("class", "link");

    // Update nodes.
    node = node.data(nodes, function (d) {
        return d.id;
    });

    node.exit().remove();

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .on("click", click)
        .call(force.drag);

    nodeEnter.append("circle")
        .attr("r", function (d) {
            return Math.sqrt(d.size) / 10 || 20;
        })
        .on("mouseover", mousein_leaf)
        .on("mouseout", mouseout_leaf)


    nodeEnter.append("text")
        .attr("dy", "0em")
        .style("font-size", "20px")
        .style("font-family", "Comic Sans MS")
        .on("mouseover", mousein_leaf)
        .on("mouseout", mouseout_leaf)
        .text(function (d) {
            return d.name;
        });

    node.select("circle")
        .style("fill", color);
}

function tick() {
    link.attr("x1", function (d) {
        return d.source.x;
    })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        });

    node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}

function color(d) {
    return d._children ? "#3182bd" // collapsed package
        :
        d.children ? "#c6dbef" // expanded package
            :
            "#fd8d3c"; // leaf node
}

// Toggle children on click.
function click(d) {
    if (d3.event.defaultPrevented) return; // ignore drag
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update();
}

// Returns a list of all nodes under the root.
function flatten(root) {
    var nodes = [],
        i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    //   recurse(root);
    console.log(root);
    Object.keys(root).forEach(function (k) {
        console.log(k + ' - ');
        console.log(root[k]);
        recurse(root[k]);
    });
    return nodes;
}