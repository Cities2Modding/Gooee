import React from "react";

const GridSlider = ({ className, value, onValueChanged, style }) => {
    const react = window.$_gooee.react;
    const { Icon } = window.$_gooee.framework;

    const sliderRef = react.useRef(null);
    const [mouseDown, setMouseDown] = react.useState(false);
    const [internalValue, setInternalValue] = react.useState(value ? value : { x: 0, y: 0 });

    const updateValue = (e) => {
        const slider = sliderRef.current;
        if (!slider)
            return;

        const rect = slider.getBoundingClientRect();
        const position = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        let newValue = { x: (position.x / rect.width) * 100, y: (position.y / rect.height) * 100 };
        newValue.x = Math.max(0, Math.min(100, Math.round(newValue.x)));
        newValue.y = Math.max(0, Math.min(100, Math.round(newValue.y)));

        if (onValueChanged)
            onValueChanged(newValue.x, newValue.y);

        setInternalValue(newValue);

        engine.trigger("audio.playSound", "drag-slider", 1);
    };

    const onMouseDown = (e) => {
        setMouseDown(true);
        updateValue(e);
        engine.trigger("audio.playSound", "grabSlider", 1);
    };

    const onMouseMove = (e) => {
        if (mouseDown) {
            updateValue(e);
        }
    };

    const onMouseUp = () => {
        setMouseDown(false);
    };

    react.useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [mouseDown]);

    react.useEffect(() => {
        if (!value)
            return;
        setInternalValue(value);
    }, [value]);

    const classNames = "form-grid-slider" + (className ? " " + className : "");
    const valuePercentX = (internalValue.x) + "%";
    const valuePercentY = (internalValue.y) + "%";

    return <div className={classNames}
        ref={sliderRef}
        onMouseDown={onMouseDown}>        
        <div className="form-grid-slider-thumb" style={{ left: valuePercentX, top: valuePercentY }}>
            <Icon icon="circle" size="sm" fa />
        </div>
    </div>;
}

export default GridSlider;