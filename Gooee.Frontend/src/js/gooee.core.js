window.$_gooee = {};
window.$_gooee.components = [];
window.$_gooee.bindings = [];
window.$_gooee.register = function (plugin, name, component, type, controller) {
    var actualType = type ? type : "default";

    if (!window.$_gooee.components[actualType])
        window.$_gooee.components[actualType] = [];

    window.$_gooee.components[actualType][name] = {
        PluginName: plugin,
        ComponentInstance: component,
        Controller: controller
    };
    console.log(`Registering plugin component for Gooee: ${name} of type ${actualType} ${JSON.stringify(window.$_gooee.components[actualType][name])}`);
};