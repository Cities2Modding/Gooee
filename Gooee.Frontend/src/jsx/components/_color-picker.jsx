import React from "react";
import { ReactId } from "reactjs-id";

const ColorPicker = ({ className, toggleClassName, value, size = null, disabled = null, label = null, onSelectionChanged, onMouseEnter, onMouseLeave }) => {
    const react = window.$_gooee.react;
    const { Button, TextBox, FormGroup, Slider, GridSlider, FloatingElement } = window.$_gooee.framework;

    const [isRgba, setIsRgba] = react.useState(value && value.startsWith("rgba"));
    const [hasHash, setHasHash] = react.useState(value && value.startsWith("#"));
    const [red, setRed] = react.useState(255);
    const [green, setGreen] = react.useState(255);
    const [blue, setBlue] = react.useState(255);
    const [alpha, setAlpha] = react.useState(1);
    const [hue, setHue] = react.useState(0);
    const [saturation, setSaturation] = react.useState(100);
    const [lightness, setLightness] = react.useState(100);
    const [hex, setHex] = react.useState(value ?? "FF0000");
    const [hueHex, setHueHex] = react.useState("FF0000");
    const [dropdownVisible, setDropdownVisible] = react.useState(false);
    const dropdownRef = react.useRef(null);

    react.useEffect(() => {
        setHex(_gRGBToHex(red, green, blue, true));
    }, [red, green, blue]);

    const updateHueHex = (h) => {
        const hueRgb = _gHSVToRGB(parseInt(h), 100, 100);
        setHueHex(_gRGBToHex(hueRgb.r, hueRgb.g, hueRgb.b, true));
    };

    const updateFrom = (rgb) => {
        setRed(rgb.r);
        setGreen(rgb.g);
        setBlue(rgb.b);

        if (typeof rgb.a !== undefined) {
            setAlpha(rgb.a);
        }
        else
            setAlpha(1);

        const hsl = _gRGBToHSV(rgb.r, rgb.g, rgb.b);
        setHue(parseInt(hsl.h));
        setSaturation(parseInt(hsl.s));
        setLightness(parseInt(hsl.v));

        setHex(_gRGBToHex(rgb.r, rgb.g, rgb.b, true));

        updateHueHex(hsl.h);
    };

    react.useEffect(() => {
        if (!value)
            return;

        const isRgba = value.startsWith("rgba");
        setIsRgba(isRgba);

        if (isRgba) {
            setHasHash(false);
            const rgba = _gParseRgba(value);
            updateFrom(rgba);
        }
        else {
            setHasHash(value.startsWith("#"));
            const rgb = _gHexToRGB(value);
            updateFrom(rgb);
        }
    }, [value]);

    const onHueUpdated = (newHue) => {
        const actualHue = parseInt(Math.max(0, Math.min(360, ((100 - newHue) / 100) * 360)));
        setHue(actualHue);

        const rgb = _gHSVToRGB(actualHue, saturation, lightness);
        const hueRgb = _gHSVToRGB(actualHue, 100, 100);

        setHueHex(_gRGBToHex(hueRgb.r, hueRgb.g, hueRgb.b, true));

        setRed(rgb.r);
        setGreen(rgb.g);
        setBlue(rgb.b);
    };

    const onSaturationBrightnessUpdated = (newSat, newLightness) => {
        setSaturation(newSat);
        setLightness(100 - newLightness);

        const rgb = _gHSVToRGB(hue, newSat, 100 - newLightness);
        setRed(rgb.r);
        setGreen(rgb.g);
        setBlue(rgb.b);
    };

    const classNames = "color-picker-container mt-1 w-x" + (className ? " " + className : "") + (size ? ` color-picker-${size}` : "") + (dropdownVisible ? " visible" : "" );

    const handleClick = (e) => {
        if (disabled)
            return;

        e.stopPropagation();

        const newVisibleValue = !dropdownVisible;

        if (newVisibleValue)
            engine.trigger("audio.playSound", "select-dropdown", 1);

        setDropdownVisible(newVisibleValue);
    }

    const internalOnMouseEnter = (e) => {
        if (disabled)
            return;
        e.stopPropagation();

        engine.trigger("audio.playSound", "hover-item", 1);

        if (onMouseEnter)
            onMouseEnter();
    };

    const internalOnMouseLeave = (e) => {
        if (disabled)
            return;

        e.stopPropagation();

        if (onMouseLeave)
            onMouseLeave();
    };

    const onDropdownHidden = () => {
        setDropdownVisible(false);
    };

    const onClickOkay = (e) => {
        e.stopPropagation();

        setDropdownVisible(false);

        const hexVal = _gRGBToHex(red, green, blue, true);
        setHex(hexVal);
        
        if (onSelectionChanged)
            onSelectionChanged(isRgba ? `rgba(${red}, ${green}, ${blue}, ${alpha})` : hasHash && !hexVal.startsWith("#") ? "#" + hexVal : hexVal);
    };

    const onSanitizeHex = (val) => {
        return val.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    };

    const getRed = react.useCallback(() => {
        return red;
    }, [red]);

    const getGreen = react.useCallback(() => {
        return green;
    }, [green]);

    const getBlue = react.useCallback(() => {
        return blue;
    }, [blue]);

    const getHue = react.useCallback(() => {
        return hue;
    }, [hue]);

    const getSaturation = react.useCallback(() => {
        return saturation;
    }, [saturation]);

    const getLightness = react.useCallback(() => {
        return lightness;
    }, [lightness]);

    const onUpdateTextBox = (type, val) => {
        let rgb = null;
        let hsl = null;
        let newVal;

        switch (type) {
            case "red":
                newVal = parseInt(val);
                hsl = _gRGBToHSV(newVal, getGreen(), getBlue());

                setRed(newVal);

                setHue(parseInt(hsl.h));
                setSaturation(parseInt(hsl.s));
                setLightness(parseInt(hsl.v));

                updateHueHex(hsl.h);
                break;

            case "green":
                newVal = parseInt(val);
                hsl = _gRGBToHSV(getRed(), newVal, getBlue());

                setGreen(newVal);

                setHue(parseInt(hsl.h));
                setSaturation(parseInt(hsl.s));
                setLightness(parseInt(hsl.v));

                updateHueHex(hsl.h);
                break;

            case "blue":
                newVal = parseInt(val);
                hsl = _gRGBToHSV(getRed(), green, newVal);

                setBlue(newVal);

                setHue(parseInt(hsl.h));
                setSaturation(parseInt(hsl.s));
                setLightness(parseInt(hsl.v));

                updateHueHex(hsl.h);
                break;

            case "hue":
                newVal = parseInt(val);
                rgb = _gHSVToRGB(newVal, getSaturation(), getLightness());
                setHue(newVal);

                updateHueHex(newVal);

                setRed(parseInt(rgb.r));
                setGreen(parseInt(rgb.g));
                setBlue(parseInt(rgb.b));
                break;

            case "saturation":
                newVal = parseInt(val);
                rgb = _gHSVToRGB(getHue(), newVal, getLightness());
                setSaturation(newVal);

                setRed(parseInt(rgb.r));
                setGreen(parseInt(rgb.g));
                setBlue(parseInt(rgb.b));
                break;

            case "lightness":
                newVal = parseInt(val);
                rgb = _gHSVToRGB(getHue(), getSaturation(), newVal);
                setLightness(newVal);

                setRed(parseInt(rgb.r));
                setGreen(parseInt(rgb.g));
                setBlue(parseInt(rgb.b));
                break;
        }
    };

    return <>
        <div ref={dropdownRef} className={"color-picker-toggle d-flex flex-row align-items-center" + (toggleClassName ? " " + toggleClassName : "")}>
            <div
                style={{ backgroundColor: (isRgba || hasHash ? value : `#${value}`) }}
                onMouseEnter={internalOnMouseEnter} onMouseLeave={internalOnMouseLeave}
                onClick={handleClick}></div>
            {label ? <label className="ml-2" onClick={handleClick}>{label}</label> : null}
        </div>
        <FloatingElement typeKey="ColorPicker" className={!dropdownVisible ? "pointer-events-none" : null} visible={dropdownVisible} onHidden={onDropdownHidden} targetRef={dropdownRef}>
            <div className={classNames} style={{ "--gColorPickerColor": `#${hueHex}` }}>
                <div className="color-picker">
                    <div className="color-picker-area-container">
                        <div className="color-picker-area-content">
                            <GridSlider value={{ x: saturation, y: 100 - lightness }} className="color-picker-area" onValueChanged={onSaturationBrightnessUpdated}></GridSlider>
                        </div>
                    </div>
                    <div className="color-picker-hue-container">
                        <Slider value={100 -Math.min(100, Math.max(0, parseInt((hue / 360) * 100)))} className="color-picker-hue" basic orientation="vertical" onValueChanged={onHueUpdated} />
                    </div>
                </div>
                <div className="color-picker-settings">
                    <div className="color-picker-preview">
                        <label>New</label>
                        <div className="color-picker-block-container">
                            <div style={{ backgroundColor: `#${hex}`, width: "75rem", height: "45rem" }}></div>
                            <div style={{ backgroundColor: (isRgba || hasHash ? value : `#${value}`), width: "75rem", height: "45rem" }}></div>
                        </div>
                        <label>Current</label>
                    </div>
                    <FormGroup className="mt-4 form-group-inline mb-1" label="R" labelClassName="color-picker-form-label">
                        <TextBox type="number" maxLength={3} minValue={0} maxValue={255} selectOnFocus style={{ width: "45rem" }} size="sm" text={red} onChange={(val) => onUpdateTextBox("red", val)} />
                    </FormGroup>
                    <FormGroup className="form-group-inline mb-1" label="G" labelClassName="color-picker-form-label">
                        <TextBox type="number" maxLength={3} minValue={0} maxValue={255} selectOnFocus style={{ width: "45rem" }} size="sm" text={green} onChange={(val) => onUpdateTextBox("green", val)} />
                    </FormGroup>
                    <FormGroup className="form-group-inline mb-1" label="B" labelClassName="color-picker-form-label">
                        <TextBox type="number" maxLength={3} minValue={0} maxValue={255} selectOnFocus style={{ width: "45rem" }} size="sm" text={blue} onChange={(val) => onUpdateTextBox("blue", val)} />
                    </FormGroup>
                </div>
                <div className="color-picker-extras">
                    <div className="color-picker-buttons">
                        <div className="btn-group-vertical">
                            <Button onClick={onClickOkay} className="px-6" color="success" size="sm" style="trans">
                                OK
                            </Button>
                            <Button onClick={onDropdownHidden} className="px-6" color="danger" size="sm" style="trans">
                                Cancel
                            </Button>
                        </div>
                    </div>
                    <div className="d-flex align-items-start flex-cplumn justify-content-center w-x mt-x align-self-end">
                        <FormGroup className="form-group-inline ml-x" label="#" labelClassName="color-picker-form-label">
                            <TextBox onSanitize={onSanitizeHex} maxLength={6} selectOnFocus style={{ width: "95rem" }} size="sm" text={hex} onChange={(val) => onUpdateTextBox("hex", val)} />
                        </FormGroup>
                        <FormGroup className="mt-4 form-group-inline mb-1" label="H" labelClassName="color-picker-form-label">
                            <TextBox type="number" maxLength={3} minValue={0} maxValue={360} selectOnFocus style={{ width: "45rem" }} size="sm" text={hue} onChange={(val) => onUpdateTextBox("hue", val)} />
                        </FormGroup>
                        <FormGroup className="form-group-inline mb-1" label="S" labelClassName="color-picker-form-label">
                            <TextBox type="number" maxLength={3} minValue={0} maxValue={100} selectOnFocus style={{ width: "45rem" }} size="sm" text={saturation} onChange={(val) => onUpdateTextBox("saturation", val)} />
                        </FormGroup>
                        <FormGroup className="form-group-inline mb-1" label="L" labelClassName="color-picker-form-label">
                            <TextBox type="number" maxLength={3} minValue={0} maxValue={100} selectOnFocus style={{ width: "45rem" }} size="sm" text={lightness} onChange={(val) => onUpdateTextBox("lightness", val)} />
                        </FormGroup>
                    </div>
                </div>
            </div>
        </FloatingElement>
    </>;
};

export default ColorPicker;