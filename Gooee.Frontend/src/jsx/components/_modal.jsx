import React from "react";

const Modal = ({ className, children, style, size = null, onClose, title, icon, fixed = null, bodyClassName = null, hidden = null }) => {
    const react = window.$_gooee.react;
    
    const { Button } = window.$_gooee.framework;   
    const sizeClass = size ? `modal modal-${size}` + (hidden ? " hidden" : "") + (className ? " " + className : "") : "modal" + (hidden ? " hidden" : "") + (className ? " " + className : "");
    const fixedClass = fixed ? ` modal-fixed` : "";
    const classNames = sizeClass + fixedClass;
    const bodyClassNames = "modal-body" + (bodyClassName ? " " + bodyClassName : "");

    return <div className={classNames} style={style}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    {icon}
                    <div className="modal-title">{title ? title : <>&nbsp;</>}</div>
                    <Button className="close" size="sm" onClick={onClose} icon circular>
                        <div className="icon mask-icon icon-close"></div>
                    </Button>
                </div>
                <div className={bodyClassNames}>
                    {children}
                </div>
            </div>
        </div>
    </div>;
};

export default Modal;
