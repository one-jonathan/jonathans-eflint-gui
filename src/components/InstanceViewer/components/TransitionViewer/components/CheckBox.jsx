import PropTypes from "prop-types";

export default function CheckBox({ id, label, checked, onChange }) {
  return (
    <div className="form-check" style={{ minHeight: "unset" }}>
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}

CheckBox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};
