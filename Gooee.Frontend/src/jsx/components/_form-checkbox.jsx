import React from "react";

const FormCheckBox = ({ className, label, checkClassName, style, checked, onToggle }) => {
    const classNames = "form-check" + (className ? " " + className : "" );
    const { CheckBox } = window.$_gooee.framework;

    return <div className={classNames} style={style}>
        <CheckBox className={checkClassName} checked={checked} onToggle={onToggle} />
        <label className="form-check-label">{label}</label>
    </div>;
};

export default FormCheckBox;