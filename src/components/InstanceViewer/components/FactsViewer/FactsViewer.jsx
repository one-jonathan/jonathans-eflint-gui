import { useContext, useState } from "react";
import PropTypes from "prop-types";
import { InstanceDataContext } from "../../InstanceViewer";
import FormComponent from "./components/FormComponent";

export default function FactsView({ newData = [], terminateFunction, createFunction }) {
  const { data, loading, error } = useContext(InstanceDataContext).instanceFacts;
  const [selectedTag, setSelectedTag] = useState("");

  if (data === null && !loading) {
    return <div>No facts data</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  const factTypes = data?.data?.response?.values.reduce((types, value) => {
    if (!types[value["fact-type"]]) {
      types[value["fact-type"]] = [];
    }
    types[value["fact-type"]].push(value);
    return types;
  }, {});

  if (!factTypes || Object.keys(factTypes).length === 0) {
    return <div>No facts in current state</div>;
  }

  const myNewData = newData.map((value) => JSON.stringify(value));

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const filteredFactTypes = selectedTag ? factTypes[selectedTag] : Object.values(factTypes).flat();
  const showValue = filteredFactTypes.some((value) => value.value);

  const handleTerminate = (value) => {
    terminateFunction(value);
  };

  return (
    <div>
      <select className="form-select mb-3" onChange={handleTagChange}>
        <option value="">Show All Facts</option>
        {Object.entries(factTypes).map(([factType, values]) => (
          <option key={factType} value={factType}>
            {factType} ({values.length})
          </option>
        ))}
      </select>
      <div style={{ maxHeight: "50vh", overflowY: "auto" }} className="mb-3 border">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Fact Type</th>
              <th>Tagged Type</th>
              <th>Textual</th>
              {showValue && <th>Value</th>}
              <th>Terminate</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactTypes.map((value, index) => (
              <tr
                key={index}
                className={myNewData.includes(JSON.stringify(value)) ? "table-success" : ""}
              >
                <td>{value["fact-type"]}</td>
                <td>{value["tagged-type"]}</td>
                <td>{value.textual}</td>
                {showValue && (
                  <td>{isNaN(value.value) ? JSON.stringify(value.value) : Number(value.value)}</td>
                )}
                <td>
                  <button
                    className="btn btn-danger btn-sm col-12"
                    onClick={() => handleTerminate(value)}
                  >
                    Terminate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormComponent createFunction={createFunction} />
    </div>
  );
}

FactsView.propTypes = {
  newData: PropTypes.array,
  terminateFunction: PropTypes.func,
  createFunction: PropTypes.func,
};
