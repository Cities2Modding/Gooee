import React from "react";

const Modal = ({ className, children, style, size = null, onClose, title, icon, fixed = null, bodyClassName = null, contentClassName = null, headerClassName = null, hidden = null, noClose = null, onMouseEnter, onMouseLeave }) => {
    const react = window.$_gooee.react;
    
    const { Button } = window.$_gooee.framework;   
    const sizeClass = size ? `modal modal-${size}` + (hidden ? " hidden" : "") + (className ? " " + className : "") : "modal" + (hidden ? " hidden" : "") + (className ? " " + className : "");
    const fixedClass = fixed ? ` modal-fixed` : "";
    const classNames = sizeClass + fixedClass;
    const bodyClassNames = "modal-body" + (bodyClassName ? " " + bodyClassName : "");

    return <div className={classNames} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div className="modal-dialog">
            <div className={"modal-content" + (contentClassName ? ` ${contentClassName}` : "")}>
                <div className={"modal-header" + (headerClassName ? ` ${headerClassName}` : "")}>
                    {icon}
                    <div className="modal-title">{title ? title : <>&nbsp;</>}</div>
                    {!noClose ?
                        <Button className="close" size="sm" onClick={onClose} icon circular>
                            <div className="icon mask-icon icon-close"></div>
                        </Button> : null}
                </div>
                <div className={bodyClassNames}>
                    {children}
                </div>
            </div>
        </div>
    </div>;
};

export default Modal;
