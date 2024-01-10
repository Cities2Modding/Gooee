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

const GooeeContainer = ({ react, pluginType }) => {
    window.$_gooee.react = react;
    const [plugins, setPlugins] = react.useState([]);

    const wrapWithGooee = pluginType === "default" || pluginType === "main-container";    

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
                            const [model, setModel] = react.useState({});

                            react.useEffect(() => {
                                const eventName = `${PluginName}.${Controller}.model`;
                                const updateEvent = eventName + ".update";
                                const subscribeEvent = eventName + ".subscribe";
                                const unsubscribeEvent = eventName + ".unsubscribe";

                                var sub = engine.on(updateEvent, (data) => {
                                    setModel(data);
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
                            };
                        };
                    }

                    return window.$_gooee.bindings[Controller];
                }

                return null;
            };

            const setupController = getController();

            switch (pluginType) {
                case "top-left-toolbar":
                case "top-right-toolbar":
                case "bottom-right-toolbar":
                case "bottom-left-toolbar":
                case "bottom-center-toolbar":
                case "main-container":
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
    return wrapWithGooee ? <div class="gooee">
        {renderPlugins}
    </div> : renderPlugins;
};

window.$_gooee.react = null;
window.$_gooee.container = GooeeContainer;
window.$_gooee.framework = {
    Button,
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
    FormCheckBox
};