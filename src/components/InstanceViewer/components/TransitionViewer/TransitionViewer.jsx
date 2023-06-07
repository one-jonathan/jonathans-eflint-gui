import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import CheckBox from "./components/CheckBox";
import TransitionTable from "./components/TransitionTable";

export default function TransitionViewer({
  enabled,
  newEnabled,
  disabled,
  newDisabled,
  handlePhraseExecution,
  terminateValue,
}) {
  const [showNew, setShowNew] = useState(true);
  const [showNewEnabled, setShowNewEnabled] = useState(true);
  const [showDisabled, setShowDisabled] = useState(false);
  const [showNewDisabled, setShowNewDisabled] = useState(false);
  const [selectedFactTypes, setSelectedFactTypes] = useState([]);
  const [selectedArguments, setSelectedArguments] = useState([]);

  const data = useMemo(() => {
    return [
      ...(showNewEnabled ? newEnabled : []),
      ...(showNew ? enabled : []),
      ...(showDisabled ? disabled : []),
      ...(showNewDisabled ? newDisabled : []),
    ];
  }, [
    showNewEnabled,
    showNew,
    showDisabled,
    showNewDisabled,
    enabled,
    newEnabled,
    disabled,
    newDisabled,
  ]);

  const stringifyAndMap = (array) => array.map(JSON.stringify);

  const jsonedNewEnabled = stringifyAndMap(newEnabled);
  const jsonedEnabled = stringifyAndMap(enabled);
  const jsonedDisabled = stringifyAndMap(disabled);
  const jsonedNewDisabled = stringifyAndMap(newDisabled);

  data.forEach((value) => {
    const jsonString = JSON.stringify(value);

    value._new = jsonedNewEnabled.includes(jsonString);
    value._enabled = jsonedEnabled.includes(jsonString) && !jsonedDisabled.includes(jsonString);
    value._new = jsonedNewDisabled.includes(jsonString) ? true : value._new;
  });

  // remove duplicates
  const filteredData = useMemo(() => {
    const uniqueData = [...new Set(data.map(JSON.stringify))].map(JSON.parse);
    return uniqueData;
  }, [data]);

  const displayData = useMemo(() => {
    const data = filteredData
      .filter((value) =>
        selectedFactTypes.length > 0 ? selectedFactTypes.includes(value["fact-type"]) : true
      )
      .filter((value) =>
        selectedArguments.length > 0
          ? value.arguments.some((argument) => selectedArguments.includes(argument["textual"]))
          : true
      );
    return data;
  }, [filteredData, selectedFactTypes, selectedArguments]);

  const factTypes = useMemo(() => {
    const types = {};
    filteredData.forEach((value) => {
      if (!types[value["fact-type"]]) {
        types[value["fact-type"]] = [];
      }
      types[value["fact-type"]].push(value);
    });
    return types;
  }, [filteredData]);

  // arguments name is reserved
  const myArguments = useMemo(() => {
    const argumentsMap = {};
    filteredData.forEach((value) => {
      value.arguments.forEach((argument) => {
        if (!argumentsMap[argument["textual"]]) {
          argumentsMap[argument["textual"]] = [];
        }
        argumentsMap[argument["textual"]].push(value);
      });
    });
    return argumentsMap;
  }, [filteredData]);

  useEffect(() => {
    setSelectedFactTypes([]);
    setSelectedArguments([]);
  }, [showNew, showNewEnabled, showDisabled, showNewDisabled]);

  const handleToggle = (setter) => {
    setter((prevState) => !prevState);
  };

  const handleFactTypeToggle = (factType) => {
    setSelectedFactTypes((prevSelectedFactTypes) => {
      if (prevSelectedFactTypes.includes(factType)) {
        return prevSelectedFactTypes.filter((value) => value !== factType);
      }
      return [...prevSelectedFactTypes, factType];
    });
  };

  const handleArgumentToggle = (argument) => {
    setSelectedArguments((prevSelectedArguments) => {
      if (prevSelectedArguments.includes(argument)) {
        return prevSelectedArguments.filter((value) => value !== argument);
      }
      return [...prevSelectedArguments, argument];
    });
  };

  return (
    <div className="p-2">
      <div className="row gx-2" style={{ fontSize: "0.8rem" }}>
        <div className="col-4">
          <div
            className="border rounded h-100 p-2"
            style={{ maxHeight: "10vh", overflowY: "auto" }}
          >
            <CheckBox
              id="showNew"
              label={`Enabled (${enabled.length})`}
              checked={showNew}
              onChange={() => handleToggle(setShowNew)}
            />
            <CheckBox
              id="showNewEnabled"
              label={`New enabled (${newEnabled.length})`}
              checked={showNewEnabled}
              onChange={() => handleToggle(setShowNewEnabled)}
            />
            <CheckBox
              id="showDisabled"
              label={`Disabled (${disabled.length})`}
              checked={showDisabled}
              onChange={() => handleToggle(setShowDisabled)}
            />
            <CheckBox
              id="showNewDisabled"
              label={`New disabled (${newDisabled.length})`}
              checked={showNewDisabled}
              onChange={() => handleToggle(setShowNewDisabled)}
            />
          </div>
        </div>
        {Object.keys(factTypes).length > 0 && (
          <div className="col-4">
            <div
              className="border rounded h-100 p-2"
              style={{ maxHeight: "10vh", overflowY: "auto" }}
            >
              {Object.keys(factTypes).map((factType, index) => (
                <CheckBox
                  key={index}
                  id={factType}
                  label={`${factType} (${factTypes[factType].length})`}
                  checked={selectedFactTypes.includes(factType)}
                  onChange={() => handleFactTypeToggle(factType)}
                />
              ))}
            </div>
          </div>
        )}
        {Object.keys(myArguments).length > 0 && (
          <div className="col-4">
            <div
              className="border rounded h-100 p-2"
              style={{ maxHeight: "10vh", overflowY: "auto" }}
            >
              {Object.keys(myArguments).map((argument, index) => (
                <CheckBox
                  key={index}
                  id={argument}
                  label={`${argument} (${myArguments[argument].length})`}
                  checked={selectedArguments.includes(argument)}
                  onChange={() => handleArgumentToggle(argument)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <TransitionTable
        data={displayData}
        handlePhraseExecution={handlePhraseExecution}
        terminate={terminateValue}
      />
    </div>
  );
}

TransitionViewer.propTypes = {
  enabled: PropTypes.array,
  newEnabled: PropTypes.array,
  disabled: PropTypes.array,
  newDisabled: PropTypes.array,
  handlePhraseExecution: PropTypes.func,
  terminateValue: PropTypes.func,
};
