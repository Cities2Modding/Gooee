import React from "react";
import ReactDOM from "react-dom";

const AutoToolTip = ({ targetRef, children, target, float = "up", align = "center", ...props }) => {
    const react = window.$_gooee.react;
    const [visible, setVisible] = react.useState(false);
    const { ToolTip } = window.$_gooee.framework;
    const [portalContainer, setPortalContainer] = react.useState(null);
    const tooltipRef = react.useRef(null);
    const portalName = "gooee-tooltip-portal";

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
        if (targetRef.current && tooltipRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            const toolTipRect = tooltipRef.current.getBoundingClientRect();

            if (float === "up" && align === "center") {
                return {
                    top: rect.top + window.scrollY - toolTipRect.height - (toolTipRect.height * 0.1),
                    left: rect.left + window.scrollX + (rect.width / 2) - (toolTipRect.width / 2),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "up" && align === "left") {
                return {
                    top: rect.top + window.scrollY - toolTipRect.height - (toolTipRect.height * 0.1),
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "up" && align === "right") {
                return {
                    top: rect.top + window.scrollY - toolTipRect.height - (toolTipRect.height * 0.1),
                    left: rect.left + (rect.width / 2) + window.scrollX - toolTipRect.width,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "center") {
                return {
                    top: rect.top + window.scrollY + rect.height - (toolTipRect.height * 0.1),
                    left: rect.left + window.scrollX + (rect.width / 2) - (toolTipRect.width / 2),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "left") {
                return {
                    top: rect.top + window.scrollY + rect.height - (toolTipRect.height * 0.1),
                    left: rect.left + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "down" && align === "right") {
                return {
                    top: rect.top + window.scrollY + rect.height - (toolTipRect.height * 0.1),
                    left: rect.left + (rect.width / 2) + window.scrollX - toolTipRect.width,
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "left") {
                return {
                    top: rect.top + window.scrollY + (rect.height / 2) - (toolTipRect.height /2),
                    left: rect.left + window.scrollX - toolTipRect.width - (toolTipRect.height * 0.1),
                    bottom: null,
                    right: null
                };
            }
            else if (float === "left" && align === "right") {
                return {
                    top: rect.top + window.scrollY + rect.height - (toolTipRect.height * 0.1),
                    left: rect.left + rect.width + window.scrollX,
                    bottom: null,
                    right: null
                };
            }
            return {
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                bottom: null,
                right: null
            };
        }
        return {};
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

    const toolTipContents = <ToolTip ref={tooltipRef} className="p-fixed" visible={visible} float={float} align={align} {...props} style={getToolTipPosition()}>
        {children}
    </ToolTip>;

    return <>{portalContainer && toolTipContents && ReactDOM.createPortal(toolTipContents, portalContainer)}</>;
};

export default AutoToolTip;
