import React from "react";
import { ReactId } from "reactjs-id";

const Slider = ({ className, value, onValueChanged, style, orientation = "horizontal", basic = null }) => {
    const react = window.$_gooee.react;
    const { Icon } = window.$_gooee.framework;
    const [guid] = react.useState(ReactId());
    const sliderRef = react.useRef(null);
    const [mouseDown, setMouseDown] = react.useState(false);
    const [internalValue, setInternalValue] = react.useState(value ? value :0.0);
    
    react.useEffect(() => {
        // Only update internalValue if not currently dragging.
        if (!mouseDown) {
            setInternalValue(Math.min(Math.max(0, value)));
        }
    }, [value, mouseDown]);

    const updateValue = (e) => {
        const slider = sliderRef.current;

        if (!slider)
            return;

        const rect = slider.getBoundingClientRect();
        const position = orientation === "horizontal" ? e.clientX - rect.left : e.clientY - rect.top;
        let newValue = (position / (orientation === "horizontal" ? rect.width : rect.height)) * 100;
        newValue = Math.max(0, Math.min(100, Math.round(newValue)));
        
        if (onValueChanged)
            onValueChanged(newValue);

        setInternalValue(newValue);

        engine.trigger("audio.playSound", "drag-slider", 1);
    };

    const onMouseDown = (e) => {
        e.stopPropagation();
        setMouseDown(true);
        updateValue(e);
        engine.trigger("audio.playSound", "grabSlider", 1);
    };

    const onMouseMove = (e) => {
        if (window.$_gooee.activeSlider !== guid)
            return;
        if (mouseDown) {
            updateValue(e);
        }
    };

    const onMouseUp = () => {
        if (window.$_gooee.activeSlider !== guid)
            return;
        setMouseDown(false);
    };

    react.useEffect(() => {
        if (!sliderRef || !sliderRef.current)
            return;

        if (mouseDown) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
            window.$_gooee.activeSlider = guid;
        }
        else {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [mouseDown, sliderRef.current]);

    const classNames = (basic ? "form-slider-basic" : "form-slider") + (orientation === "vertical" ? " form-slider-vertical" : "") + (className ? " " + className : "");
    const valuePercent = (internalValue) + "%";

    return <div className={classNames}
        ref={sliderRef}
        onMouseDown={onMouseDown}>
        <div className="form-slider-grip" style={orientation === "horizontal" ? { width: valuePercent } : { position: "absolute", top: `${internalValue}%`, height: valuePercent }}>
            {basic ? <div className="form-slider-grip-handle">
                <Icon icon="solid-caret-right" fa />
                <Icon icon="solid-caret-left" fa />
            </div> : null}
        </div>
    </div>;
}

export default Slider;