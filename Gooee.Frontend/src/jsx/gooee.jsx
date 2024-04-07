import Button from "./components/_button";
import Grid from "./components/_grid";
import ToolTip from "./components/_tooltip";
import AutoToolTip from "./components/_auto-tooltip";
import ToolTipContent from "./components/_tooltip-content";
import Scrollable from "./components/_scrollable";
import Modal from "./components/_modal";
import TabModal from "./components/_tab-modal";
import MoveableModal from "./components/_moveable-modal";
import Dropdown from "./components/_dropdown";
import DropdownMenu from "./components/_dropdown-menu";
import CheckBox from "./components/_checkbox";
import CheckBoxGroup from "./components/_checkbox-group";
import TextBox from "./components/_textbox";
import RadioItem from "./components/_radio-item";
import RadioGroup from "./components/_radio-group";
import Slider from "./components/_slider";
import GridSlider from "./components/_grid-slider";
import GradientSlider from "./components/_gradient-slider";
import Icon from "./components/_icon";
import Code from "./components/_code";
import FormGroup from "./components/_form-group";
import FormCheckBox from "./components/_form-checkbox";
import MarkDown from "./components/_markdown";
import Container from "./components/_container";
import List from "./components/_list";
import VirtualList from "./components/_virtual-list";
import ToggleButtonGroup from "./components/_toggle-button-group";
import ProgressBar from "./components/_progress-bar";
import PieChart from "./components/_pie-chart";
import ColorPicker from "./components/_color-picker";
import FloatingElement from "./components/_floating-element";
import TabControl from "./components/_tab-control";
import useDebouncedCallback from "./_debouncer";

//import ChangeLog from "./modules/_changelog";

