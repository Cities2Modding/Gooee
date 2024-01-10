import React from 'react'

const ToolTip = React.forwardRef(({ style, children, visible, containerStyle, clickable, float, align, inline }, ref) => {
    const react = window.$_gooee.react;
    const tooltipStyle = visible ? { opacity: 1, pointerEvents: clickable ? 'auto' : 'none' } : { opacity: 0, pointerEvents: 'none' };

    const positionStyle = float === "up" && align === "left" ? {
        left: '0',
        right: 'inherit',
        top: 'inherit',
        bottom: '100%',
    } : float === "up" && align === "center" ? {
        left: 'inherit',
        right: 'inherit',
        top: 'inherit',
        bottom: '100%',
        paddingLeft: 'calc(.5* var(--arrowSize) )',
        paddingRight: 'calc(.5* var(--arrowSize) )',
    } : float === "up" && align === "right" ? {
        left: 'inherit',
        right: '50%',
        top: 'inherit',
        bottom: '100%',
    } : float === "down" && align === "left" ? {
        left: '50%',
        right: 'inherit',
        top: '100%',
        bottom: 'inherit',
    } : float === "down" && align === "right" ? {
        left: 'inherit',
        right: '50%',
        top: '100%',
        bottom: 'inherit',
    } : float === "left" && align === "left" ? {
        left: 'inherit',
        right: '100%',
        top: '0',
        bottom: 'inherit',
    } : float === "left" && align === "right" ? {
        left: '100%',
        right: 'inherit',
        top: '0',
        bottom: 'inherit',
    } : float === "right" && align === "left" ? {
        left: '100%',
        right: 'inherit',
        top: '0',
        bottom: 'inherit',
    } : float === "right" && align === "right" ? {
        left: '100%',
        right: 'inherit',
        top: '0',
        bottom: 'inherit',
    } : {};

    let tooltipClassNames = "balloon_ltu balloon_qJY balloon_H23 anchored-balloon_AYp";
    tooltipClassNames += float === "up" ? " up_ehW up_el0" : float == "down" ? " down_ztr down_Xl7" : float == "left" ? " left_LHd left_SI8" : " right_JdH right_RQp";
    tooltipClassNames += " ";
    tooltipClassNames += align === "left" ? " end_EKq" : align === "right" ? " start_wu1" : " center_hug";

    const arrowClassNames = "arrow_R9U arrow_SVb " + (align === " right" ? "" : " arrow_Xfn");

    const inlineStyle = !inline ? { minWidth: '150rem' } : {};
    const inlineSubStyle = !inline ? { flex: 1 } : { width: 'auto' };

    return (<div className={tooltipClassNames} style={{
        position: 'absolute',
        ...positionStyle,
        width: 'auto',
        ...inlineStyle,
        display: 'flex',
        transition: 'opacity 0.2s easeOut',
        transitionDelay: '0.2s',
        zIndex: 999,
        ...tooltipStyle,
        ...style
    }}>
        <div ref={ref} className="bounds__AO" style={{
            ...inlineSubStyle,
            display: 'flex',
            transition: 'opacity 0.2s easeOut',
            transitionDelay: '0.2s',
            ...containerStyle
        }}>
            <div className="container_eNL container_zgM container_jfe">
                <div className={arrowClassNames}></div>
            </div>
            <div className="content_wfU content_A82 content_JQV">
                <div className="main_F2U">
                    {children}
                </div>
            </div>
        </div>
    </div>);
});

export default ToolTip;