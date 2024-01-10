import React from 'react'

const TabModal = ({ tabs, style, size = null, onClose, title, icon, fixed = null, bodyClassName = null }) => {
    const react = window.$_gooee.react;
    const [activeTab, setActiveTab] = react.useState(tabs.length > 0 ? tabs[0].name : '');

    const { Button, Scrollable } = window.$_gooee.framework;

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

    const sizeClass = size ? `modal modal-${size}` : "modal";
    const fixedClass = fixed ? ` modal-fixed` : "";
    const classNames = sizeClass + fixedClass;
    const tabsClass = title ? "modal-tabs tabs-center" : "modal-tabs mt-1";
    const bodyClassNames = "modal-body" + (bodyClassName ? " " + bodyClassName : "");

    return <div className={classNames} style={style}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    {title ? icon : null}
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
                <div className={bodyClassNames}>
                        {tabs.map(tab => (
                            <div key={tab.name} style={activeTab !== tab.name ? { display: "none" } : null}>
                                {tab.content}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    </div>;
};

export default TabModal;
