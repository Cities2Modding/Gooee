import React from "react";

const ProgressBar = ({ style, className, containerClassName, value = 0.5, min = 0, max = 1, orientation = "horizontal", color = null, showLabel = false, label = null, onMouseEnter, onMouseLeave }) => {
    const react = window.$_gooee.react;
    const coreClassNames = "progress-bar";

    const percentage = ((value - min) * 100.0) / (max - min);

    const roundedPercentage = Math.round(percentage * 100) / 100;
    const percentageString = orientation === "vertical" || roundedPercentage % 1 === 0 ? parseInt(roundedPercentage).toString() : roundedPercentage.toFixed(2).toString();

    const styles = react.useMemo(() => {
        if (color) {
            if (color.includes("#")) {
                const background = _gHexToRGBA(_gDarkenHex(color, 20), 0.5);
                const borderColor = _gHexToRGBA(color, 0.8);

                return {
                    "--gProgressBarForeground": color,
                    "--gProgressBarBackground": background,
                    "--gProgressBarBorderColor": borderColor,
                };
            }
        }
        return {};
    }, [color]);

    const onMouseEnterInternal = react.useCallback(() => {
        if (onMouseEnter)
            onMouseEnter();
    }, [onMouseEnter, showLabel, label]);

    const onMouseLeaveInternal = react.useCallback(() => {
        if (onMouseLeave)
            onMouseLeave();
    }, [onMouseLeave, showLabel, label]);

    return <div style={{ ...style, ...styles }} className={`${coreClassNames} ${orientation}${className ? " " + className : ""}`}
        onMouseEnter={onMouseEnterInternal} onMouseLeave={onMouseLeaveInternal}>
        <div className={"progress-container" + (containerClassName ? " " + containerClassName : "")}>
            <div className="progress" style={orientation === "horizontal" ? { width: `${percentage}%` } : { height: `${percentage}%` }}></div>
            <div className="progress-label">
                {orientation === "horizontal" ? (showLabel && label ? <span>{label.toUpperCase()}</span> : <span>{percentageString}%</span> ) :
                    <>
                        <span>{percentageString}</span>
                        <span>%</span>
                    </>}
            </div>
        </div>        
    </div>;
};

export default ProgressBar;