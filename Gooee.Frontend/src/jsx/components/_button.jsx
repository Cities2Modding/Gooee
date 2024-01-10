import React from "react";

const Button = ({ children, onClick, color = null, shade = null, style = null, size = null, className = null, disabled = null, isBlock = null, icon = null, border = null, circular = null }) => {
    const handleClick = () => {
        if (disabled)
            return;
        if (onClick)
            onClick();
        engine.trigger("audio.playSound", "select-item", 1);
    }
    
    const onMouseEnter = (e) => {
        if (disabled)
            return;
        engine.trigger("audio.playSound", "hover-item", 1);
    };

    const circularClass = circular ? " btn-circular" : "";
    const shadeClass = shade ? `-${shade}` : "";
    const styleClass = style ? `-${style}` : "";
    const extraClass = className ? " " + className : "";
    const disabledClass = disabled ? " btn-disabled" : "";
    const blockClass = isBlock ? " btn-block" : "";
    const sizeClass = size ? ` btn-${size}` : "";
    const iconColorClass = icon ? ` btn-${color}${shadeClass}${border ? " border-icon" : ""}` : "";
    const btnClass = (icon ? `btn btn-icon${extraClass}${disabledClass}${sizeClass}${iconColorClass}${circularClass}` : `btn btn${styleClass}-${color}${shadeClass}${extraClass}${disabledClass}${blockClass}${sizeClass}`);
    return <div className={btnClass} onMouseEnter={onMouseEnter} onClick={handleClick}>
        {children}
    </div>;
};

export default Button;