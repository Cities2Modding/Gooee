import React from "react";

const Modal = ({ children, style, onClose, title, icon }) => {
    const react = window.$_gooee.react;
    
    const { Button } = window.$_gooee.framework;        

    return <div className="modal" style={style}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    {icon}
                    <div className="modal-title">{title}</div>
                    <Button className="close" size="sm" onClick={onClose} icon circular>
                        <div className="icon mask-icon icon-close"></div>
                    </Button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    </div>;
};

export default Modal;
