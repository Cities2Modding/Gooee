import React from "react";

const FormCheckBox = ({ className, label, checkClassName, style, checked, onToggle, reverseOrder = null }) => {
    const classNames = "form-check" + (className ? " " + className : "") + (reverseOrder ? " form-check-reverse" : "");
    const { CheckBox } = window.$_gooee.framework;

    const handleLabelClick = () => {
        if (onToggle)
            onToggle(!checked);
            
        engine.trigger("audio.playSound", "select-toggle", 1);
    }

    return <div className={classNames} style={style}>
        {reverseOrder ? <>
            {label ? <label className="form-check-label" onClick={handleLabelClick}>{label}</label> : null}
            <CheckBox className={checkClassName} checked={checked} onToggle={onToggle} />
        </> : <>
            <CheckBox className={checkClassName} checked={checked} onToggle={onToggle} />
            {label ? <label className="form-check-label" onClick={handleLabelClick}>{label}</label> : null}
        </>}
    </div>;
};

export default FormCheckBox;