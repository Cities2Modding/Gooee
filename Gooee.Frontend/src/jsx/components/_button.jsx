import React from "react";

const Button = ({
    children, onClick, color = null, shade = null, style = null, elementStyle = null,
    size = null, className = null, disabled = null, isBlock = null, icon = null, border = null,
    circular = null, onMouseEnter = null, onMouseLeave = null, watch = [], title = null, description = null, toolTipFloat = "up", toolTipAlign = "center" }) => {

    const react = window.$_gooee.react;
    const buttonRef = react.useRef(null);

    const { AutoToolTip, ToolTipContent } = window.$_gooee.framework;
    const hasToolTip = title && description;

    const handleClick = /*react.useCallback(*/(e) => {
        if (disabled)
            return;
        if (onClick) {
            if (onClick.length >= 1)
                onClick(e);
            else
                onClick();
        }
        engine.trigger("audio.playSound", "select-item", 1);
    }/*, [disabled, ...watch])*/;

    const internalOnMouseEnter = /*react.useCallback(*/(e) => {
        if (disabled)
            return;

        engine.trigger("audio.playSound", "hover-item", 1);

        if (onMouseEnter)
            onMouseEnter();
    }/*, [disabled, ...watch])*/;

    const internalOnMouseLeave = /*react.useCallback(*/(e) => {
        if (disabled)
            return;
        if (onMouseLeave)
            onMouseLeave();
    }/*, [disabled, ...watch])*/;
    
    const circularClass = circular ? " btn-circular" : "";
    const shadeClass = shade ? `-${shade}` : "";
    const styleClass = style ? `-${style}` : "";
    const extraClass = className ? " " + className : "";
    const disabledClass = disabled ? " btn-disabled" : "";
    const blockClass = isBlock ? " btn-block" : "";
    const sizeClass = size ? ` btn-${size}` : "";
    const iconColorClass = icon ? ` btn-${color}${shadeClass}${border ? " border-icon" : ""}` : "";
    const btnClass = (icon ? `btn btn-icon${extraClass}${disabledClass}${sizeClass}${iconColorClass}${circularClass}` : `btn btn${styleClass}-${color}${shadeClass}${extraClass}${disabledClass}${blockClass}${sizeClass}`);
    return <div ref={buttonRef} className={btnClass + (hasToolTip ? " p-relative" : "" )} onMouseEnter={internalOnMouseEnter} onMouseLeave={internalOnMouseLeave} onClick={handleClick} style={elementStyle}>
        {children}
        {hasToolTip ? <AutoToolTip targetRef={buttonRef} float={toolTipFloat} align={toolTipAlign}>
            <ToolTipContent title={title} description={description} />
        </AutoToolTip> : null}
    </div>;
};

export default Button;