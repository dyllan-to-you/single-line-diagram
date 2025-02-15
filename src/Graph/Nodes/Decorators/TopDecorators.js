import * as d3 from "d3";
import $ from "jquery";
import SharedFunctionality from "../../../Views/baseView";
import htmlInfoTable from "../../../utils/InfoTable";

// Icons
import marketIcon from "../../../Icons/market";

const parser = new DOMParser();

function TopDecorators(nodesGroupTag) {
  this.nodesGroupTag = nodesGroupTag;

  // Icons
  this.icons = {
    market: marketIcon,
  };
}

TopDecorators.prototype.decorate = function () {
  this.nodesGroupTag._groups.forEach((g) => {
    g.forEach((d) => {
      const nodeGroup = d.__data__;
      const topDecorators = nodeGroup.topDecorators;
      const topDecoCount = topDecorators.length;
      const R = SharedFunctionality.R;
      const LL = R / 2;
      const decoratorY = -5 * R;
      const decoratorWidth = 2 * R;

      const topDecoratorGroup = d3
        .select(d)
        .append("g")
        .attr("class", "topDecoratorGroup")
        .attr("id", () => topDecorators.DOMID);

      if (topDecoCount !== 0) {
        // Adding vertical central connector.
        if (topDecoCount === 1) {
          topDecoratorGroup
            .append("line")
            .attr("class", "connectors")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", decoratorY + R + LL * 1.4);
        }

        for (let index = 0; index < topDecoCount; index++) {
          const decorator = topDecorators[index];
          const icon = parser.parseFromString(
            this.icons[decorator.resourceType],
            "image/svg+xml"
          );
          const decoratorId = `bus${nodeGroup.id}topDeco${index}`;
          const decoratorHTML = topDecoratorGroup
            .node()
            .appendChild(icon.documentElement);
          d3.select(decoratorHTML)
            .attr("width", decoratorWidth)
            .attr("height", decoratorWidth)
            .attr("id", () => `bus${nodeGroup.id}topDeco${index}`)
            .attr("y", decoratorY)
            .attr("x", () => {
              if (topDecoCount % 2 === 0) {
                //Factor to be added to the topDecoCount to adjust the position of the top decorators.
                const x = (topDecoCount - 4) / 2 + 0.5;
                return (-(topDecoCount + x) + 3 * index) * R - R;
              } else return (-(3 * (topDecoCount - 1)) / 2 + 3 * index) * R - R;
            });

          // Adding connecting lines (vertical lines) for multiple top decorators.
          var y1 = decoratorY + R + LL * 1.4; // 1.4 is factor for margin
          var y2 = 0;
          if (topDecoCount > 1) {
            topDecoratorGroup
              .append("line")
              .attr("class", "connectors")
              .attr(
                "x1",
                () => Number($(`${decoratorId}`).attr("x")) + decoratorWidth / 2
              )
              .attr(
                "x2",
                () => Number($(`${decoratorId}`).attr("x")) + decoratorWidth / 2
              )
              .attr("y1", y1)
              .attr("y2", y2)
              .attr("dx", () => $(`${decoratorId}`).attr("x") - 4);
          }

          // Add label and info table
          topDecoratorGroup
            .append("foreignObject")
            .attr("id", `${decoratorId}Html`)
            .attr("class", "label")
            .attr("y", decoratorY - R)
            .attr("x", -(5 / 2) * R)
            .style("width", "128px")
            .style("height", "128px")
            .html(
              `<p style="margin-bottom: 0px; text-align: center; width: 80px">${
                decorator.topDecoData.name
              }</p> ${htmlInfoTable(decorator)}`
            )
            .style(
              "color",
              () => decorator.topDecoData.color || "rgba(0, 0, 0, 0.87)"
            )
            .style("font-size", "0.7rem");

          // Adding breaker to vertical lines
          const breakerWidth = 8;
          const breakerHeight = breakerWidth;
          const breakerFillColor =
            topDecorators[index].topDecoData.breaker === "open"
              ? "white"
              : "black";
          topDecoratorGroup
            .append("rect")
            .attr("class", "connectors")
            .attr("id", `bus${nodeGroup.id}topDeco${index}Breaker`)
            .attr(
              "x",
              () =>
                Number($(`#bus${nodeGroup.id}topDeco${index}`).attr("x")) +
                decoratorWidth / 2 -
                breakerWidth / 2
            )
            .attr("y", y1 + breakerHeight * 2.3)
            .attr("width", breakerWidth)
            .attr("height", breakerHeight)
            .attr("style", `fill:${breakerFillColor}`)
            .on("click", () => {
              d3.select("#diagram-div").dispatch("click-breaker", {
                detail: {
                  busId: nodeGroup.id,
                  resource: decorator.topDecoData,
                  resourceType: decorator.resourceType,
                  state:
                    decorator.topDecoData.breaker === "open" ? "close" : "open",
                },
              });
            });
        }
      }
    });
  });
};

TopDecorators.prototype.tick = function () {
  d3.selectAll(".topDecoratorGroup")
    .attr("transform", (d) => "translate(" + d.x + "," + d.y + ")")
    .attr("zoomPointX", (d) => d.x)
    .attr("zoomPointY", (d) => d.y);
};

export default TopDecorators;
