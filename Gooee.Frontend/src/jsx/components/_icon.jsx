import React from "react";

const Icon = ({ className, style, icon, mask = null, fa = null }) => {
    const iconClassName = mask ? `icon mask-icon icon-${icon} ${className}` : fa ? `fa fa-${icon} ${className}` : `icon ${className}`;
    const iconMarkup = mask || fa ? <div className={iconClassName} style={style}></div> : <img className={iconClassName} style={style} src={icon} />;

    return iconMarkup;
};

export default Icon;