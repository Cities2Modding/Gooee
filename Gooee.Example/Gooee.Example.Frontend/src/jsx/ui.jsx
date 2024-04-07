import React from "react";

const ExampleTopLeftToolbar = ({ react }) => {
    const onMouseEnter = (e) => {
        engine.trigger("audio.playSound", "hover-item", 1);
    };
    return <button className="button_ke4 button_h9N" onMouseEnter={onMouseEnter}>
        <div className="tinted-icon_iKo icon_be5 icon-close"></div>
    </button>;
};

window.$_gooee.register("example", "ExampleTopLeftToolbar", ExampleTopLeftToolbar, "top-left-toolbar");

const ExampleTopRightToolbar = ({ react }) => {
    const onMouseEnter = (e) => {
        engine.trigger("audio.playSound", "hover-item", 1);
    };
    return <button className="button_ke4" onMouseEnter={onMouseEnter}>
        <div className="tinted-icon_iKo icon_be5 icon-close"></div>
    </button>;
};

window.$_gooee.register("example", "ExampleTopRightToolbar", ExampleTopRightToolbar, "top-right-toolbar");

const ExampleBottomRightToolbar = ({ react, setupController }) => {
    const [tooltipVisible, setTooltipVisible] = react.useState(false);

    const onMouseEnter = () => {
        setTooltipVisible(true);
        engine.trigger("audio.playSound", "hover-item", 1);
    };

    const onMouseLeave = () => {
        setTooltipVisible(false);
    };

    const { ToolTip, ToolTipContent } = window.$_gooee.framework;

    const { model, update } = setupController();

    const onClick = () => {
        const newValue = !model.IsVisible;
        update("IsVisible", newValue);
        engine.trigger("audio.playSound", "select-item", 1);

        if (newValue) {
            engine.trigger("audio.playSound", "open-panel", 1);
            engine.trigger("tool.selectTool", null);
        }
        else
            engine.trigger("audio.playSound", "close-panel", 1);
    };
    return <>
        <div className="spacer_oEi"></div>
        <button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick} class="button_s2g button_ECf item_It6 item-mouse-states_Fmi item-selected_tAM item-focused_FuT button_s2g button_ECf item_It6 item-mouse-states_Fmi item-selected_tAM item-focused_FuT toggle-states_X82 toggle-states_DTm">

            <div className="fa fa-solid-toolbox icon-lg"></div>

            <ToolTip visible={tooltipVisible} float="up" align="right">
                <ToolTipContent title="Test" description="Hello, world!" />
            </ToolTip>
        </button>
    </>;
};

window.$_gooee.register("example", "ExampleBottomRightToolbar", ExampleBottomRightToolbar, "bottom-right-toolbar", "example");


const ExampleBottomLeftToolbar = ({ react }) => {
    const [tooltipVisible, setTooltipVisible] = react.useState(false);

    const onMouseEnter = () => {
        setTooltipVisible(true);
        engine.trigger("audio.playSound", "hover-item", 1);
    };

    const onMouseLeave = () => {
        setTooltipVisible(false);
    };

    const { ToolTip, ToolTipContent } = window.$_gooee.framework;

    return <>
        <button onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} class="button_ECf item_It6 item-mouse-states_Fmi item-selected_tAM item-focused_FuT button_ECf item_It6 item-mouse-states_Fmi item-selected_tAM item-focused_FuT button_cBV toggle-states_DTm">

            <div className="fa fa-solid-toolbox icon-lg"></div>

            <ToolTip visible={tooltipVisible} float="up" align="center">
                <ToolTipContent title="Test" description="Hello, world!" />
            </ToolTip>
        </button>
    </>;
};

window.$_gooee.register("example", "ExampleBottomLeftToolbar", ExampleBottomLeftToolbar, "bottom-left-toolbar");

const ExampleMainContainer = ({ react, setupController }) => {
    const { Icon, Button, TabModal } = window.$_gooee.framework;

    const { model, update, trigger } = setupController();

    const tabs = [
        {
            name: "ONE",
            label: <div>
                <Icon icon="solid-eye" fa />
            </div>,
            content:
                <div>
                    <h4 className="mb-2">{model.Message} {model.IsVisible ? "Yes" : "No"}</h4>
                    <Button color="primary" onClick={() => trigger("OnTestClick")}>Test</Button>
                </div>

        }, {
            name: "TWO",
            label: <div>
                <Icon icon="solid-person" fa />
            </div>,
            content: <div>Test</div>
        }, {
            name: "THREE",
            label: <div>
                <Icon icon="solid-lungs" fa />
            </div>,
            content: <div>Test</div>
        }];

    const closeModal = () => {
        update("IsVisible", false);
        engine.trigger("audio.playSound", "close-panel", 1);
    };

    return model.IsVisible ? <TabModal size="sm" tabs={tabs} onClose={closeModal} fixed /> : null;
};

window.$_gooee.register("example", "ExampleMainContainer", ExampleMainContainer, "main-container", "example");