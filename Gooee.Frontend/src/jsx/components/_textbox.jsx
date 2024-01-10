import React from "react";

const TextBox = ({ className, style, text, onChange, type = "text", size = null, disabled = null, rows = 1}) => {
    const react = window.$_gooee.react;
    const [value, setValue] = react.useState(text);    

    react.useEffect(() => {
        setValue(text);
    }, [text]);

    const sizeClass = size ? ` form-control-${size}` : "";
    const classNames = "form-control " + className + (disabled ? " input-disabled" : "") + sizeClass;
    
    const onMouseEnter = (e) => {
        if (e.target !== e.currentTarget || disabled)
            return;

        engine.trigger("audio.playSound", "hover-item", 1);
    };

    const onValueChange = (val) => {
        setValue(val);
        if (onChange)
            onChange(val);
    };

    return rows === 1 ? <input type={type} className={classNames} onMouseEnter={onMouseEnter} onChange={(e) => onValueChange(e.target.value)} style={style} value={value} /> :
        <textarea rows={rows} className={classNames} onMouseEnter={onMouseEnter} onChange={(e) => onValueChange(e.target.value)} style={style}>{value}</textarea>;
};

export default TextBox;