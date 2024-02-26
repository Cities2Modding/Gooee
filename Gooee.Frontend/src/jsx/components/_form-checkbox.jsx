import React from "react";

const FormCheckBox = ({ className, label, checkClassName, style, checked, onToggle }) => {
    const classNames = "form-check" + (className ? " " + className : "" );
    const { CheckBox } = window.$_gooee.framework;

    const handleLabelClick = () => {
        if (onToggle)
            onToggle(!checked);
            
        engine.trigger("audio.playSound", "select-toggle", 1);
    }

    return <div className={classNames} style={style}>
        <CheckBox className={checkClassName} checked={checked} onToggle={onToggle} />
        {label ? <label className="form-check-label" onClick={handleLabelClick}>{label}</label> : null}
    </div>;
};

export default FormCheckBox;