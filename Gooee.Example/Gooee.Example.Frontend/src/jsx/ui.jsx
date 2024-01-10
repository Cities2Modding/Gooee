import React from "react";

const ExampleTopLeftToolbar = ({ react }) => {
    const onMouseEnter = (e) => {
        engine.trigger("audio.playSound", "hover-item", 1);
    };
    return <button className="button_ke4 button_ke4 button_H9N ml-3" onMouseEnter={onMouseEnter}>
        <div className="tinted-icon_iKo icon_be5 icon-close"></div>
    </button>;
};

window.$_gooee.register("example", "ExampleTopLeftToolbar", ExampleTopLeftToolbar, "top-left-toolbar");

const ExampleTopRightToolbar = ({ react }) => {
    const onMouseEnter = (e) => {
        engine.trigger("audio.playSound", "hover-item", 1);
    };
    return <button className="button_ke4 button_ke4 button_H9N mr-3" onMouseEnter={onMouseEnter}>
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
        <div className="spacer_oEi"></div>
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
    const [sliderValue, setSliderValue] = react.useState(0);

    const { Button, Icon, Slider, Grid, FormGroup, FormCheckBox, ToolTip, ToolTipContent, TabModal, Modal } = window.$_gooee.framework;

    const { model, update, trigger } = setupController();

    const tabs = [
        {
            name: "ONE",
            label: <div>
                <div className="fa fa-solid-eye"></div>
            </div>,
            content:
                <div>{model.Message} {model.IsVisible ? "Yes" : "No"} <button className="btn btn-primary" onClick={() => trigger("OnTestClick")}>Test</button></div>

        }, {
            name: "TWO",
            label: <div>
                <div className="fa fa-solid-person"></div>
            </div>,
            content: <div>Test</div>
        }, {
            name: "THREE",
            label: <div>
                <div className="fa fa-solid-lungs"></div>
            </div>,
            content: <div>Test</div>
        }];

    const closeModal = () => {
        update("IsVisible", false);
        engine.trigger("audio.playSound", "close-panel", 1);
    };

    return model.IsVisible ? <div className="tool-layout">
        <div className="col">
            <div className="bg-panel text-light p-4 rounded-sm">
                <div className="d-flex flex-row align-items-center justify-content-center mb-2">
                    <div className="flex-1">
                        Tool Mode
                    </div>
                    <Button className="mr-1 active" color="tool" size="sm" icon>
                        <Icon icon="Media/Tools/Net Tool/Grid.svg" />
                    </Button>
                    <Button className="mr-1" color="tool" size="sm" icon>
                        <Icon icon="Media/Tools/Net Tool/Straight.svg" />
                    </Button>
                    <Button color="tool" size="sm" icon>
                        <Icon icon="Media/Tools/Net Tool/SimpleCurve.svg" />
                    </Button>
                </div>
                <FormGroup label="Some setting" className="form-group">
                    <Grid>
                        <div className="col-10">
                            <Slider onValueChanged={(val) => setSliderValue(val)} />
                        </div>
                        <div className="col-2 align-items-center justify-content-center text-muted">
                            {sliderValue + "%"}
                        </div>
                    </Grid>
                </FormGroup>
                <FormGroup label="Some Group" className="form-group">
                    <FormCheckBox label="Some setting" checked={model.IsVisible} />
                </FormGroup>

            </div>
        </div>
        <div className="col">
            <TabModal tabs={tabs} bodyClassName="asset-menu" onClose={closeModal}>
            </TabModal>
        </div>
        <div className="col">
            Test
        </div>
    </div> : null;
};

window.$_gooee.register("example", "ExampleMainContainer", ExampleMainContainer, "main-container", "example");