// https://observablehq.com/d/c0f4b74e522cf0cf@101
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md` # All States Languages`
)});
  main.variable(observer()).define(["d3","DOM","root"], function(d3,DOM,root)
{
  const svg = d3.select(DOM.svg(1000, 1000));

  const color = ['#ffbedc', '#ffbedc', 'red'];
  //const color = ['#FA8177', '#F54056', '#362925'];
  //const color = ['#F2D6B3', '#A6986D', 'red'];

  const top = svg
    .selectAll("g")
    .data(root.children)
    .join("g")
    .attr("transform", d => `translate(-2000,1000)`)
    .attr("class", d => {
      return d.data.name;
    });

  top
    .append("circle")
    .attr("class", "distCircle")
    .attr("r", d => d.r)
    .attr("fill-opacity", 0.2)
    .attr("fill", color[0])
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  const states = top
    .selectAll("g.states")
    .data(d => d.children)
    .join("g")
    //.attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
    .attr("class", d => {
      return 'states ' + d.data.name;
    });

  states
    .append("circle")
    .attr("class", "stateCircle")
    .attr("r", d => d.r)
    .attr("fill-opacity", 0.4)
    .attr("fill", color[1])
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  const dists = states
    .selectAll("g.dist")
    .data(d => d.children)
    .join("g")
    //.attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
    .attr("class", d => {
      d.maxr = d3.max(d.children.map(d => d.r));
      return 'dist ' + d.data.name;
    });

  // states
  //   .selectAll("circle.dist")
  //   .data(d => d.children)
  //   .join("circle")
  //   .attr("class", "dist")
  //   .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
  //   .attr("r", d => (d.r > 1 ? d.r : 1))
  //   .attr("fill", d => {
  //     // const maxr = d3.max(d.children.map((d)=> d.T));
  //     return d.r < d.parent.maxr ? "red" : "#ffbedc";
  //   });

  console.log(dists);
  const langs = dists
    .selectAll("circle.lan")
    .data(d => d.children)
    .join("circle")
    .attr("class", "lan")
    .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
    .attr("r", d => (d.r > 1 ? d.r : 1))
    //.attr("fill-opacity", 0.5)
    .attr("fill", d => {
      // const maxr = d3.max(d.children.map((d)=> d.T));
      return d.r < d.parent.maxr ? color[2] : color[1];
    });

  // leaf.append('text')
  //     .text(d => d.r > 20 ? d.data.name :'')
  //     //.attr('fill','white')
  //     .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  return svg.node();
}
);
  main.variable(observer("root")).define("root", ["pack","circles"], function(pack,circles){return(
pack(circles)
)});
  main.variable(observer("width")).define("width", function(){return(
4000
)});
  main.variable(observer("height")).define("height", function(){return(
4000
)});
  main.variable(observer("pack")).define("pack", ["d3","width","height"], function(d3,width,height){return(
data =>
  d3
    .pack()
    .size([width, height])
    .padding(10)(
    d3.hierarchy({ children: data }).sum(d => d.T)
    //.sort((a, b) => b.T - a.T)
  )
)});
  main.variable(observer("viewof data_in")).define("viewof data_in", ["html"], function(html){return(
html`<input type=file accept="*/*">`
)});
  main.variable(observer("data_in")).define("data_in", ["Generators", "viewof data_in"], (G, _) => G.input(_));
  main.define("initial circles", function(){return(
{}
)});
  main.variable(observer("mutable circles")).define("mutable circles", ["Mutable", "initial circles"], (M, _) => new M(_));
  main.variable(observer("circles")).define("circles", ["mutable circles"], _ => _.generator);
  main.variable(observer("data_text")).define("data_text", ["Files","data_in"], function(Files,data_in){return(
Files.text(data_in)
)});
  main.variable(observer()).define(["mutable circles","data_text"], function($0,data_text)
{
  $0.value = JSON.parse(data_text);
}
);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
