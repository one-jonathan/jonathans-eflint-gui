import PropTypes from "prop-types";

export default function TransitionTable({ data, handlePhraseExecution, terminate }) {
  const executeTransition = (textual) => handlePhraseExecution(textual + ".");

  const renderTransitionRows = () => {
    if (data.length === 0)
      return (
        <tr>
          <td colSpan="3">No transitions</td>
        </tr>
      );

    return data.map((item, index) => (
      <tr key={index} className={item._new ? "table-success" : ""}>
        <td>{item["fact-type"]}</td>
        <td>{item.arguments.map((arg) => arg["textual"]).join(", ")}</td>
        {renderExecuteButton(item)}
        <td className="align-middle">
          <button className="btn btn-primary btn-sm py-0 col-12" onClick={() => terminate(item)}>
            Terminate
          </button>
        </td>
      </tr>
    ));
  };

  const renderExecuteButton = (item) => {
    if (!handlePhraseExecution) return null;

    return (
      <td className="align-middle">
        <div className="d-flex justify-content-between align-items-center">
          {item._enabled ? "✔️" : "❌"}
          <button
            className="btn btn-primary btn-sm py-0 col-10"
            onClick={() => executeTransition(item["textual"])}
          >
            Execute
          </button>
        </div>
      </td>
    );
  };

  return (
    <table
      className="table table-striped table-bordered table-sm my-2"
      style={{ fontSize: "0.8rem" }}
    >
      <thead>
        <tr>
          <th>Fact Type</th>
          <th>Arguments</th>
          {handlePhraseExecution && data.length > 0 && <th>Execute Transition</th>}
          <th>Terminate</th>
        </tr>
      </thead>
      <tbody>{renderTransitionRows()}</tbody>
    </table>
  );
}

TransitionTable.propTypes = {
  data: PropTypes.array,
  handlePhraseExecution: PropTypes.func,
  terminate: PropTypes.func,
};
