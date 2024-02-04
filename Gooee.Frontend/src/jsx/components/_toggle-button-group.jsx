import React from 'react';

const ToggleButton = ({ children, selectedIndex = 0, onSelectionChanged }) => {
    const react = window.$_gooee.react;
    const [internalValue, setInternalValue] = react.useState(selectedIndex);
    const { Button } = window.$_gooee.framework;
    const changeSelection = (index) => {
        setInternalValue(index);

        if (onSelectionChanged)
            onSelectionChanged(index);
    };
    const renderItems = () => {
        let buttonIndex = -1; // Initialise a separate counter for button elements

        return React.Children.map(children, (child, index) => {
            if (child.type !== 'button') {
                // If not a button, render the child as is
                return child;
            }

            buttonIndex++; // Increment buttonIndex for each button element

            const thisIndex = buttonIndex;
            const key = `toggle-btn-${thisIndex}`;
            const isSelected = internalValue == thisIndex;
            const innerContent = child.props.children;    
            const color = isSelected ? "primary" : "light";
            const shade = isSelected ? "" : "trans-faded";
            const isLast = thisIndex === React.Children.toArray(children).filter(c => c.type === 'button').length - 1;
            const classNames = (!isSelected ? "text-light" : "text-dark") + (isLast ? "" : " mb-1");

            return (
                <Button key={key} className={classNames} isBlock color={color} style={shade} onClick={() => changeSelection(thisIndex)}>{innerContent}</Button>
            );
        });
    };
    
    return <>{children ? renderItems() : null}</>;
};

export default ToggleButton;