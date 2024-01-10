import React from "react";

const FormGroup = ({ children, className, style, label = null }) => {
    const classNames = "form-group" + (className ? " " + className : "");

    const labelMarkup = label ? <label>{label}</label> : null;
    return <div className={classNames} style={style}>
        {labelMarkup}
        {children}
    </div>;
};

export default FormGroup;