import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { InstanceDataContext } from "../InstanceViewer";

export default function PathHistory({ jumperFunction, requestPathHistory }) {
  const { data, loading, error } = useContext(InstanceDataContext).instancePathHistory;
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (selectedId === "" && data) {
      const firstEdge = data.data.response.edges[0];
      setSelectedId(firstEdge ? firstEdge.target_id.toString() : "");
    }
  }, [data, selectedId]);

  if (!data && !loading && !error) {
    return (
      <button className="btn btn-primary mt-1 col-12" onClick={requestPathHistory}>
        Load edges between current state and root state
      </button>
    );
  } else if (loading) {
    return (
      <button disabled className="btn btn-primary mt-1 col-12">
        Loading states between current and root...
      </button>
    );
  }
  if (error) return <div>Error: {error.message}</div>;
  if (data.data.response.edges.length === 0)
    return <div>No edges found, likely root or no connection to root. (see History tab)</div>;

  return (
    <div className="row mt-1">
      <div className="col-4">
        <select
          className="form-control"
          onChange={(e) => setSelectedId(e.target.value)}
          value={selectedId}
        >
          {data.data.response.edges.map((edge) => (
            <option key={edge.target_id} value={edge.target_id}>
              Node #{edge.target_id} (from state #{edge.source_id})
            </option>
          ))}
        </select>
      </div>
      <div className="col-8">
        <div className="btn-group col-12">
          <button className="btn btn-primary col-12" onClick={() => jumperFunction(selectedId)}>
            Jump to state #{selectedId}
          </button>
          <button
            className="btn btn-warning col-12"
            onClick={() => jumperFunction(selectedId, true)}
          >
            <b>destructively</b>
          </button>
        </div>
      </div>
    </div>
  );
}

PathHistory.propTypes = {
  jumperFunction: PropTypes.func.isRequired,
  requestPathHistory: PropTypes.func.isRequired,
};
