import { useState } from "react";
import { EFlintInstance } from "../../../lib/server";
import PropTypes from "prop-types";
import API_URL from "../../../../config";
import { useSearchParams } from "react-router-dom";

export default function EFlintSelector(props) {
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState("");
  const [filePath, setFilePath] = useState(searchParams.get("filePath") ?? "");
  const [isFileUploadMode, setIsFileUploadMode] = useState(!searchParams.get("filePath"));
  const [jsonValues, setJsonValues] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    setSelectedFile("");
    const file = event.target.files[0];
    setError(
      file && !file.name.endsWith(".eflint") ? new Error("File must be an eFLINT file") : null
    );
    setSelectedFile(file);
  };

  const handlePathChange = (event) => {
    setFilePath(event.target.value);
  };

  const toggleMode = () => {
    setIsFileUploadMode((prevMode) => !prevMode);
    setSelectedFile("");
    setFilePath("");
  };

  const launchInstance = async () => {
    setError(null);

    if (jsonValues) {
      try {
        JSON.parse(jsonValues);
      } catch (e) {
        setError(new Error("Invalid JSON"));
        return;
      }
    }

    const values = jsonValues ? JSON.parse(jsonValues) : {};

    try {
      if (selectedFile) {
        // TODO - transfer to server file
        const formData = new FormData();
        formData.append("fileToUpload", selectedFile);
        formData.append("values", JSON.stringify(values));

        await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData,
        });
      } else if (filePath) {
        try {
          await new EFlintInstance(null, filePath).launchInstance(values);
        } catch (e) {
          setError(e);
          return;
        }
      }
    } catch (e) {
      setError(e);
    } finally {
      setSelectedFile("");
      setFilePath("");
      props.onLaunch();
    }
  };

  return (
    <div className="container border rounded p-3">
      <h6>Launch eFLINT Instance</h6>
      {isFileUploadMode ? (
        <div className="mb-3">
          <label htmlFor="fileUpload" className="form-label">
            Select File
          </label>
          <input className="form-control" type="file" id="fileUpload" onChange={handleFileUpload} />
          {selectedFile && (
            <div className="mt-2">
              <b>Selected File:</b> {selectedFile.name}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3">
          <label htmlFor="filePath" className="form-label">
            Absolute Path
          </label>
          <input
            className="form-control"
            type="text"
            id="filePath"
            value={filePath}
            onChange={handlePathChange}
          />
        </div>
      )}
      <textarea
        className="form-control mb-3"
        placeholder="Enter values as JSON. Leave blank for defaults."
        rows="3"
        onChange={(e) => setJsonValues(e.target.value)}
      />
      <button
        className="btn btn-primary me-2"
        onClick={launchInstance}
        disabled={!selectedFile && !filePath}
      >
        {isFileUploadMode ? "Upload" : "Submit"}
      </button>
      <button className="btn btn-primary" onClick={toggleMode}>
        Switch to {isFileUploadMode ? "Launch Files from Path" : "Upload File"}
      </button>
      {error && <div className="alert alert-danger mt-3">{error.message}</div>}
    </div>
  );
}

EFlintSelector.propTypes = {
  onLaunch: PropTypes.func,
};
