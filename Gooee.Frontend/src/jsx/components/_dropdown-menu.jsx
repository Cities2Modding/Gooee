import React from "react";

const DropdownMenu = ({ className, buttonRef, visible, style,
    onHidden, onItemClick, onChildItemClick,
    items }) => {
    const react = window.$_gooee.react;

    const { FloatingElement, Button, Icon } = window.$_gooee.framework;    

    const onInternalHidden = () => {
        if (!visible)
            return;

        if (onHidden)
            onHidden();

        engine.trigger("audio.playSound", "close-panel", 1);
    };

    return <FloatingElement typeKey="DropdownMenu" visible={visible}
        onHidden={onInternalHidden} targetRef={buttonRef} closeOnClickOutside="true">
        <div style={style} className={"bg-panel text-light rounded d-flex flex-column align-items-stretch" + (className ? " " + className : "")}>
            {items.map((item, index) => (
                <Button color="light" onClick={() => onItemClick(item.key)}
                    className="text-light btn-transparent flex-1 text-left"
                    style="trans-faded" key={index}
                    dropdownFloat="right" dropdownAlign="left"
                    dropdownCloseOnClick="true" ignoreBubblingClick="true"
                    dropdownMenu={item.children ? <div className="bg-panel-dark rounded d-flex flex-column align-items-stretch">
                        {item.children.map((childItem, childIndex) => (<Button ignoreBubblingClick="true" key={childIndex} stopClickPropagation={false} onClick={() => onChildItemClick(item.key, childItem)}
                            color="light" style="trans-faded" className="btn-transparent flex-1 text-left">
                            <Icon className={"mr-2" + (childItem.iconClassName ? " " + childItem.iconClassName : item.fa ? " bg-light" : "")} icon={childItem.icon} fa={childItem.fa ? true : null} />
                            <span className="text-light">{engine.translate(childItem.label)}</span>
                        </Button>))}
                    </div> : null}>
                    <span>
                        <Icon className={"mr-2" + (item.iconClassName ? " " + item.iconClassName : item.fa ? " bg-light" : "")} icon={item.icon} fa={item.fa ? true : null} />
                    </span>
                    <span className="text-light">{engine.translate(item.label)}</span>
                    {item.children ? <>
                        <div className="ml-2 flex-1"></div>
                        <Icon className="ml-x" style={{ marginTop: "2.5rem" }} icon="solid-caret-right" size="xs" fa />
                    </> : null}
                </Button>
            ))}
        </div>
    </FloatingElement>;
};

export default DropdownMenu;