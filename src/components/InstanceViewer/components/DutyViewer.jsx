import PropTypes from "prop-types";
import { useState } from "react";

function DutyView({ data, newData, violations }) {
  const factTypes = {};
  const [selectedTag, setSelectedTag] = useState("");

  data.forEach((value) => {
    const factType = value["fact-type"];
    if (!factTypes[factType]) {
      factTypes[factType] = [];
    }
    factTypes[factType].push(value);
  });

  if (Object.keys(factTypes).length === 0) {
    return <div>No duties in the current state</div>;
  }

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  const filteredFactTypes = selectedTag ? factTypes[selectedTag] : Object.values(factTypes).flat();

  const myNewData = newData.map((value) => JSON.stringify(value));

  const hasViolation = (value) => {
    return violations.some((violation) => violation.value.textual === value.textual);
  };

  return (
    <div style={{ fontSize: "0.8rem", maxHeight: "50vh", overflowY: "auto" }}>
      <select className="form-select form-select-sm mb-3" onChange={handleTagChange}>
        <option value="">Show All Duties</option>
        {Object.keys(factTypes).map((factType) => (
          <option key={factType} value={factType}>
            {factType} ({factTypes[factType].length})
          </option>
        ))}
      </select>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Fact Type</th>
            <th>Tagged Type</th>
            <th>Textual</th>
            <th>Violated?</th>
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
              <td>
                {hasViolation(value) && <div className="bg-danger text-white">Violation</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DutyView.propTypes = {
  data: PropTypes.array,
  newData: PropTypes.array,
  violations: PropTypes.array,
};

export default DutyView;
