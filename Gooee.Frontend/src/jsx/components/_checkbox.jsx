import React from 'react'

const CheckBox = ({ className, style, checked, onToggle }) => {
    const react = window.$_gooee.react;
    const [isChecked, setIsChecked] = react.useState(checked);

    const handleClick = () => {
        if (onToggle)
            onToggle(!checked);

        setIsChecked(!isChecked);
        engine.trigger("audio.playSound", "select-toggle", 1);
    }

    react.useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    const classNames = (isChecked ? "form-check-input checked" : "form-check-input") + (className ? " " + className : "" );
    
    const onMouseEnter = (e) => {
        if (e.target !== e.currentTarget)
            return;

        engine.trigger("audio.playSound", "hover-item", 1);
    };

    return <div className={classNames} onMouseEnter={onMouseEnter} style={style} onClick={handleClick}>
        <div className="icon mask-icon icon-check"></div>
    </div>;
};

export default CheckBox;