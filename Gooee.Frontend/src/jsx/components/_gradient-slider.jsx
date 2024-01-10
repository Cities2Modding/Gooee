import React from "react";

const GradientSlider = ({ className, value, onValueChanged, style, from, to, spectrum = null }) => {
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
    //linear-gradient(to right, ' + fromColour + ' 0%, ' + toColour + ' 100%)

    const spectrumClass = spectrum ? " bg-spectrum" : "";
    const classNames = "form-gradient-slider" + (className ? " " + className : "") + spectrumClass;
    const valuePercent = internalValue + "%";
    return <div className={classNames}        
        onMouseDown={onMouseDown}>
        <div ref={sliderRef} className="form-gradient-slider-container">
            <div className="form-slider-grip" style={{ left: valuePercent }}>
                <div className="form-slider-thumb"></div>
            </div>
        </div>
    </div>;
}

export default GradientSlider;