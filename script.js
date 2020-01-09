const h = 700;
const w = 1100;
let choice = 0;
let numColors;
let buttonChoice; //saved data after refresh
let buttonTitle;
let buttonDescription;
let title = "Video Game Sales"
let description = "Top 100 Most Sold Video Games Grouped by Platform"
let colors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000"
];
    d3
      .select("body")
      .append("div")
      .attr("class", "main");

    d3
      .select(".main")
      .append("div")
      .attr("id", "tree-map");

function scaleBody() {
  console.log(window.outerWidth + " " + window.innerWidth);
  let body = d3.select("body");
  body
    .style("transform", "scale(" + window.innerWidth / 1200 + ")")
    .style("transform-origin", "0 0");
}

window.onload = scaleBody();

window.addEventListener("resize", scaleBody);

let files = [
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
];

let promises = [];

files.forEach(function(url) {
  //read in both json files
  promises.push(d3.json(url));
});

function button1() {
  buttonChoice = localStorage.setItem("choice", 0);
  buttonTitle = localStorage.setItem("title", "Video Game Sales");
  buttonDescription = localStorage.setItem("description", "Top 100 Most Sold Video Games Grouped by Platform");
  refreshPage();
}
function button2() {
  buttonChoice = localStorage.setItem("choice", 1);
  buttonTitle = localStorage.setItem("title", "Movie Sales");
  buttonDescription = localStorage.setItem("description", "Highest Grossing Movies in the U.S. by Genre");
  refreshPage();
}
function button3() {
  buttonChoice = localStorage.setItem("choice", 2);
  buttonTitle = localStorage.setItem("title", "Kickstarter Campaigns");
  buttonDescription = localStorage.setItem("description", "Highest Funded Products by Category");
  refreshPage();
}

function refreshPage() {
  window.location.href = window.location.href;
}

