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
import ToggleButtonGroup from "./components/_toggle-button-group";

const GooeeContainer = ({ react, pluginType }) => {
    window.$_gooee.react = react;
    const [plugins, setPlugins] = react.useState([]);

    const wrapWithGooee = pluginType === "default" || pluginType === "main-container";    

    react.useEffect(() => {
        const interval = setInterval(function () {
                if (window.$_gooee.components && window.$_gooee.components[pluginType]) {
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
    List
};


//const ChangeNotesWindow = ({ react, setupController }) => {
//    const { Button, ToggleButtonGroup, Icon, Slider, List, Grid, FormGroup, FormCheckBox, Scrollable, ToolTip, ToolTipContent, TabModal, Modal, MarkDown } = window.$_gooee.framework;
//    const [visible, setVisible] = react.useState(false);

//    react.useEffect(() => {
//        const eventName = `gooee.showChangeLog`;
//        const updateEvent = eventName + ".update";
//        const subscribeEvent = eventName + ".subscribe";
//        const unsubscribeEvent = eventName + ".unsubscribe";

//        var sub = engine.on(updateEvent, (data) => {
//            setVisible(data);
//        })

//        engine.trigger(subscribeEvent);
//        return () => {
//            engine.trigger(unsubscribeEvent);
//            sub.clear();
//        };
//    }, []);

//    const closeModal = () => {
//        engine.trigger("gooee.onCloseChangeLog");
//        engine.trigger("audio.playSound", "close-panel", 1);
//        setVisible(false);
//    };

//    const newLogs = [...window.$_gooee_changeLogs];
//    const oldLogs = [
//        { "name": "Unemployment Monitor", "version": "1.0.1" },
//        { "name": "Another Monitor", "version": "0.0.1" },
//        { "name": "Yet Another Mod", "version": "0.0.1" }
//    ];

//    const logUrls = [];
//    logUrls[0] = "coui://gooeeui/Plugins/DucksInARow.md";
//    logUrls[1] = "https://raw.githubusercontent.com/89pleasure/cities2-extended-tooltip/main/README.md";
//    logUrls[2] = "https://raw.githubusercontent.com/Cities2Modding/UnemploymentMonitor/main/README.md";
//    logUrls[3] = "https://raw.githubusercontent.com/Cities2Modding/UnemploymentMonitor/main/README.md";
//    logUrls[4] = "https://raw.githubusercontent.com/Cities2Modding/UnemploymentMonitor/main/README.md";

//    const combinedLogs = [...newLogs, ...oldLogs];
    
//    const [selectedLog, setSelectedLog] = react.useState(logUrls[0]);

//    const onModSelected = (index) => {
//        setSelectedLog(logUrls[index]);
//    };

//    return visible ? <Modal title="Mod Changelogs" fixed size="lg" onClose={closeModal}>
//        <Grid>
//            <div className="col-3">
//                <Scrollable className="h-100">
//                    <ToggleButtonGroup onSelectionChanged={onModSelected}>
//                        <h2 className="mb-1 text-muted">New</h2>
//                        {newLogs.map(newLog => {
//                            return <button key={newLog.name}>{newLog.name}&nbsp;<b>({newLog.version})</b> {newLog.timestamp}</button>
//                        })}
//                        <h2 className="mb-1 mt-1 text-muted">Read</h2>
//                        {oldLogs.map(oldLog => {
//                            return <button key={oldLog.name}>{oldLog.name}&nbsp;<b>({oldLog.version})</b></button>
//                        })}
//                    </ToggleButtonGroup>
//                </Scrollable>
//            </div>
//            <div className="col-9 bg-section-dark rounded-sm">
//                <Scrollable className="h-100">
//                    <MarkDown className="p-5" url={selectedLog} />
//                </Scrollable>
//            </div>
//        </Grid>
//    </Modal> : null;
//};

//window.$_gooee.register("ducksinarow", "ChangeNotesWindow", ChangeNotesWindow, "main-container");