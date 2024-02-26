import React from "react";
import ReactDOM from "react-dom";

const AutoToolTip = ({ targetRef, children, target, float = "up", align = "center", ...props }) => {
    const react = window.$_gooee.react;
    const [visible, setVisible] = react.useState(false);
    const [shiftedX, setShiftedX] = react.useState(0);
    const [shiftedY, setShiftedY] = react.useState(0);
    const [targetPosition, setTargetPosition] = react.useState({x: 0, y: 0});
    const { ToolTip } = window.$_gooee.framework;
    const [portalContainer, setPortalContainer] = react.useState(null);
    const tooltipRef = react.useRef(null);
    const portalName = "gooee-tooltip-portal";

    react.useEffect(() => {
        if (visible && targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setTargetPosition({ x: rect.left, y: rect.y });
        }
    }, [visible, targetRef.current]);

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

    const getToolTipPosition = () => {
        let p = {};

        if (targetRef.current && tooltipRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            const toolTipRect = tooltipRef.current.getBoundingClientRect();

            if (float === "up" && align === "center") {
                p = {
                    top: rect.top + window.scrollY - toolTipRect.height - (toolTipRect.height * 0.1),
                    left: rect.left + window.scrollX + (rect.width / 2) - (toolTipRect.width / 2),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "up" && align === "left") {
                p = {
                    top: rect.top + window.scrollY - toolTipRect.height - (toolTipRect.height * 0.1),
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "up" && align === "right") {
                p = {
                    top: rect.top + window.scrollY - toolTipRect.height - (toolTipRect.height * 0.1),
                    left: rect.left + (rect.width / 2) + window.scrollX - toolTipRect.width,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "center") {
                p = {
                    top: rect.top + window.scrollY + rect.height,
                    left: rect.left + window.scrollX + (rect.width / 2) - (toolTipRect.width / 2),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "left") {
                p = {
                    top: rect.top + window.scrollY + rect.height,
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "right") {
                p = {
                    top: rect.top + window.scrollY + rect.height,
                    left: rect.left + (rect.width / 2) + window.scrollX - toolTipRect.width,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "left") {
                p = {
                    top: rect.top + window.scrollY + (rect.height / 2) - (toolTipRect.height / 2),
                    left: rect.left + window.scrollX - toolTipRect.width - (toolTipRect.height * 0.1),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "center") {
                p = {
                    top: rect.top + window.scrollY + (rect.height / 2) - (toolTipRect.height / 2),
                    left: rect.left + window.scrollX - toolTipRect.width - (toolTipRect.height * 0.1),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "right") {
                p = {
                    top: rect.top + window.scrollY + rect.height - (toolTipRect.height * 0.1),
                    left: rect.left + rect.width + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "right" && align === "left") {
                p = {
                    top: rect.top + window.scrollY + (rect.height / 2) - (toolTipRect.height / 2),
                    left: rect.left + window.scrollX - toolTipRect.width + (toolTipRect.height * 0.1),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "right" && align === "center") {
                p = {
                    top: rect.top + window.scrollY + (rect.height / 2) - (toolTipRect.height / 2),
                    left: rect.left + window.scrollX - toolTipRect.width + (toolTipRect.height * 0.1),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "right" && align === "right") {
                p = {
                    top: rect.top + window.scrollY + rect.height - (toolTipRect.height * 0.1),
                    left: rect.left + rect.width + window.scrollX,
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
    };

    const constrainPosition = (p) => {
        if (!tooltipRef.current || !targetRef.current) {
            setShiftedX(0);
            setShiftedY(0);
            return p;
        }

        const rect = tooltipRef.current.getBoundingClientRect();
        const targetRect = targetRef.current.getBoundingClientRect();

        if (p.x + rect.width >= window.innerWidth) {
            //p.x = window.innerWidth - rect.width;
            p.x = targetRect.left + (targetRect.width / 2) + window.scrollX - rect.width
            setShiftedX(-1);
        }
        else if (p.x < 0) {
            //p.x = (targetRect.width / 2);
            p.x = targetRect.left + window.scrollX + (float === "left" ? targetRect.width : (targetRect.width / 2) );
           
            setShiftedX(1);
        }
        else {
            setShiftedX(0);
        }

        if (p.y + rect.height >= window.innerHeight) {
            p.y = window.innerHeight - rect.height;
            setShiftedY(-1);
        }
        else if (p.y < 0) {
            p.y = 0;
            setShiftedY(1);
        }
        else {
            setShiftedY(0);
        }

        return p;
    };

    react.useEffect(() => {
        if (!targetRef.current)
            return;

        const targetElement = targetRef.current;
        if (targetElement) {
            const showToolTip = () => setVisible(true);
            const hideToolTip = () => setVisible(false);

            targetElement.addEventListener("mouseenter", showToolTip);
            targetElement.addEventListener("mouseleave", hideToolTip);

            return () => {
                targetElement.removeEventListener("mouseenter", showToolTip);
                targetElement.removeEventListener("mouseleave", hideToolTip);
            };
        }
    }, [targetRef]);
    
    const curTooltipPosition = react.useMemo(() => {
        return getToolTipPosition();
    }, [tooltipRef.current, targetRef.current, targetPosition]);

    const toolTipContents = <ToolTip ref={tooltipRef} className="p-fixed" visible={visible} float={float === "left" && shiftedX == 1 ? "right" : float == "right" && shiftedX == -1 ? "left" : float} align={float === "left" || float == "right" ? align : shiftedX === -1 ? "right" : shiftedX === 1 ? "left" : align} {...props} style={curTooltipPosition}>
        {children}
    </ToolTip>;

    return <>{portalContainer && toolTipContents && ReactDOM.createPortal(toolTipContents, portalContainer)}</>;
};

export default AutoToolTip;
