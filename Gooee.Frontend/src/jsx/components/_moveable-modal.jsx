import React from "react";

const MoveableModal = ({ className, children, style, pos, size = null, onClose, title, icon,
    bodyClassName = null, contentClassName = null, headerClassName = null,
    disableDrag = false,
    hidden = null, noClose = null, onMouseEnter, onMouseLeave,
    onStartDrag, onUpdateDrag, onEndDrag, watch = [] }) => {
    const react = window.$_gooee.react;
    const [isDragging, setIsDragging] = react.useState(false);
    const [cursorOffset, setCursorOffset] = react.useState({ x: 0, y: 0 });
    const [position, setPosition] = react.useState(pos ? pos : { x: 0, y: 0 });
    const headerRef = react.useRef(null);

    react.useEffect(() => {
        setPosition(pos);
    }, [pos]);

    const { Button } = window.$_gooee.framework;
    const sizeClass = size ? `modal modal-${size}` + (hidden ? " hidden" : "") + (className ? " " + className : "") : "modal" + (hidden ? " hidden" : "") + (className ? " " + className : "");

    const classNames = "p-fixed w-x " + sizeClass ;
    const bodyClassNames = "modal-body" + (bodyClassName ? " " + bodyClassName : "");
    
    react.useEffect(() => {
        setTimeout(() => {
            const p = pos;
            if (watch && watch[0] && headerRef && headerRef.current) {
                const rect = headerRef.current.getBoundingClientRect();
                if (p.x + rect.width >= window.innerWidth)
                    p.x = window.innerWidth - rect.width;
                else if (p.x < 0)
                    p.x = 0;

                if (p.y + rect.height >= window.innerHeight)
                    p.y = window.innerHeight - rect.height;
                else if (p.y < 0)
                    p.y = 0;

                setPosition(p);
            }
        }, 50);
    }, [...watch]);

    const onHeaderMouseDown = (e) => {
        if (e.button !== 0 || (!headerRef || !headerRef.current) || disableDrag)
            return;

        const rect = headerRef.current.getBoundingClientRect();
        setCursorOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });

        setIsDragging(true);

        if (onStartDrag)
            onStartDrag();
        e.stopPropagation();
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging)
            return;

        const rect = headerRef.current.getBoundingClientRect();
        const pos = { x: e.clientX - cursorOffset.x, y: e.clientY - cursorOffset.y };

        if (pos.x + rect.width >= window.innerWidth)
            pos.x = window.innerWidth - rect.width;
        else if (pos.x < 0)
            pos.x = 0;

        if (pos.y + rect.height >= window.innerHeight)
            pos.y = window.innerHeight - rect.height;
        else if (pos.y < 0)
            pos.y = 0;

        setPosition(pos);

        if (onUpdateDrag)
            onUpdateDrag(pos);

        e.stopPropagation();
        e.preventDefault();
    };

    const onMouseUp = () => {
        setIsDragging(false);
        if (onEndDrag)
            onEndDrag();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    react.useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isDragging]);

    return <div className={classNames} style={{ ...style, left: `${position.x}px`, top: `${position.y}px`, } } onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <div className="modal-dialog w-x">
            <div className={"modal-content w-x" + (contentClassName ? ` ${contentClassName}` : "")}>
                <div ref={headerRef} onMouseDown={onHeaderMouseDown} className={"modal-header" + (headerClassName ? ` ${headerClassName}` : "")}>
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

export default MoveableModal;
