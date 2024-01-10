import React from "react";

const RadioGroup = ({ style, onSelectionChanged, selected, options }) => {
    const react = window.$_gooee.react;
    const [internalValue, setInternalValue] = react.useState(selected);

    const { RadioItem } = window.$_gooee.framework;

    react.useEffect(() => {
        setInternalValue(selected);
    }, [selected]);    

    const changeSelection = (value) => {
        setInternalValue(value);

        if (onSelectionChanged)
            onSelectionChanged(value);
    };
    
    return <div className="form-radio-group" style={style}>
        {
            options.map((option, index) => (
                <div key={option.value} className="form-radio">
                    <RadioItem checked={internalValue === option.value} onToggle={() => changeSelection(option.value)} />
                    <label className="form-radio-label">{option.label}</label>
                </div>))
        }
    </div>;
};

export default RadioGroup;