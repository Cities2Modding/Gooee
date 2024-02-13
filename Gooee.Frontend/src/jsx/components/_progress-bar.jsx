import React from "react";

const ProgressBar = ({ className, value = 0.5, min = 0, max = 1, orientation = "horizontal" }) => {
    const react = window.$_gooee.react;

    const coreClassNames = "progress-bar";

    const percentage = ((value - min) * 100.0) / (max - min);

    const roundedPercentage = Math.round(percentage * 100) / 100;
    const percentageString = orientation === "vertical" || roundedPercentage % 1 === 0 ? parseInt(roundedPercentage).toString() : roundedPercentage.toFixed(2).toString();

    return <div className={`${coreClassNames} ${orientation}${className ? " " + className : ""}`}>
        <div className="progress-container">
            <div className="progress" style={orientation === "horizontal" ? { width: `${percentage}%` } : { height: `${percentage}%` }}></div>
            <div className="progress-label">
                {orientation === "horizontal" ? <span>{percentageString}%</span> :
                    <>
                        <span>{percentageString}</span>
                        <span>%</span>
                    </>}
            </div>
        </div>        
    </div>;
};

export default ProgressBar;