import { useContext } from "react";
import { InstanceDataContext } from "../InstanceViewer";
import PropTypes from "prop-types";

export default function HeadsViewer({ jumper }) {
  const { data, loading, error } = useContext(InstanceDataContext).instanceHeads;

  if (!data && !loading) return <div>No heads data</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error?.message}</div>;

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
      {data.data.response.nodes.map((head) => (
        <div key={head.state_id} className="card">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center gap-2">
            Head at #{head.state_id}
            <button onClick={() => jumper(head.state_id)} className="btn btn-primary">
              Jump to state
            </button>
          </div>
          <div className="card-body">
            <pre style={{ maxHeight: "25vh", overflowY: "auto" }} className="card-text">
              {head.state_contents.map((line, index) => (
                <div key={index}>{line.textual}</div>
              ))}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

HeadsViewer.propTypes = {
  jumper: PropTypes.func.isRequired,
};
