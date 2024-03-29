import React from "react";

const Button = ({
    children, onClick, color = null, shade = null, style = null, elementStyle = null,
    size = null, className = null, disabled = null, isBlock = null, icon = null, border = null,
    circular = null, onMouseEnter = null, onMouseLeave = null, watch = [], title = null,
    description = null, toolTipFloat = "up", toolTipAlign = "center", stopClickPropagation = true, ignoreBubblingClick = false,
    dropdownMenu = null, dropdownFloat = "down", dropdownAlign = "left", dropdownCloseOnClick = false }) => {

    const react = window.$_gooee.react;
    const buttonRef = react.useRef(null);
    const dropdownRef = react.useRef(null);
    const [dropdownVisible, setDropdownVisible] = react.useState(false);

    const { AutoToolTip, ToolTipContent, FloatingElement } = window.$_gooee.framework;
    const hasToolTip = title && description;

    const handleClick = /*react.useCallback(*/(e) => {
        if (disabled || ignoreBubblingClick && e.target !== e.currentTarget)
            return;

        if (stopClickPropagation)
            e.stopPropagation();

        if (onClick) {
            if (onClick.length >= 1)
                onClick(e);
            else
                onClick();
        }
        engine.trigger("audio.playSound", "select-item", 1);
    }/*, [disabled, ...watch])*/;

    const internalOnMouseEnter =(e) => {
        if (disabled)
            return;

        if (leaveTimeout.current)
            clearTimeout(leaveTimeout.current);

        engine.trigger("audio.playSound", "hover-item", 1);

        if (onMouseEnter)
            onMouseEnter();

        if (dropdownMenu)
            setDropdownVisible(true);
    };

    const leaveTimeout = react.useRef(null);

    react.useEffect(() => {
        // Cleanup timeout on component unmount
        return () => clearTimeout(leaveTimeout.current);
    }, []);

    const internalOnMouseLeave = (e) => {
        if (disabled)
            return;

        if (onMouseLeave)
            onMouseLeave();

        if (dropdownMenu) {
            const isHTMLElement = e.relatedTarget instanceof HTMLElement;

            leaveTimeout.current = setTimeout(() => {
                if (dropdownRef.current &&
                    (!isHTMLElement || (isHTMLElement && !dropdownRef.current.contains(e.relatedTarget)))) {
                    setDropdownVisible(false);
                }
            }, 250);
        }
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

    const onDropdownClosed = () => {
        setDropdownVisible(false);
    };

    const getDropdownRef = (ref) => {
        dropdownRef.current = ref.current;
    };

    return <div ref={buttonRef} className={btnClass + (hasToolTip ? " p-relative" : "")} onMouseEnter={internalOnMouseEnter} onMouseLeave={internalOnMouseLeave} onClick={handleClick} style={elementStyle}>
        {children}
        {hasToolTip ? <AutoToolTip targetRef={buttonRef} float={toolTipFloat} align={toolTipAlign}>
            <ToolTipContent title={title} description={description} />
        </AutoToolTip> : null}
        {dropdownMenu ? <FloatingElement getRef={getDropdownRef} typeKey="ButtonDropdownMenu" visible={dropdownVisible}
            float={dropdownFloat} align={dropdownAlign}
            onHidden={onDropdownClosed} targetRef={buttonRef} closeOnClickOutside={true} closeOnClickInside={dropdownCloseOnClick}>
            {dropdownMenu}
        </FloatingElement> : null}
    </div>;
};

export default Button;