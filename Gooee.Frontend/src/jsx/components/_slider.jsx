import React from "react";

const Slider = ({ className, value, onValueChanged, style }) => {
    const react = window.$_gooee.react;
    const sliderRef = react.useRef(null);
    const [mouseDown, setMouseDown] = react.useState(false);
    const [internalValue, setInternalValue] = react.useState(value ? value :0.0);

    const updateValue = (e) => {
        const slider = sliderRef.current;
        if (!slider)
            return;

        const rect = slider.getBoundingClientRect();
        const position = e.clientX - rect.left;
        let newValue = (position / rect.width) * 100;
        newValue = Math.max(0, Math.min(100, Math.round(newValue)));

        if (onValueChanged)
            onValueChanged(newValue);

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

    const classNames = "form-slider" + (className ? " " + className : "");
    const valuePercent = internalValue + "%";
    return <div className={classNames}
        ref={sliderRef}
        onMouseDown={onMouseDown}>
        <div className="form-slider-grip" style={{ width: valuePercent }}></div>
    </div>;
}

export default Slider;