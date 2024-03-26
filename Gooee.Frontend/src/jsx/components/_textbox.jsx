import React from "react";

const TextBox = ({ className, style, text, onClick, onChange, onBlur, type = "text", size = null, disabled = null, rows = 1, maxLength = null, selectOnFocus = null, minValue = null, maxValue = null, onSanitize = null }) => {
    const react = window.$_gooee.react;
    const [value, setValue] = react.useState(text);
    const elementRef = react.useRef(null);

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

    const stripNumbers = (val) => {
        return val.replace(/\D/g, '');
    };

    const checkMaxLength = (val) => {
        if (maxLength && val && val.length > maxLength)
            return val.substring(0, maxLength);

        return val;
    };

    const numberValidation = (input) =>
    {
        let number = parseInt(input, 10);
        
        if (minValue != null && number < minValue) {
            number = minValue;
        }
        else if (maxValue != null && number > maxValue) {
            number = maxValue;
        }
        
        return number.toString();
    }

    const onValueChange = (val) => {
        let newVal = type === "number" ? stripNumbers(val) : val;
        newVal = checkMaxLength(newVal);

        if (type === "number") {
            if (!newVal || newVal.length === 0)
                newVal = "0";
            else
                newVal = numberValidation(newVal);
        }

        if (onSanitize)
            newVal = onSanitize(newVal);

        setValue(newVal);

        if (onChange)
            onChange(newVal);
    };

    const onDoubleClick = () => {
        if (selectOnFocus && elementRef && elementRef.current) {
            elementRef.current.focus()
            elementRef.current.setSelectionRange(0, elementRef.current.value.length);
        }
    };

    return rows === 1 ? <input ref={elementRef} type={type} className={classNames}
        onClick={onClick} onDoubleClick={onDoubleClick} onBlur={onBlur} onMouseEnter={onMouseEnter} onChange={(e) => onValueChange(e.target.value)} style={style} value={value} /> :
        <textarea ref={elementRef} rows={rows} className={classNames}
            onClick={onClick} onDoubleClick={onDoubleClick} onBlur={onBlur} onMouseEnter={onMouseEnter} onChange={(e) => onValueChange(e.target.value)} style={style}>{value}</textarea>;
};

export default TextBox;