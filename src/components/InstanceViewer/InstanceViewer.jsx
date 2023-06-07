import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { EFlintInstance } from "../../lib/server";
import PropTypes from "prop-types";
import HistoryViewer from "./components/HistoryViewer";
import TransitionViewer from "./components/TransitionViewer/TransitionViewer";
import FactsView from "./components/FactsViewer/FactsViewer";
import DutyView from "./components/DutyViewer";
import HeadsViewer from "./components/HeadsViewer";
import PathHistory from "./components/PathHistory";
import useInstanceData from "./dataManager";

export const InstanceDataContext = createContext();

export default function InstanceViewer() {
  const { uuid } = useParams();
  const instance = useMemo(() => new EFlintInstance(uuid), [uuid]);

  const [selectedMenu, setSelectedMenu] = useState("default");
  const [instanceStatus, setInstanceStatus] = useState(null);
  const [requestedPathHistory, setRequestedPathHistory] = useState(false);
  const contextData = useInstanceData(instance, instanceStatus, selectedMenu, requestedPathHistory);

  const [loading, setLoading] = useState(false);

  const updateInstanceStatus = useCallback(async () => {
    return await instance.status();
  }, [instance]);

  useEffect(() => {
    setLoading(true);
    updateInstanceStatus()
      .then((result) => {
        setInstanceStatus(result);
      })
      .catch(() => {
        setInstanceStatus(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [updateInstanceStatus, uuid]);

  useEffect(() => {
    setRequestedPathHistory(false);
  }, [instanceStatus]);

  // why not use the returned data from e.g. instance.jump()?
  // it appears that violations are not updated immediately after a jump
  // so better to just fetch the status again

  const handlePhraseExecution = async (phrase) => {
    setLoading(true);
    let myPhrase = phrase.replace(/\.$/, "");
    const result = await instance.executePhrase(myPhrase).catch(() => {
      setLoading(false);
      return;
    });
    console.log(myPhrase, result);
    if (result.data.response.error) {
      alert(result.data.response.response + ":" + result.data.response.error);
      setLoading(false);
      return;
    }
    if (result.data.response.errors.length > 0) {
      alert(
        result.data.response.errors[0]["error-type"] +
          ": " +
          result.data.response.errors[0]["error"]
      );
    } else if (result.data.response.response !== "success") {
      alert(result.data.response?.message ?? "Unknown error");
      setLoading(false);
      return;
    }
    updateInstanceStatus().then((result) => {
      setInstanceStatus(result);
      setLoading(false);
    });
  };

  const jumperFunction = async (state_id, destructive = false) => {
    setLoading(true);
    const result = destructive ? await instance.revert(state_id) : await instance.jump(state_id);
    if (result.data.response.response !== "success") {
      alert(result.data?.response?.response ?? "Unknown error");
      setLoading(false);
      return;
    }
    updateInstanceStatus().then((result) => {
      setInstanceStatus(result);
      setLoading(false);
    });
  };

  const terminateFunction = async (value) => {
    setLoading(true);
    const result = await instance.terminate(value);
    if (result.data.response.response !== "success") {
      alert(result.data?.response?.response ?? "Unknown error");
      setLoading(false);
      return;
    }
    updateInstanceStatus().then((result) => {
      setInstanceStatus(result);
      setLoading(false);
    });
  };

  const createFunction = async (value) => {
    setLoading(true);
    const result = await instance.create(value);
    if (result.data.response.response !== "success") {
      alert(result.data?.response?.response ?? "Unknown error");
      setLoading(false);
      return;
    }
    if (result.data.response.errors.length > 0) {
      alert(
        result.data.response.errors[0]["error-type"] +
          ": " +
          result.data.response.errors[0]["error"]
      );
    }
    updateInstanceStatus().then((result) => {
      setInstanceStatus(result);
      setLoading(false);
    });
  };

  const requestPathHistory = () => setRequestedPathHistory(true);

  if (loading || !instanceStatus)
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );

  const old_server_state_id = instanceStatus?.data.response["old-state"];
  const new_server_state_id = instanceStatus?.data.response["new-state"];

  // Instance Header
  const InstanceHeader = ({ instance, newServerStateId, oldServerStateId, instanceStatus }) => {
    return (
      <div className="d-flex flew-row justify-content-between">
        <div>
          <b>Instance UUID {instance.uuid}</b>
          {" in "}
          <b>{newServerStateId ? `state #${newServerStateId}` : "unknown state"}</b>
          <br />
          <b>
            <div className="badge bg-info">
              Errors: {instanceStatus.data.response["errors"].length}
            </div>
            <div className="badge mx-2 bg-info">
              status response: {instanceStatus.data.response["response"]}
            </div>
          </b>
        </div>
        <div>
          {parseInt(oldServerStateId) > 1 && oldServerStateId !== newServerStateId && (
            <div className="btn-group col-12">
              <button className="btn btn-primary" onClick={() => jumperFunction(oldServerStateId)}>
                Jump back to previous server state #{oldServerStateId}
              </button>
              <button
                className="btn btn-warning"
                onClick={() => jumperFunction(oldServerStateId, true)}
              >
                <b>destructively</b>
              </button>
            </div>
          )}
          <div>
            <PathHistory jumperFunction={jumperFunction} requestPathHistory={requestPathHistory} />
          </div>
        </div>
      </div>
    );
  };

  InstanceHeader.propTypes = {
    instance: PropTypes.instanceOf(EFlintInstance).isRequired,
    newServerStateId: PropTypes.number.isRequired,
    oldServerStateId: PropTypes.number.isRequired,
    instanceStatus: PropTypes.object.isRequired,
  };

  // NavigationMenu
  const NavigationMenu = ({ selectedMenu, setSelectedMenu }) => {
    const menus = ["default", "history", "facts", "heads"];

    return (
      <ul className="nav nav-tabs">
        {menus.map((menu) => (
          <li className="nav-item" key={menu}>
            <button
              className={`nav-link pe-auto${selectedMenu === menu ? " active" : ""}`}
              onClick={() => setSelectedMenu(menu)}
            >
              {menu.charAt(0).toUpperCase() + menu.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  NavigationMenu.propTypes = {
    selectedMenu: PropTypes.string.isRequired,
    setSelectedMenu: PropTypes.func.isRequired,
  };

  // ChangesSummary
  const ChangesSummary = ({ instanceStatus }) => {
    const {
      terminated_facts,
      created_facts,
      "new-disabled-transitions": new_disabled_transitions,
      "new-enabled-transitions": new_enabled_transitions,
      "new-duties": new_duties,
    } = instanceStatus.data.response;

    const changeItems = [
      { key: "terminated_facts", label: "Terminated facts", data: terminated_facts },
      { key: "created_facts", label: "Created facts", data: created_facts },
      {
        key: "new_disabled_transitions",
        label: "New disabled transitions",
        data: new_disabled_transitions,
      },
      {
        key: "new_enabled_transitions",
        label: "New enabled transitions",
        data: new_enabled_transitions,
      },
      { key: "new_duties", label: "New duties", data: new_duties },
    ];

    return (
      <ul className="list-group">
        {changeItems.map(
          (item) =>
            item.data.length > 0 && (
              <li
                className="list-group-item d-flex align-items-center justify-content-between"
                key={item.key}
              >
                <b>
                  {item.data.length} {item.label}
                </b>
                {item.key === "created_facts" && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedMenu("facts")}
                  >
                    Show
                  </button>
                )}
              </li>
            )
        )}
        {changeItems.every((item) => item.data.length === 0) && (
          <li className="list-group-item">
            <b>No changes</b>
          </li>
        )}
      </ul>
    );
  };

  ChangesSummary.propTypes = {
    instanceStatus: PropTypes.shape({
      data: PropTypes.shape({
        response: PropTypes.shape({
          terminated_facts: PropTypes.array,
          created_facts: PropTypes.array,
          "new-disabled-transitions": PropTypes.array,
          "new-enabled-transitions": PropTypes.array,
          "new-duties": PropTypes.array,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  };

  // ContentContainer
  const ContentContainer = ({ selectedMenu, instanceStatus, newServerStateId, jumperFunction }) => {
    const [phraseInput, setPhraseInput] = useState("");

    switch (selectedMenu) {
      case "history":
        return <HistoryViewer currentStateId={newServerStateId} jumper={jumperFunction} />;
      case "facts":
        return (
          <FactsView
            newData={instanceStatus.data.response["created_facts"]}
            terminateFunction={terminateFunction}
            createFunction={createFunction}
          />
        );
      case "heads":
        return <HeadsViewer jumper={jumperFunction} />;
      default:
        return (
          <div className="row">
            <div className="col-4">
              <div className="pb-1">Changes compared to previous server state:</div>
              <ChangesSummary instanceStatus={instanceStatus} />
            </div>
            <div className="col-8">
              <textarea
                className="form-control p-3"
                rows="4"
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
                placeholder="Enter eFLINT phrase here"
              />
              <button
                className="btn btn-primary mt-2"
                onClick={async () => {
                  await handlePhraseExecution(phraseInput);
                  setPhraseInput("");
                }}
              >
                Execute
              </button>
            </div>
            <div className="col-12">
              <hr />
            </div>
            <div className="col-md-7">
              <div className="card">
                <h5 className="card-header">Transitions</h5>
                <TransitionViewer
                  enabled={instanceStatus.data.response["all-enabled-transitions"]}
                  newEnabled={instanceStatus.data.response["new-enabled-transitions"]}
                  disabled={instanceStatus.data.response["all-disabled-transitions"]}
                  newDisabled={instanceStatus.data.response["new-disabled-transitions"]}
                  handlePhraseExecution={handlePhraseExecution}
                  terminateValue={terminateFunction}
                />
              </div>
            </div>
            <div className="col-md-5">
              <div className="card">
                <h5 className="card-header">Duties</h5>
                <div className="card-body">
                  <DutyView
                    data={instanceStatus.data.response["all-duties"]}
                    newData={instanceStatus.data.response["new-duties"]}
                    violations={instanceStatus.data.response["violations"].filter(
                      (violation) => violation.violation === "duty"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  ContentContainer.propTypes = {
    selectedMenu: PropTypes.string.isRequired,
    instanceStatus: PropTypes.object.isRequired,
    newServerStateId: PropTypes.number.isRequired,
    jumperFunction: PropTypes.func.isRequired,
  };

  if (instanceStatus)
    return (
      <InstanceDataContext.Provider value={contextData}>
        <div className="container">
          <div className="card">
            <div className="card-header">
              {instanceStatus && (
                <InstanceHeader
                  instance={instance}
                  newServerStateId={new_server_state_id}
                  oldServerStateId={old_server_state_id}
                  instanceStatus={instanceStatus}
                />
              )}
            </div>
            <div className="card-body pt-2">
              <NavigationMenu selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
              <div className="border border-top-0 p-2">
                <ContentContainer
                  selectedMenu={selectedMenu}
                  instanceStatus={instanceStatus}
                  newServerStateId={new_server_state_id}
                  jumperFunction={jumperFunction}
                />
              </div>
            </div>
          </div>
        </div>
      </InstanceDataContext.Provider>
    );
}
