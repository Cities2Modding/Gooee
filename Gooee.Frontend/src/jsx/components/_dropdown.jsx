import React from "react";
import ReactDOM from "react-dom";

const Dropdown = ({ style, className, toggleClassName, size, onSelectionChanged, selected, options }) => {
    const react = window.$_gooee.react;
    const [active, setActive] = react.useState(false);
    const [internalValue, setInternalValue] = react.useState(selected);
    const [portalContainer, setPortalContainer] = react.useState(null);
    const dropdownRef = react.useRef(null); // Ref to attach to the select field
    const menuRef = react.useRef(null); // Ref for the dropdown content

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
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            return {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            };
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

    const selectedIndex = options.findIndex(o => o.value === internalValue);

    // Define the dropdown content
    const dropdownContent = active ? (
        <div className="dropdown-menu" ref={menuRef} style={getDropdownPosition()}>                
            {
                options.map((option) => (
                    <button key={option.value} className="dropdown-item" onMouseEnter={onMouseEnter} onClick={() => changeSelection(option.value)}>{option.label}</button>
                ))
            }
        </div>
    ) : null;

    const classNames = (className ? `dropdown ${className}` : "dropdown") + ( size ? ` dropdown-${size}` : "" );
    const toggleClassNames = toggleClassName ? "dropdown-toggle " + toggleClassName : "dropdown-toggle";

    return <div className={classNames} style={{ ...style }}>
        <button ref={dropdownRef} onMouseEnter={onMouseEnter} className={toggleClassNames} onClick={onToggle}>
            <div className="caption">{selectedIndex >= 0 ? options[selectedIndex].label : null}</div>
            <div className="icon mask-icon" style={{ maskImage: "url(Media/Glyphs/StrokeArrowDown.svg)" }}></div>
        </button>
        {portalContainer && dropdownContent && ReactDOM.createPortal(dropdownContent, portalContainer)}
    </div>;
};

export default Dropdown;