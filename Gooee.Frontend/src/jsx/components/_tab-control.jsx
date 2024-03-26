import React from 'react'

const TabControl = ({ tabs, className, style, selected, bodyClassName = null, watch = [] }) => {
    const react = window.$_gooee.react;
    const [activeTab, setActiveTab] = react.useState(selected ? selected : tabs.length > 0 ? tabs[0].name : '');
    
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
    
    const classNames = "tab-control-header" + (className ? " " + className : "");
    const tabsClass = "tab-control";
    const bodyClassNames = "tab-control-body" + (bodyClassName ? " " + bodyClassName : "");

    const render = react.useMemo(() => {
            return <><div className={classNames} style={style}>
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
            {
                tabs.map(tab => (
                    <div key={tab.name} className={bodyClassNames} style={activeTab !== tab.name ? { display: "none" } : null}>
                        {tab.content}
                    </div>
            ))
            }</>;
    }, [tabs, activeTab, ...watch]);

    return render;
};

export default TabControl;
