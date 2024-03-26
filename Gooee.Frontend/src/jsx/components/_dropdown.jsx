import React from "react";
import ReactDOM from "react-dom";

const Dropdown = ({ style, className, toggleClassName, size, onSelectionChanged, selected, options, float = "down", scrollable = null }) => {
    const react = window.$_gooee.react;
    const [active, setActive] = react.useState(false);
    const [internalValue, setInternalValue] = react.useState(selected);
    const [portalContainer, setPortalContainer] = react.useState(null);
    const dropdownRef = react.useRef(null); // Ref to attach to the select field
    const menuRef = react.useRef(null); // Ref for the dropdown content
    const { Icon, Scrollable } = window.$_gooee.framework;

    // Function to check if the click is outside the dropdown
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
            menuRef.current && !menuRef.current.contains(event.target)) {
            setActive(false);
        }
    };

    react.useEffect(() => {
        // Create a single container for the portal if not already created
        if (!document.getElementById("gooee-select-portal")) {
            const container = document.createElement("div");
            container.id = "gooee-select-portal";
            document.body.appendChild(container);
            setPortalContainer(container);
        } else {
            setPortalContainer(document.getElementById("gooee-select-portal"));
        }

        // Add event listener to close the dropdown when clicking outside
        document.addEventListener("click", handleClickOutside, true);

        // Cleanup the event listener
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, []);

    react.useEffect(() => {
        setInternalValue(selected);
    }, [selected]);

    react.useEffect(() => {
        // Toggle the click listener based on dropdown state
        if (active) {
            document.addEventListener('click', handleClickOutside, true);
        } else {
            document.removeEventListener('click', handleClickOutside, true);
        }
    }, [active]);

    const getDropdownPosition = () => {
        if (dropdownRef.current && menuRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const menuRect = menuRef.current.getBoundingClientRect();

            if (float === "down") {
                return {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                };
            }
            else {
                return {
                    top: rect.top + window.scrollY - menuRect.height,
                    left: rect.left + window.scrollX,
                    width: rect.width
                };
            }
        }
        return {};
    };

    const onToggle = () => {
        setActive(!active);
        engine.trigger("audio.playSound", "select-dropdown", 1);
    };

    const changeSelection = (value) => {
        setInternalValue(value);
        engine.trigger("audio.playSound", "select-item", 1);
        if (onSelectionChanged)
            onSelectionChanged(value);
        setActive(false);
    };

    const onMouseEnter = (e) => {
        if (e.target !== e.currentTarget)
            return;

        engine.trigger("audio.playSound", "hover-item", 1);
    };


    const dropdownMenuClass = "dropdown-menu" + (size ? ` dropdown-menu-${size}` : "") + (!active ? " hidden" : "") + (float !== "down" ? ` dropdown-menu-${float}` : "");

    const getOptions = react.useMemo(() => {
        if (float === "up")
            return options.reverse();

        return options;
    }, [options, options.length, float]);

    const selectedIndex = !getOptions ? -1 : getOptions.findIndex(o => o.value === internalValue);

    const getOptionsMap = getOptions ?
        getOptions.map((option) => (
            <button key={option.value} className="dropdown-item" onMouseEnter={onMouseEnter} onClick={() => changeSelection(option.value)}>{option.label}</button>
        )) : null;

    // Define the dropdown content
    const dropdownContent = <div className={dropdownMenuClass} ref={menuRef} style={getDropdownPosition()}>
        {scrollable ? <Scrollable className="vh-40" startBottom={float === "up"} size="sm">{getOptionsMap}</Scrollable> : getOptionsMap}
    </div>;

    const classNames = (className ? `dropdown ${className}` : "dropdown") + (size ? ` dropdown-${size}` : "") + (scrollable ? " dropdown-menu-scrollable" : "");
    const toggleClassNames = toggleClassName ? "dropdown-toggle " + toggleClassName : "dropdown-toggle";

    return <div className={classNames} style={{ ...style }}>
        <button ref={dropdownRef} onMouseEnter={onMouseEnter} className={toggleClassNames} onClick={onToggle}>
            <div className="caption">{selectedIndex >= 0 ? options[selectedIndex].label : null}</div>
            <Icon icon={float === "down" ? "stroke-arrow-down" : "stroke-arrow-up"} mask={true} size={size} />
        </button>
        {portalContainer && dropdownContent && ReactDOM.createPortal(dropdownContent, portalContainer)}
    </div>;
};

export default Dropdown;