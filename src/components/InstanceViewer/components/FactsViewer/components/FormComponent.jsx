import { useState } from "react";
import PropTypes from "prop-types";

export default function FormComponent({ createFunction }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const taggedType = form.elements["tagged-type"].value;
    const factType = form.elements["fact-type"].value;
    const value = form.elements["value"].value;
    const textual = form.elements["textual"].value;

    const validateValue = (value) => {
      try {
        const parsed = JSON.parse(value);
        return { value: parsed, type: "json" };
      } catch (e) {
        // Not JSON, continue to check other types
      }
      const checkInt = parseInt(value, 10);
      if (!isNaN(checkInt)) {
        return { value: checkInt, type: "int" };
      }
      if (typeof value === "string") {
        return { value: value, type: "string" };
      }

      throw new Error("Invalid value");
    };

    const createValue = {
      "tagged-type": taggedType,
      "fact-type": factType,
      textual: textual,
    };

    try {
      const validatedValue = validateValue(value);
      if (validatedValue.type === "json") {
        createValue.arguments = validatedValue.value;
      } else {
        createValue.value = validatedValue.value;
      }
    } catch (e) {
      alert("Invalid value");
      return;
    }

    setLoading(true);
    createFunction(createValue).then(() => {
      setLoading(false);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="row">
      <h5>Create Fact</h5>
      <div className="col-md-3 form-group">
        <label htmlFor="fact-type">Fact Type</label>
        <input type="text" className="form-control" id="fact-type" required />
      </div>
      <div className="col-md-3 form-group">
        <label htmlFor="tagged-type">Tagged Type</label>
        <input type="text" className="form-control" id="tagged-type" required />
      </div>{" "}
      <div className="col-md-3 form-group">
        <label htmlFor="value">Value</label>
        <input type="text" className="form-control" id="value" required />
        <small>
          <i>Enter composite in JSON</i>
        </small>
      </div>
      <div className="col-md-3 form-group">
        <label htmlFor="textual">Textual</label>
        <textarea className="form-control" id="textual" rows="2" required></textarea>
      </div>
      <div className="col-12">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Create
        </button>
      </div>
    </form>
  );
}

FormComponent.propTypes = {
  createFunction: PropTypes.func.isRequired,
};
