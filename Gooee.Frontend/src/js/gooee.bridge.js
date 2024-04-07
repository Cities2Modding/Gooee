// Simplified module system
const moduleContainer = {};

function defineModule(id, factory) {
    moduleContainer[id] = { factory, exports: {} };
}

function requireModule(id) {
    const module = moduleContainer[id];
    if (!module.exports) {
        module.factory(module.exports = {}, requireModule);
    }
    return module.exports;
}

// Define your modules
defineModule('HelloWorldComponent', (exports, require) => {
    exports.HelloWorldComponent = () => {
        console.log("Hello world!");
        return null;
    };
});

defineModule('Main', (exports, require) => {
    const { HelloWorldComponent } = require('HelloWorldComponent');
    // Your mod registration code here
});

// Bootstrap your mod
requireModule('Main');

var n = simplifiedModuleSystem.ModComponent;
const a = true; // Assuming this is a flag to indicate the module is ready or for some other purpose
export {
    a as isModuleReady,
    n as ModComponent
};