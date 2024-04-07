window.$_gooee = {};
window.$_gooee.components = [];
window.$_gooee.bindings = [];
window.$_gooee.register = function (plugin, name, component, type, controller) {
    var actualType = type ? type : "default";

    if (!window.$_gooee.components[actualType])
        window.$_gooee.components[actualType] = [];

    if (window.$_gooee.components[actualType][name] && window.$_gooee.components[actualType][name].PluginName !== plugin) {
        console.log(`Cannot register under ${name} as it already exists for another plugin. Making unique...`);
        name = `${plugin}_${name}`;
    }
    window.$_gooee.components[actualType][name] = {
        PluginName: plugin,
        ComponentInstance: component,
        Controller: controller
    };
    console.log(`Registering plugin component for Gooee: ${name} of type ${actualType} ${JSON.stringify(window.$_gooee.components[actualType][name])}`);
};

function _gHexToRGBA(hex, alpha) {
    // Ensure the hex value includes the '#' character
    if (hex[0] !== '#') {
        hex = '#' + hex;
    }

    // Expand shorthand hex code to full form if needed
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    // Extract the red, green, and blue values
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Return the RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function _gRGBToHex(r, g, b, excludeHash = false) {
    // Convert each color component to a hexadecimal string
    let hexR = r.toString(16).padStart(2, '0').toUpperCase();
    let hexG = g.toString(16).padStart(2, '0').toUpperCase();
    let hexB = b.toString(16).padStart(2, '0').toUpperCase();

    // Concatenate the hex strings and prefix with '#'
    return `${excludeHash ? "" : "#"}${hexR}${hexG}${hexB}`;
}

function _gHexToRGB(hex) {
    // Remove the '#' character if present
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }

    // Parse the hex string into RGB components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Return an object with the RGB components
    return { r, g, b };
}


function _gRGBToHSV(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let chroma = max - min;
    let hue = 0;
    let saturation = 0;
    let brightness = max;

    if (chroma !== 0) {
        if (max === r) {
            hue = (g - b) / chroma;
        } else if (max === g) {
            hue = 2 + (b - r) / chroma;
        } else if (max === b) {
            hue = 4 + (r - g) / chroma;
        }

        hue = Math.min(hue * 60, 360);
        if (hue < 0) hue += 360;
    }

    if (max !== 0) {
        saturation = chroma / max;
    }

    // Convert saturation and brightness to percentages
    saturation *= 100;
    brightness *= 100;

    return { h: hue, s: saturation, v: brightness };
}

function _gHSVToRGB(h, s, v) {
    s /= 100;
    v /= 100;

    let k = (n) => (n + h / 60) % 6;
    let f = (n) => v - v * s * Math.max(Math.min(k(n), 4 - k(n), 1), 0);

    let r = Math.round(f(5) * 255);
    let g = Math.round(f(3) * 255);
    let b = Math.round(f(1) * 255);

    return { r, g, b };
}

function _gHexToHSL(hex) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }

    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function _gDarkenHex(hex, amount) {
    let { h, s, l } = _gHexToHSL(hex);

    l = Math.max(0, l - amount); // Clamp the lightness to not go below 0

    // Convert HSL back to hex
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0'); // Convert to Hex and force 2 digits
    };

    return `#${f(0)}${f(8)}${f(4)}`;
}

function _gRgbaToHex(rgba) {
    const match = rgba.match(/rgba?\((\d+), (\d+), (\d+)(?:, (.*))?\)/);
    if (!match) {
        throw new Error('Invalid RGBA color: ' + rgba);
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const alpha = match[4] || '1'; // Keep the alpha as a string

    return {
        hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`,
        alpha: alpha === '1' ? undefined : alpha // Only store alpha if it's not 1
    };
}

function _gParseRgba(rgba) {
    const match = rgba.match(/rgba?\((\d+), (\d+), (\d+)(?:, (.*))?\)/);
    if (!match) {
        throw new Error('Invalid RGBA color: ' + rgba);
    }

    // Parse the red, green, and blue values directly from the match
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const a = match[4] ? match[4].startsWith("var(") ? match[4] : parseFloat(match[4]) : 1;    
    return { r, g, b, a };
}

function _gHexToRgba(hex, alpha) {
    const hexValue = hex.replace(/^#/, '');
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha ?? 1})`;
}

function _gBroadcastVisibilityChange(typeKey, guid) {
    const event = new CustomEvent('floatingElementVisibilityChange', {
        detail: { typeKey, guid }
    });
    document.dispatchEvent(event);
}