import React from 'react'

const TabModal = ({ tabs, className, style, size = null, selected, onClose, title, icon, fixed = null, bodyClassName = null, hidden = null, watch = [] }) => {
    const react = window.$_gooee.react;
    const [activeTab, setActiveTab] = react.useState(selected ? selected : tabs.length > 0 ? tabs[0].name : '');

    const { Button } = window.$_gooee.framework;

    react.useEffect(() => {
        if (activeTab === '')
            setActiveTab(tabs.length > 0 ? tabs[0].name : '');
    }, [tabs]);

    const onTabClick = (tab) => {
        setActiveTab(tab.name)
        engine.trigger("audio.playSound", "select-item", 1);
    };

    const onTabHover = () => {
        engine.trigger("audio.playSound", "hover-item", 1);
    };

    const sizeClass = size ? `modal modal-${size}` + (hidden ? " hidden" : "") + (className ? " " + className : "") : "modal" + (hidden ? " hidden" : "") + (className ? " " + className : "");
    const fixedClass = fixed ? ` modal-fixed` : "";
    const classNames = sizeClass + fixedClass;
    const tabsClass = title ? "modal-tabs tabs-center" : "modal-tabs mt-1";
    const bodyClassNames = "modal-body" + (bodyClassName ? " " + bodyClassName : "");

    const render = react.useMemo(() => {
        return <div className={classNames} style={style}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        {icon ? icon : null}
                        {title ? <div className="modal-title">{title}</div> : null}
                        <Button className="close" size="sm" onClick={onClose} icon circular>
                            <div className="icon mask-icon icon-close"></div>
                        </Button>
                        <div className={tabsClass}>
                            {tabs.map(tab => (
                                <div
                                    key={tab.name}
                                    className={`tab ${activeTab === tab.name ? "active" : ""}`}
                                    onClick={() => onTabClick(tab)}
                                    onMouseEnter={() => onTabHover()}>
                                    {tab.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    {tabs.map(tab => (
                        <div key={tab.name} className={bodyClassNames} style={activeTab !== tab.name ? { display: "none" } : null}>
                            {tab.content}
                        </div>
                    ))}
                </div>
            </div>
        </div>;
    }, [tabs, activeTab, ...watch]);

    return render;
};

export default TabModal;
