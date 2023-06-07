import { useState } from "react";
import PropTypes from "prop-types";
import { EFlintInstance } from "../../../lib/server";

export default function LoadExport({ uuid }) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleFileChange = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      const contents = await readFileAsText(file);
      const jsonData = JSON.parse(contents);
      const instance = new EFlintInstance(uuid);
      const result = await instance.load_export(jsonData);
      alert(result.data.response?.response + "\n" + (result.data.response?.message ?? ""));
      setLoaded(true);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (event) => reject(event.target.error);
      reader.readAsText(file);
    });
  };

  const getErrorMessage = (error) => {
    if (error instanceof SyntaxError) {
      return "Invalid JSON file";
    } else {
      return "Could not load export";
    }
  };

  return (
    <div
      className="border mt-2 px-2 py-1 rounded bg-light d-flex justify-content-between align-items-center"
      style={{ fontSize: "0.8rem" }}
    >
      {loaded ? (
        <b>Exported File Loaded on Instance!</b>
      ) : (
        <>
          <b>Load Exported File (json) on Instance: </b>
          <input type="file" accept=".json" onChange={handleFileChange} disabled={loading} />
        </>
      )}
    </div>
  );
}

LoadExport.propTypes = {
  uuid: PropTypes.string.isRequired,
};
