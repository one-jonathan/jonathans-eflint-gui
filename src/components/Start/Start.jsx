import { useNavigate } from "react-router-dom";
import { useInstances, EFlintInstance, killAllInstances } from "../../lib/server";
import EFlintSelector from "./components/EFlintSelector";
import LoadExport from "./components/LoadExport";

export default function Start() {
  const { instances, updateInstances } = useInstances();
  const navigate = useNavigate();

  const handleKillAllInstances = async () => {
    const shouldKillAll = window.confirm("Are you sure you want to kill all instances?");
    if (shouldKillAll) {
      await killAllInstances();
      updateInstances();
    }
  };

  const handleKillInstance = async (uuid) => {
    const shouldKill = window.confirm("Are you sure you want to kill this instance?");
    if (shouldKill) {
      await new EFlintInstance(uuid).killInstance();
      updateInstances();
    }
  };

  const handleViewInstance = (uuid) => {
    navigate(`/instances/${uuid}`);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <h3 className="fw-bold">Instances</h3>
          {instances.list && <h6>Instances Active: {instances.list.length}</h6>}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleKillAllInstances}
            hidden={!instances || instances.list?.length === 0}
          >
            Kill All Instances
          </button>
          <hr hidden={!instances || instances.list?.length === 0} />
          <ul className="list-group">
            {instances.list?.map((instance) => (
              <li className="list-group-item" key={instance.uuid}>
                <div className="d-flex justify-content-between align-items-top">
                  <div>
                    <div className="fw-bold">Instance (uuid: {instance.uuid})</div>
                    <small>{instance["source-file-name"]}</small>
                    <br />
                    <small>
                      Port <b>{instance.port}</b>, created: {instance.timestamp}
                    </small>
                    {instance["flint-search-path"] && (
                      <small>Flint-search-path: {instance["flint-search-path"]}</small>
                    )}
                  </div>
                  <div className="btn-group-vertical">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewInstance(instance.uuid)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-danger px-4"
                      onClick={() => handleKillInstance(instance.uuid)}
                    >
                      Kill
                    </button>
                  </div>
                </div>
                <LoadExport uuid={instance.uuid} />
              </li>
            ))}
          </ul>
        </div>
        <div className="col-6">
          <div className="sticky-top pt-5">
            <EFlintSelector onLaunch={updateInstances} />
          </div>
        </div>
      </div>
    </div>
  );
}
