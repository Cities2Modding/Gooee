import React from "react";

const CheckBoxGroup = ({ style, onChecked, selected, options }) => {
    const react = window.$_gooee.react;
    const [internalValue, setInternalValue] = react.useState([]);

    const { CheckBox } = window.$_gooee.framework;

    react.useEffect(() => {
        if (selected) {
            setInternalValue(selected);
        }
    }, [selected]);    

    const onCheck = (value, isChecked) => {
        const arry = internalValue;
        if (isChecked)
            arry.push(value);
        else
            arry.remove(value);

        setInternalValue(arry);

        if (onChecked)
            onChecked(value, isChecked);
    };

    const contains = (value) => {
        if (!internalValue)
            return;
            
        return internalValue.filter(e => e.value === value).length > 0;
    };
    
    return <div className="form-check-group" style={style}>
        {
            options.map((option, index) => (
                <div key={option.value} className="form-check">
                    <CheckBox checked={contains(option.value)} onToggle={(val) => onCheck(option.value, val)} />
                    <label className="form-check-label">{option.label}</label>
                </div>))
        }
    </div>;
};

export default CheckBoxGroup;