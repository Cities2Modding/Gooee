import React from "react";
import ReactDOM from "react-dom";
import { ReactId } from "reactjs-id";

const FloatingElement = ({ getRef, typeKey, targetRef, visible, onHidden, children,
    float = "down", align = "left",
    closeOnClickOutside = false, closeOnClickInside = false, sideAlignVertical = false }) => {
    const react = window.$_gooee.react;
    const [portalContainer, setPortalContainer] = react.useState(null);
    const [guid] = react.useState(ReactId());
    const elementRef = react.useRef(null);
    const [elementPos, setElementPos] = react.useState({ x: -9999, y: -9999 });
    const portalName = "gooee-floating-element-portal";

    react.useEffect(() => {
        if (getRef) {
            getRef(elementRef);
        }
    }, [elementRef.current]);

    react.useEffect(() => {
        const handleVisibilityChange = (event) => {
            if (event.detail.typeKey === typeKey &&
                event.detail.guid !== guid &&
                visible && elementRef.current) {
                // If this component is visible but not the one that triggered the event, hide it
                onHidden && onHidden();
            }
        };

        document.addEventListener('floatingElementVisibilityChange', handleVisibilityChange);

        return () => {
            document.removeEventListener('floatingElementVisibilityChange', handleVisibilityChange);
        };
    }, [visible, typeKey, onHidden]);

    react.useEffect(() => {
        if (visible) {
            // Broadcast visibility change when this component becomes visible
            _gBroadcastVisibilityChange(typeKey, guid);
        }
    }, [visible, typeKey]);

    react.useEffect(() => {
        if (!document.getElementById(portalName)) {
            const container = document.createElement('div');
            container.id = portalName;
            document.body.appendChild(container);
            setPortalContainer(container);
        } else {
            setPortalContainer(document.getElementById(portalName));
        }
    }, []);

    const constrainPosition = (p) => {
        if (!elementRef.current)
            return p;

        const rect = elementRef.current.getBoundingClientRect();

        if (p.x + rect.width >= window.innerWidth)
            p.x = window.innerWidth - rect.width;
        else if (p.x < 0)
            p.x = 0;

        if (p.y + rect.height >= window.innerHeight)
            p.y = window.innerHeight - rect.height;
        else if (p.y < 0)
            p.y = 0;

        return p;
    };

    const getElementPosition = react.useCallback(() => {
        let p = null;

        if (targetRef.current && elementRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            const elementRect = elementRef.current.getBoundingClientRect();

            if (float === "up" && align === "center") {
                p = {
                    top: rect.top + window.scrollY - elementRect.height - (elementRect.height * 0.1),
                    left: rect.left + window.scrollX + (rect.width / 2) - (elementRect.width / 2),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "up" && align === "left") {
                p = {
                    top: rect.top + window.scrollY - elementRect.height - (elementRect.height * 0.1),
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "up" && align === "right") {
                p = {
                    top: rect.top + window.scrollY - elementRect.height - (elementRect.height * 0.1),
                    left: rect.left + (rect.width / 2) + window.scrollX - elementRect.width,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "center") {
                p = {
                    top: rect.top + window.scrollY + rect.height - (elementRect.height * 0.1),
                    left: rect.left + window.scrollX + (rect.width / 2) - (elementRect.width / 2),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "left") {
                p = {
                    top: rect.top + window.scrollY + rect.height - (elementRect.height * 0.1),
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "right") {
                p = {
                    top: rect.top + window.scrollY + rect.height - (elementRect.height * 0.1),
                    left: rect.left + (rect.width / 2) + window.scrollX - elementRect.width,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "left") {
                p = {
                    top: rect.top + window.scrollY + (sideAlignVertical ? (rect.height / 2) - (elementRect.height / 2) : 0),
                    left: rect.left + window.scrollX - elementRect.width - (elementRect.height * 0.1),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "right") {
                p = {
                    top: rect.top + window.scrollY + (sideAlignVertical ? rect.height - (elementRect.height * 0.1) : 0),
                    left: rect.left + rect.width + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "right" && align === "left") {
                p = {
                    top: rect.top + window.scrollY + (sideAlignVertical ? (rect.height / 2) - (elementRect.height / 2) : 0),
                    left: rect.left + rect.width + window.scrollX + (elementRect.width * 0.1), // Assuming you want some offset
                    bottom: null,
                    right: null
                };
            }
            else if (float === "right" && align === "center") {
                p = {
                    top: rect.top + window.scrollY + (sideAlignVertical ? (rect.height / 2) - (elementRect.height / 2) : 0),
                    left: rect.left + rect.width + window.scrollX - (elementRect.width / 2) + (rect.width / 2), // Center align relative to the target
                    bottom: null,
                    right: null
                };
            }
            else if (float === "right" && align === "right") {
                p = {
                    top: rect.top + window.scrollY + (sideAlignVertical ? (rect.height / 2) - (elementRect.height / 2) : 0),
                    left: rect.left + rect.width + window.scrollX, // Directly to the right of the target element
                    bottom: null,
                    right: null
                };
            }
            else {
                p = {
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }

            const constrainedPos = constrainPosition({ x: p.left, y: p.top });
            p.left = constrainedPos.x;
            p.top = constrainedPos.y;
        }
        return p;
    }, [targetRef, elementRef, float, align] );

    react.useEffect(() => {
        if (visible) {
            const position = constrainPosition(getElementPosition());
            setElementPos(position);

            if (elementRef.current) {
                elementRef.current.style.top = `${position.top}px`;
                elementRef.current.style.left = `${position.left}px`;
            }
        }
    }, [visible, getElementPosition, float, align]);

    //const elementContents = targetRef && targetRef.current ?
    //    <div ref={elementRef} className="p-fixed" style={getElementPosition()}>
    //        {children}
    //    </div> : null;

    const handleClickOutside = (event) => {
        if (elementRef.current && !elementRef.current.contains(event.target)) {
            if (onHidden)
                onHidden();
        }
    };

    react.useEffect(() => {
        if (closeOnClickOutside) {
            if (visible) {
                document.addEventListener("click", handleClickOutside, true);
            } else {
                document.removeEventListener("click", handleClickOutside, true);
            }
        }

        // Cleanup function to remove event listener
        return () => {
            if (closeOnClickOutside) {
                document.removeEventListener("click", handleClickOutside, true);
            }
        };
    }, [visible, closeOnClickOutside]);

    const onClick = react.useCallback(() => {
        if (closeOnClickInside && onHidden)
            onHidden();            
    }, [closeOnClickInside]);

    const elementContents = targetRef.current ? (
        <div ref={elementRef} className="p-fixed" style={elementPos} onClick={onClick}>
            <div className={(visible ? "" : "d-none")}>
                {children}
            </div>
        </div>
    ) : null;

    return <>{portalContainer && elementContents && ReactDOM.createPortal(elementContents, portalContainer)}</>;
};

export default FloatingElement;
