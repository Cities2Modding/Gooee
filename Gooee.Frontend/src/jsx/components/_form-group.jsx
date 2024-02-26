import React from "react";

const FormGroup = ({ children, className, style, label = null, labelClassName = null, description = null }) => {
    const classNames = "form-group" + (className ? " " + className : "");
    const labelClassNames = ( description? "mb-0": "" ) + (labelClassName ? " " + labelClassName : "");

    const labelMarkup = label ? <label className={labelClassNames}>{label}</label> : null;
    const descriptionMarkup = description ? <p className="text-muted mb-2" cohinline="cohinline">{description}</p> : null;
    return <div className={classNames} style={style}>
        {labelMarkup}
        {descriptionMarkup}
        {children}
    </div>;
};

export default FormGroup;