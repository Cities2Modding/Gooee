import React from "react";

const PieChart = ({ data }) => {
    const total = data.reduce((accu, { value }) => accu + value, 0);
    let endAngle = 0;

    const calculatePath = (startAngle, angle, index) => {
        const x1 = Math.round(200 + 195 * Math.cos(Math.PI * startAngle / 180));
        const y1 = Math.round(200 + 195 * Math.sin(Math.PI * startAngle / 180));
        const x2 = Math.round(200 + 195 * Math.cos(Math.PI * (startAngle + angle) / 180));
        const y2 = Math.round(200 + 195 * Math.sin(Math.PI * (startAngle + angle) / 180));

        const d = `M200,200 L${x1},${y1} A195,195 0 ${angle > 180 ? 1 : 0},1 ${x2},${y2} z`;
        return { d };
    };

    return (
        <div id="con" style={{ resize: "both", overflow: "hidden", display: "inline-block", width: "10em", height: "10em", padding: "0.5em" }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
                <style>{`path:hover { opacity: 0.8; }`}</style>
                {data.map((option, index) => {
                    const startAngle = endAngle;
                    const angle = (option.value / total) * 360;
                    endAngle += angle;

                    const { d } = calculatePath(startAngle, angle, index);
                    return (
                        <path key={index} d={d} fill={option.color} />
                    );
                })}
            </svg>
        </div>
    );
};

export default PieChart;
