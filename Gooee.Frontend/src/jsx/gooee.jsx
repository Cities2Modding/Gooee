import React from "react";
import Button from "./components/_button";
import Grid from "./components/_grid";
import ToolTip from "./components/_tooltip";
import ToolTipContent from "./components/_tooltip-content";
import Scrollable from "./components/_scrollable";
import Modal from "./components/_modal";
import TabModal from "./components/_tab-modal";
import Dropdown from "./components/_dropdown";
import CheckBox from "./components/_checkbox";
import CheckBoxGroup from "./components/_checkbox-group";
import TextBox from "./components/_textbox";
import RadioItem from "./components/_radio-item";
import RadioGroup from "./components/_radio-group";
import Slider from "./components/_slider";
import GradientSlider from "./components/_gradient-slider";
import Icon from "./components/_icon";
import Code from "./components/_code";
import FormGroup from "./components/_form-group";
import FormCheckBox from "./components/_form-checkbox";
import MarkDown from "./components/_markdown";
import List from "./components/_list";
import VirtualList from "./components/_virtual-list";
import ToggleButtonGroup from "./components/_toggle-button-group";
//import ChangeLog from "./modules/_changelog";

const GooeeContainer = ({ react, pluginType, photoMode }) => {
    window.$_gooee.react = react;
    const [plugins, setPlugins] = react.useState([]);

    const wrapWithGooee = pluginType === "default" || pluginType === "main-container" || pluginType === "photomode-container";

    react.useEffect(() => {
        const interval = setInterval(function () {
            if (window.$_gooee.components && window.$_gooee.components[pluginType] ) {
                clearInterval(interval);
                setPlugins(Object.keys(window.$_gooee.components[pluginType]));
            }
        }, 100);
        return () => {
        };
    }, [plugins]);

    const renderPlugins =
        plugins.map(name => {
            const { PluginName, ComponentInstance, Controller } = window.$_gooee.components[pluginType][name];

            const getController = () => {
                if (Controller) {
                    if (!window.$_gooee.bindings[Controller]) {
                        window.$_gooee.bindings[Controller] = () => {
                            const [model, setModel] = react.useState(window.$_gooee_defaultModel[`${PluginName}.${Controller}`] ?? {});

                            //react.useEffect(() => {
                            //    const prefix = `gooee.binding.${PluginName}.${Controller}`;
                            //    const updateEvent = `${prefix}.get`;

                            //    var sub = engine.on(updateEvent, (json) => {
                            //        setModel(JSON.parse(json));
                            //    })

                            //    return () => {
                            //        sub.clear();
                            //    };
                            //}, []);

                            react.useEffect(() => {
                                const eventName = `${PluginName}.${Controller}.model`;
                                const updateEvent = eventName + ".update";
                                const subscribeEvent = eventName + ".subscribe";
                                const unsubscribeEvent = eventName + ".unsubscribe";
                                
                                var sub = engine.on(updateEvent, (data) => {
                                    setModel(data ? JSON.parse(data) : {});
                                })

                                engine.trigger(subscribeEvent);
                                return () => {
                                    engine.trigger(unsubscribeEvent);
                                    sub.clear();
                                };
                            }, []);

                            return {
                                model: model,
                                trigger: (eventName, value) => {
                                    if (typeof value !== "undefined")
                                        engine.trigger(`${PluginName}.${Controller}.${eventName}`, value);
                                    else
                                        engine.trigger(`${PluginName}.${Controller}.${eventName}`);
                                },
                                update: (prop, val) => {
                                    const newValue = { ...model };
                                    newValue[prop] = val;
                                    setModel(newValue);
                                    engine.trigger(`${PluginName}.${Controller}.updateProperty`, JSON.stringify({ property: prop, value: val }));
                                }
                                //trigger: (eventName, value) => {
                                //    if (typeof value !== "undefined")
                                //        engine.trigger(`${PluginName}.${Controller}.${eventName}`, value);
                                //    else
                                //        engine.trigger(`${PluginName}.${Controller}.${eventName}`);
                                //},
                                //update: (prop, val) => {
                                //    const newValue = { ...model };
                                //    newValue[prop] = val;
                                //    setModel(newValue);
                                //    engine.trigger(`gooee.binding.${PluginName}.${Controller}.set`, JSON.stringify(newValue));
                                //}
                            };
                        };
                    }
                }

                if (window.$_gooee.bindings[Controller])
                    return window.$_gooee.bindings[Controller];

                return () => { return { model: null, update: null, trigger: null } };
            };

            const setupController = getController();

            switch (pluginType) {
                case "top-left-toolbar":
                case "top-right-toolbar":
                case "bottom-right-toolbar":
                case "bottom-left-toolbar":
                case "bottom-center-toolbar":
                case "main-container":
                case "photomode-container":
                    return <ComponentInstance key={name} react={react} setupController={setupController} />;
                    break;

                case "infomode-menu":
                    return <ComponentInstance key={name} react={react} setupController={setupController} />;
                    break;

                default:
                case "default":
                    return <div key={name} class="d-flex align-items-center justify-content-center position-fixed w-100 h-100"><ComponentInstance react={react} setupController={setupController} /></div>;
                    break;
            }
        });            

    const topLeftToolbar = () => {
        const pluginIds = Object.keys(window.$_gooee_toolbar);
        const [toolbarVisible, setToolbarVisible] = react.useState(false);
        const panelRef = react.useRef(false);
        const buttonRef = react.useRef(false);

        const onMouseOverToolbar = () => {
            engine.trigger("audio.playSound", "hover-item", 1);
        };

        const onMouseClickToolbar = () => {
            engine.trigger("audio.playSound", "select-item", 1);
            const wasVisible = toolbarVisible;
            setToolbarVisible(!wasVisible);

            if (!wasVisible) {
                engine.trigger("audio.playSound", "open-panel", 1);
                window.engine.trigger("game.closePanel", "Game.UI.InGame.InfoviewMenu");
                window.engine.trigger('hookui.toggle_menu', false)
            }
            else
                engine.trigger("audio.playSound", "close-panel", 1);
        };

        react.useEffect(() => {
            const subscription = window.engine.on("game.showPanel", (panel) => {
                if (panel === "Game.UI.InGame.InfoviewMenu") {
                    setToolbarVisible(false);
                    engine.trigger("audio.playSound", "close-panel", 1);
                }
            })
            window.engine.trigger("game.showPanel.subscribe");

            return () => {
                window.engine.trigger("game.showPanel.unsubscribe");
                subscription.clear();
            };
        }, [toolbarVisible]);

        const handleClickOutside = (event) => {
            if (!toolbarVisible)
                return;

            if (panelRef.current && !panelRef.current.contains(event.target) &&
                buttonRef.current && buttonRef.current !== event.target.parentElement) {
                setToolbarVisible(false);
                engine.trigger("audio.playSound", "close-panel", 1);
            }
        };

        react.useEffect(() => {
            // Toggle the click listener based on dropdown state
            if (toolbarVisible) {
                document.addEventListener('click', handleClickOutside, true);
            } else {
                document.removeEventListener('click', handleClickOutside, true);
            }
        }, [toolbarVisible]);

        const onItemClicked = (p) => {
            setToolbarVisible(false);
            engine.trigger(`${p.Name.toLowerCase()}.${p.Controller}.${p.Method}`);
        };

        return <button ref={buttonRef} className="button_ke4 button_ke4 button_H9N" onMouseEnter={onMouseOverToolbar} onClick={onMouseClickToolbar}>
                <Icon icon="solid-toolbox" className="icon_be5" size="lg" fa />
            {toolbarVisible ? <div ref={panelRef} className="bg-panel text-light mt-3 rounded-sm" style={{ position: 'absolute', top: '100%', left: '0' }}>
                {pluginIds.map((p, index) => (
                    <Button color="light" onClick={() => onItemClicked(window.$_gooee_toolbar[p])} isBlock className="text-light btn-transparent" style="trans-faded" key={index}><Icon className="mr-1" icon={window.$_gooee_toolbar[p].Icon} /> {window.$_gooee_toolbar[p].Name}</Button>
                    ))}
                </div> : null}
            </button>;
    };

    const render = <>
        {wrapWithGooee ? <div class="gooee">
        {renderPlugins}
        </div> : <>{pluginType === "top-left-toolbar" ? topLeftToolbar() : null}{renderPlugins}</>}
    </>;

    if (pluginType === "photomode-container") {
        return <div className={photoMode.className}>
            <div className="photomode-wrapper">{photoMode.children}</div>
            {render}
            <div className="gooee">
                <Modal title="Test" className="photomode-wrapper">
                    <div>
                        Hello, world!
                    </div>
                </Modal>
            </div>
        </div>;
    }
    return render;
};

window.$_gooee.react = null;
window.$_gooee.container = GooeeContainer;
window.$_gooee.framework = {
    Button,
    ToggleButtonGroup,
    Grid,
    ToolTip,
    ToolTipContent,
    Scrollable,
    Modal,
    TabModal,
    Dropdown,
    CheckBox,
    CheckBoxGroup,
    RadioItem,
    RadioGroup,
    Code,
    TextBox,
    Icon,
    Slider,
    GradientSlider,
    FormGroup,
    FormCheckBox,
    MarkDown,
    List,
    VirtualList
};