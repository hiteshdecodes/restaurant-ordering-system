import React from 'react';

const CustomCheckbox = ({ id, checked, onChange, label, ...props }) => {
  return (
    <div className="checkbox-wrapper-custom">
      <input
        type="checkbox"
        id={id}
        className="inp-cbx"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <label htmlFor={id} className="cbx">
        <span>
          <svg viewBox="0 0 12 10" height="10px" width="12px">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </svg>
        </span>
        {label && <span>{label}</span>}
      </label>
    </div>
  );
};

export default CustomCheckbox;