//Currency formatter
let formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

  Promise.all(promises).then(function(values) {
    if (localStorage.getItem("choice") != null) {
      choice = localStorage.getItem("choice");
    }
    if (localStorage.getItem("title") != null) {
        title = localStorage.getItem("title");
    }
    if (localStorage.getItem("description") != null) {
        description = localStorage.getItem("description");
    }
    let data = values[choice];
    
    d3
      .select("#tree-map")
      .append("h1")
      .attr("id", "title")
      .html(title);

    d3
      .select("#tree-map")
      .append("h2")
      .attr("id", "description")
      .html(description);

    const svg = d3 //white container
      .select("#tree-map")
      .append("svg")
      .attr("width", "auto")
      .attr("height", 800)
      .attr("class", "mainbox");

    let categories = [];
    for (let i = 0; i < data.children.length; i++) {
      categories.push(data.children[i].name);
    }
    
    numColors = categories.length;

    let root = d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);

    let treemapLayout = d3.treemap();

    treemapLayout
      .size([1000, 600])
      .paddingOuter(2)
      .paddingInner(1)
      .tile(d3.treemapBinary);

    root.sum(function(d) {
      return d.value;
    });

    treemapLayout(root);

    let cell = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(" + [d.x0 + 50, d.y0 + 200] + ")";
      });

    cell
      .append("rect")
      .attr("id", d => d.data.id)
      .attr("class", "tile")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => colors[categories.indexOf(d.data.category)])
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .on("mouseover", showToolTip)
      .on("mousemove", moveToolTip)
      .on("mouseout", hideToolTip);

   let font = 6; 
   if(choice == 2){
     font = 5;
   }
    cell
      .append("text")
      .attr("id", (d, i) => "tile-text" + i)
      .attr("class", "tile-text")
      .style("font-size", d => (d.x1 - d.x0) * (d.y1 - d.y0) / 1500 + font + "px")
      .selectAll("tspan")
      .data(d => d.data.name)
      .enter()
      .append("tspan")
      .text(d => d);

    for (let i = 0; i < root.leaves().length; i++) {
      d3plus
        .textwrap()
        .container("#tile-text" + i)
        .draw();
    }

    let tooltip = d3
      .select("#tree-map")
      .append("div")
      .attr("id", "tooltip");

    function showToolTip(d, i) {
      tooltip
        .transition()
        .duration(0)
        .style("visibility", "visible")
        .attr("data-value", d.data.value)
        .attr("id", "tooltip");

      tooltip.html(function(){
        if(choice == 0){
        return "Name: </br>" +
          d.data.name +
          "<br>" +
          "Category: " +
          d.data.category +
          "<br>" +
          "Copies Sold: " +
          d.data.value +
          " million"
        } else if(choice == 1){
        return "Name: </br>" +
          d.data.name +
          "<br>" +
          "Category: " +
          d.data.category +
          "<br>" +
          "Amount Grossed: " +
         formatter.format(d.data.value).substring(0, formatter.format(d.data.value).length - 3) + " USD"
      } else if(choice == 2){
       return  "Name: </br>" +
          d.data.name +
          "<br>" +
          "Category: " +
          d.data.category +
          "<br>" +
          "Amount Funded: " +
          formatter.format(d.data.value).substring(0, formatter.format(d.data.value).length - 3) + " USD"
      }});
    }

    function moveToolTip(d, i) {
      tooltip.style("top", d.y0 + 112.5 + "px").style("left", function() {
        if (d.x0 > 900) {
          return d.x0 - 100 + "px";
        } else if (d.x0 > 836) {
          return d.x0 - 30 + "px";
        } else {
          return d.x0 + 50 + "px";
        }
      });
    }

    function hideToolTip(d, i) {
      tooltip.style("visibility", "hidden");
    }
    //legend split into 2 rows for Video Game Sales
    if (choice == 0) {
      let legend = svg.attr("id", "legend");
      for (let i = 0; i < Math.floor(numColors / 2); i++) {
        legend
          .append("rect")
          .attr("class", "legend-item")
          .attr("x", 110 * i + 45)
          .attr("y", 100)
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", colors[i])
          .style("stroke-width", "1.5")
          .style("stroke", "black");

        svg
          .append("text")
          .attr("x", 110 * i + 90)
          .attr("y", 123)
          .text(categories[i])
          .style("font-size", "20px");
      }

      for (let i = Math.floor(numColors / 2); i < numColors; i++) {
        legend
          .append("rect")
          .attr("x", 110 * (i - Math.floor(numColors / 2)) + 45)
          .attr("y", 160)
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", colors[i])
          .style("stroke-width", "1.5")
          .style("stroke", "black");

        svg
          .append("text")
          .attr("x", 110 * (i - Math.floor(numColors / 2)) + 90)
          .attr("y", 182)
          .text(categories[i])
          .style("font-size", "20px");
      }
    }
    
      if (choice == 1) {
      let legend = svg.attr("id", "legend");
      for (let i = 0; i < numColors; i++) {
        legend
          .append("rect")
          .attr("class", "legend-item")
          .attr("x", 150 * i + 35)
          .attr("y", 110)
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", colors[i])
          .style("stroke-width", "1.5")
          .style("stroke", "black");

        svg
          .append("text")
          .attr("x", 150 * i + 75)
          .attr("y", 133)
          .text(categories[i])
          .style("font-size", "17.5px");
      }

   }
    
     if (choice == 2) {
      let legend = svg.attr("id", "legend");
      for (let i = 0; i < Math.floor(numColors / 2); i++) {
        
        legend
          .append("rect")
          .attr("class", "legend-item")
          .attr("x", function() {
          if(i < 2){
            return 140 * i + 35;
          } else if(i == 2 || i == 3){
            return 150 * i + 15;
          } else if(i == 4){
            return 585;
          } else if(i == 5){
            return 665;
          } else if(i == 6){
            return 765;
          }  else if(i == 7){
            return 895;
          } else {
            return 980}
        })
          .attr("y", 100)
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", colors[i])
          .style("stroke-width", "1.5")
          .style("stroke", "black");

        svg
          .append("text")
          .attr("x", function() {
           if(i < 2){
            return 140 * i + 68;
          } else if(i == 2 || i == 3){
            return 150 * i + 48;
          } else if(i == 4){
            return 618;
          } else if(i == 5){
            return 698;
          } else if(i == 6){
            return 798;
          } else if(i == 7){
            return 933;
          } else {
          return 1013}
        })
          .attr("y", 123)
          .text(categories[i])
          .style("font-size", "12.5px");
      }

      for (let i = Math.floor(numColors / 2); i < numColors; i++) {
        
        legend
          .append("rect")
          .attr("x", function() {
          if(i > 10 & i < 15){
            return 120 * (i - Math.floor(numColors / 2)) + 25;
          } else if(i> 14 && i < 17){
            return 80 * (i - Math.floor(numColors / 2)) + 245;
          } else {
          return 105 * (i - Math.floor(numColors / 2)) + 35}
        })
          .attr("y", 160)
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", colors[i])
          .style("stroke-width", "1.5")
          .style("stroke", "black");

        svg
          .append("text")
          .attr("x", function() {
          if(i > 10 & i < 15){
            return 120 * (i - Math.floor(numColors / 2)) + 59;
          } else if(i> 14 && i < 17){
            return 80 * (i - Math.floor(numColors / 2)) + 280;
          } else {
          return 105 * (i - Math.floor(numColors / 2)) + 70}
        })
          .attr("y", 182)
          .text(categories[i])
          .style("font-size", "12.5px");
      }
    }
  });
