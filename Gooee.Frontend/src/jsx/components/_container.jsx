import React from "react";

const Container = ({
    children, onClick, style = null,
    className = null, onMouseEnter = null, onMouseLeave = null, title = null,
    description = null, toolTipFloat = "up", toolTipAlign = "center",
    stopClickPropagation = true, ignoreBubblingClick = false,
    dropdownMenu = null, dropdownFloat = "down", dropdownAlign = "left",
    dropdownCloseOnClick = false }) => {

    const react = window.$_gooee.react;
    const buttonRef = react.useRef(null);
    const dropdownRef = react.useRef(null);
    const [dropdownVisible, setDropdownVisible] = react.useState(false);

    const { AutoToolTip, ToolTipContent, FloatingElement } = window.$_gooee.framework;
    const hasToolTip = title && description;

    const handleClick = /*react.useCallback(*/(e) => {
        if (!onClick || ignoreBubblingClick && e.target !== e.currentTarget)
            return;

        if (stopClickPropagation)
            e.stopPropagation();
            
        if (onClick.length >= 1)
            onClick(e);
        else
            onClick();
    }/*, [disabled, ...watch])*/;

    const internalOnMouseEnter =(e) => {
        if (!onMouseEnter)
            return;

        if (leaveTimeout.current)
            clearTimeout(leaveTimeout.current);
            
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
        if (!onMouseLeave)
            return;
            
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
   
    const extraClass = className ? " " + className : "";
    const onDropdownClosed = () => {
        setDropdownVisible(false);
    };

    const getDropdownRef = (ref) => {
        dropdownRef.current = ref.current;
    };

    return <div ref={buttonRef} className={extraClass + (hasToolTip ? " p-relative" : "")} style={style}
        onMouseEnter={internalOnMouseEnter} onMouseLeave={internalOnMouseLeave} onClick={handleClick}>
        {children}
        {hasToolTip ? <AutoToolTip targetRef={buttonRef} float={toolTipFloat} align={toolTipAlign}>
            <ToolTipContent title={title} description={description} />
        </AutoToolTip> : null}
        {dropdownMenu ? <FloatingElement getRef={getDropdownRef} typeKey="ContainerDropdownMenu" visible={dropdownVisible}
            float={dropdownFloat} align={dropdownAlign}
            onHidden={onDropdownClosed} targetRef={buttonRef} closeOnClickOutside={true} closeOnClickInside={dropdownCloseOnClick}>
            {dropdownMenu}
        </FloatingElement> : null}
    </div>;
};

export default Container;