const GooeeContainer = ({ pluginType }) => {
    var react = window.React;
    window.$_gooee.react = react;
    const [plugins, setPlugins] = react.useState([]);

    const wrapWithGooee = pluginType === "default"
        || pluginType === "photomode-container";

    const getColours = react.useCallback(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        return {
            base: {
                primary: rootStyle.getPropertyValue('--gPrimary').trim(),
                secondary: rootStyle.getPropertyValue('--gSecondary').trim(),
                info: rootStyle.getPropertyValue('--gInfo').trim(),
                success: rootStyle.getPropertyValue('--gSuccess').trim(),
                warning: rootStyle.getPropertyValue('--gWarning').trim(),
                danger: rootStyle.getPropertyValue('--gDanger').trim(),
                light: rootStyle.getPropertyValue('--gLight').trim(),
                dark: rootStyle.getPropertyValue('--gDark').trim(),
                text: rootStyle.getPropertyValue('--gText').trim(),
                textInverted: rootStyle.getPropertyValue('--gTextInverted').trim(),
                muted: rootStyle.getPropertyValue('--gMuted').trim(),
                white: rootStyle.getPropertyValue('--gWhite').trim(),
                black: rootStyle.getPropertyValue('--gBlack').trim(),
                grey: rootStyle.getPropertyValue('--gGrey').trim()
            },
            trans: {
                primary: rootStyle.getPropertyValue('--gPrimaryTrans').trim(),
                secondary: rootStyle.getPropertyValue('--gSecondaryTrans').trim(),
                info: rootStyle.getPropertyValue('--gInfoTrans').trim(),
                success: rootStyle.getPropertyValue('--gSuccessTrans').trim(),
                warning: rootStyle.getPropertyValue('--gWarningTrans').trim(),
                danger: rootStyle.getPropertyValue('--gDangerTrans').trim(),
                light: rootStyle.getPropertyValue('--gLightTrans').trim(),
                dark: rootStyle.getPropertyValue('--gDarkTrans').trim(),
                text: rootStyle.getPropertyValue('--gTextTrans').trim(),
                textInverted: rootStyle.getPropertyValue('--gTextInvertedTrans').trim(),
                muted: rootStyle.getPropertyValue('--gMutedTrans').trim(),
                white: rootStyle.getPropertyValue('--gWhiteTrans').trim(),
                black: rootStyle.getPropertyValue('--gBlackTrans').trim(),
                grey: rootStyle.getPropertyValue('--gGreyTrans').trim()
            }
        };
    }, []);

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

    const gooeeColours = getColours();

    const renderPlugins =
        plugins.map(name => {
            const { PluginName, ComponentInstance, Controller } = window.$_gooee.components[pluginType][name];

            const getController = () => {
                if (Controller) {
                    if (!window.$_gooee.bindings[Controller]) {
                        window.$_gooee.bindings[Controller] = () => {
                            const [model, setModel] = react.useState(window.$_gooee_defaultModel[`${PluginName}.${Controller}`] ?? {});

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
                                colors: gooeeColours,
                                trigger: (eventName, value) => {
                                    if (typeof value !== "undefined")
                                        engine.trigger(`${PluginName}.${Controller}.${eventName}`, value);
                                    else
                                        engine.trigger(`${PluginName}.${Controller}.${eventName}`);
                                },
                                update: (prop, val) => {
                                    const newValue = { ...model };
                                    newValue[prop] = val;

                                    //if (JSON.stringify(newValue) != JSON.stringify(model)) {
                                        setModel(newValue);
                                        engine.trigger(`${PluginName}.${Controller}.updateProperty`, JSON.stringify({ property: prop, value: val }));
                                    //}
                                },
                                _L: (key) => {
                                    return engine.translate(key);
                                }
                            };
                        };
                    }
                }

                if (window.$_gooee.bindings[Controller])
                    return window.$_gooee.bindings[Controller];

                return () => { return { model: null, update: null, trigger: null, _L: () => { }, colors: gooeeColours } };
            };

            const setupController = getController();

            switch (pluginType) {
                case "top-left-toolbar":
                case "top-right-toolbar":
                case "bottom-right-toolbar":
                case "bottom-left-toolbar":
                /*case "bottom-center-toolbar":*/
                case "main-container":
                case "main-container-end":
                case "photomode-container":
                case "main-menu":
                case "bottom-right-container":
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
        const [hasPluginsToShow, setHasPluginsToShow] = react.useState(false);
        //const panelRef = react.useRef(false);
        const buttonRef = react.useRef(false);

        const [toolbarDynamicChildren, setToolbarDynamicChildren] = react.useState({});

        react.useEffect(() => {
            const eventName = "gooee.toolbarChildren";
            const updateEvent = eventName + ".update";
            const subscribeEvent = eventName + ".subscribe";
            const unsubscribeEvent = eventName + ".unsubscribe";

            var sub = engine.on(updateEvent, (data) => {
                setToolbarDynamicChildren(data ? JSON.parse(data) : {});
            })

            engine.trigger(subscribeEvent);
            return () => {
                engine.trigger(unsubscribeEvent);
                sub.clear();
            };
        }, []);

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

        //const handleClickOutside = (event) => {
        //    if (!toolbarVisible)
        //        return;

        //    if (panelRef.current && !panelRef.current.contains(event.target) &&
        //        buttonRef.current && buttonRef.current !== event.target.parentElement) {
        //        setToolbarVisible(false);
        //        engine.trigger("audio.playSound", "close-panel", 1);
        //    }
        //};

        const onDropdownHidden = () => {
            if (!toolbarVisible)
                return;

            setToolbarVisible(false);
            engine.trigger("audio.playSound", "close-panel", 1);
        };

        //react.useEffect(() => {
        //    // Toggle the click listener based on dropdown state
        //    if (toolbarVisible) {
        //        document.addEventListener('click', handleClickOutside, true);
        //    } else {
        //        document.removeEventListener('click', handleClickOutside, true);
        //    }
        //}, [toolbarVisible]);

        //const onItemClicked = (p) => {
        //    setToolbarVisible(false);
        //    engine.trigger(`${p.Name.toLowerCase()}.${p.Controller}.${p.Method}`);
        //};

        const onDropDownItemClick = (key) => {
            const toolbarItem = window.$_gooee_toolbar[key];

            if (!toolbarItem)
                return;

            setToolbarVisible(false);

            const triggerKey = `${toolbarItem.Name.toLowerCase()}.${toolbarItem.Controller}.${toolbarItem.Method}`;

            if (toolbarItem.MethodKey)
                engine.trigger(triggerKey, toolbarItem.MethodKey);
            else
                engine.trigger(triggerKey);
        };

        const onDropDownChildItemClick = (key, childItem) => {
            const toolbarItem = window.$_gooee_toolbar[key];

            if (!toolbarItem || (!toolbarItem.Children && (!toolbarDynamicChildren || (toolbarDynamicChildren && !toolbarDynamicChildren[key.toLowerCase()]))))
                return;

            const childKey = childItem.key;
            const childIndex = parseInt(childKey);

            if (!isNaN(childIndex) && childIndex >= 0) {
                const childToolbarItem = childItem.isDynamic ? toolbarDynamicChildren[key.toLowerCase()][childIndex] : toolbarItem.Children[childIndex];

                if (childToolbarItem) {
                    const method = childToolbarItem.OnClick ? childToolbarItem.OnClick : childToolbarItem.Method;
                    const triggerKey = `${toolbarItem.Name.toLowerCase()}.${toolbarItem.Controller}.${method}`;
                    const methodKey = childItem.isDynamic && childToolbarItem.OnClickKey ? childToolbarItem.OnClickKey : childToolbarItem.MethodKey;
                    if (methodKey)
                        engine.trigger(triggerKey, methodKey);
                    else
                        engine.trigger(triggerKey);
                }
            }
            setToolbarVisible(false);
        };

        const dropdownMenuItems = react.useMemo(() => {
            let items = [];
            let hasPlugins = false;

            pluginIds.forEach(pluginId => {
                const toolbarItem = window.$_gooee_toolbar[pluginId];

                if (!toolbarItem)
                    return;

                hasPlugins = true;

                let childItems = [];

                if (toolbarItem.Children && toolbarItem.Children.length > 0) {
                    toolbarItem.Children.forEach((childItem, index) => {
                        childItems.push({
                            key: `${index}`,
                            label: engine.translate(childItem.Label),
                            icon: childItem.Icon,
                            iconClassName: childItem.IconClassName,
                            fa: childItem.IsFAIcon,
                            isDynamic: false
                        });
                    });
                }

                if (toolbarDynamicChildren && toolbarDynamicChildren[pluginId]) {
                    const dynamicChildren = toolbarDynamicChildren[pluginId];
                    dynamicChildren.forEach((childItem, index) => {
                        childItems.push({
                            key: `${index}`,
                            label: engine.translate(childItem.Label),
                            icon: childItem.Icon,
                            iconClassName: childItem.IconClassName,
                            fa: childItem.IsFAIcon,
                            isDynamic: true
                        });
                    });
                }
                items.push({
                    key: pluginId,
                    label: engine.translate(toolbarItem.Label && toolbarItem.Label.length > 0 ? toolbarItem.Label : toolbarItem.Name),
                    icon: toolbarItem.Icon,
                    iconClassName: toolbarItem.IconClassName,
                    fa: toolbarItem.IsFAIcon,
                    children: childItems.length == 0 ? null : childItems
                });
            });
            setHasPluginsToShow(hasPlugins);
            return items;
        }, [toolbarDynamicChildren]);

        return hasPluginsToShow ? <>
            <button ref={buttonRef} className="button_ke4 button_h9N"
                onMouseEnter={onMouseOverToolbar} onClick={onMouseClickToolbar}>
                <Icon icon="solid-briefcase" className="icon_be5" size="lg" fa />
            </button>
            <DropdownMenu buttonRef={buttonRef} visible={toolbarVisible} items={dropdownMenuItems}
                onItemClick={onDropDownItemClick} onChildItemClick={onDropDownChildItemClick}
                onHidden={onDropdownHidden} />
        </> : null;
    };

    const render = <>
        {wrapWithGooee ? <div class="gooee">
        {renderPlugins}
        </div> : <>{pluginType === "top-left-toolbar" ? topLeftToolbar() : null}{renderPlugins}</>}
    </>;
    return render;
};

window.$_gooee.react = null;
window.$_gooee.container = GooeeContainer;
window.$_gooee.framework = {
    Button,
    ToggleButtonGroup,
    Grid,
    ToolTip,
    Container,
    AutoToolTip,
    ToolTipContent,
    Scrollable,
    Modal,
    TabModal,
    TabControl,
    MoveableModal,
    Dropdown,
    DropdownMenu,
    CheckBox,
    CheckBoxGroup,
    RadioItem,
    RadioGroup,
    Code,
    TextBox,
    Icon,
    Slider,
    GridSlider,
    GradientSlider,
    FormGroup,
    FormCheckBox,
    MarkDown,
    List,
    VirtualList,
    ProgressBar,
    PieChart,
    ColorPicker,
    FloatingElement,
    useDebouncedCallback
};

console.log("dasdasdasd");