import React from "react";

const CheckBoxGroup = ({ style, onChecked, selected, options }) => {
    const react = window.$_gooee.react;
    const [internalValue, setInternalValue] = react.useState([]);

    const { CheckBox } = window.$_gooee.framework;

    react.useEffect(() => {
        if (selected) {
            const arry = internalValue;
            arry.push(selected);
            setInternalValue(arry);
        }
    }, [selected]);    

    const onCheck = (value) => {
        const arry = internalValue;
        arry.push(value);
        setInternalValue(arry);

        if (onChecked)
            onChecked(value);
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
                    <CheckBox checked={contains(index)} onToggle={() => onCheck(option.value)} />
                    <label className="form-check-label">{option.label}</label>
                </div>))
        }
    </div>;
};

export default CheckBoxGroup;