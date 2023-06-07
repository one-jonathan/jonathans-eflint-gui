import { useContext } from "react";
import { Tree } from "react-d3-tree";
import PropTypes from "prop-types";
import { InstanceDataContext } from "../InstanceViewer";

export default function HistoryViewer({ currentStateId, jumper }) {
  const contextData = useContext(InstanceDataContext);
  const { data, loading, error } = contextData.instanceHistory;

  if (data === null && !loading) return <div>No history data</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error?.message}</div>;

  // Tree builder based on https://github.com/Ravi-Mohanlal/eFLINT-GUI/blob/main/src/History.js

  const trees = [];

  function createTree(data) {
    const l = [];
    const prev = [];
    data.edges[0].po.program = "Initial";

    data.edges.forEach((edge) => {
      const temp = [...prev];
      temp[edge.target] = edge.source;
      prev[edge.target] = edge.source;

      if (l[edge.source]) {
        l[edge.source].children.push(edge.target);
      } else {
        l[edge.source] = { name: "", children: [edge.target], id: edge.source };
      }

      if (l[edge.target]) {
        l[edge.target].name = edge.po.program;
      } else {
        l[edge.target] = { name: edge.po.program, children: [], id: edge.target };
      }
    });

    const rootNodes = l.filter((node, index) => !prev[index]);
    rootNodes.forEach((root) => {
      trees.push(expandTree(l, root.id));
    });
  }

  function expandTree(l, m) {
    return {
      name: l[m].name,
      children: l[m].children.map((n) => expandTree(l, n)),
      id: l[m].id,
    };
  }

  if (data.data.response?.edges?.length > 0) createTree(data.data.response);

  if (trees.length > 0) {
    return (
      <>
        <div className="d-flex justify-content-center">
          {trees.map((tree, index) => (
            <div
              key={index}
              className="border w-100"
              style={{ height: "50vh" }}
              id={`tree${index}`}
            >
              <Tree
                data={tree}
                orientation="vertical"
                separation={{ nonSiblings: 2, siblings: 2 }}
                renderCustomNodeElement={({ nodeDatum }) => (
                  <g onClick={() => jumper(nodeDatum.id)}>
                    <circle
                      r={15}
                      fill={nodeDatum.id === currentStateId ? "#ADD8E6" : "#fff"}
                      stroke="#000"
                      strokeWidth={1}
                      style={{ cursor: "pointer" }}
                    />
                    <text textAnchor="middle" y={5}>
                      {nodeDatum.id}
                    </text>
                    <text>
                      <tspan x="-20" y="30" fontWeight={100} textAnchor="middle">
                        {nodeDatum.name}
                      </tspan>
                    </text>
                  </g>
                )}
                translate={{ x: 100, y: 100 }}
              />
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary mt-2"
          onClick={() => downloadJSON(data.data.response, "history")}
        >
          Download Export as JSON
        </button>
      </>
    );
  }

  return <div>No history data</div>;
}

function downloadJSON(jsonData, filename) {
  for (const edge of jsonData.edges) {
    // otherwise the JSON can't be loaded
    edge["po"].label = edge["po"].program.slice(0, 50);
  }
  const data = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

HistoryViewer.propTypes = {
  currentStateId: PropTypes.number.isRequired,
  jumper: PropTypes.func.isRequired,
};
