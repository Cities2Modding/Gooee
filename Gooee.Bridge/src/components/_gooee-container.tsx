import { ModuleRegistryExtend } from "cs2/modding";
import { useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

// Extend the Window interface to include custom property types
declare global {
    interface Window {
        $_gooee: {
            container?: any; // Use a more specific type if known
        };
    }
}

export const TopLeftToolBar = () => {
    const render = useMemo(() => {
        if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
            return null;
        }

        const GooeeContainer = window.$_gooee.container;

        return <>
            <GooeeContainer react={window.React} pluginType="top-left-toolbar" />
        </>;
    }, [window.$_gooee ? window.$_gooee.container : undefined]);

    return render;
}

export const TopRightToolBar = () => {
    const render = useMemo(() => {
        if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
            return null;
        }

        const GooeeContainer = window.$_gooee.container;

        return <>
            <GooeeContainer react={window.React} pluginType="top-right-toolbar" />
        </>;
    }, [window.$_gooee ? window.$_gooee.container : undefined]);

    return render;
}

export const BottomRightToolBar : ModuleRegistryExtend = (Component) => {
    return (props) => {
        const { children, ...otherProps } = props || {};
        const render = useMemo(() => {
            if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
                return <Component {...otherProps} />;
            }

            const GooeeContainer = window.$_gooee.container;

            return <>
                <Component {...otherProps} />
                <GooeeContainer react={window.React} pluginType="bottom-right-toolbar" />
            </>;
        }, [window.$_gooee ? window.$_gooee.container : undefined]);

        return render;
    };
}

export const BottomLeftToolBar: ModuleRegistryExtend = (Component) => {
    return (props) => {
        const { children, ...otherProps } = props || {};
        const render = useMemo(() => {
            if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
                return <Component {...otherProps} />;
            }

            const GooeeContainer = window.$_gooee.container;

            return <>
                <GooeeContainer react={window.React} pluginType="bottom-left-toolbar" />
                <Component {...otherProps} />
            </>;
        }, [window.$_gooee ? window.$_gooee.container : undefined]);

        return render;
    };
}

export const BottomRightContainer = () => {
    const render = useMemo(() => {
        if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
            return null;
        }

        const GooeeContainer = window.$_gooee.container;
        return  <GooeeContainer react={window.React} pluginType="info-row-container" />;
    }, [window.$_gooee ? window.$_gooee.container : undefined]);

    return render;
}

// Have to hacky stuff because I can see no way to actually hook into the inner
// main container with vanilla methods.
export const MainContainer = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (containerRef.current && window.$_gooee && typeof window.$_gooee.container !== 'undefined') {
           
            const immediateParent = containerRef.current.parentNode;
            const grandParent = immediateParent ? immediateParent.parentNode : null;

            if (grandParent == null)
                return;

            const GooeeContainerElement1 = document.createElement('div');
            GooeeContainerElement1.classList.add("gooee");

            const GooeeContainerElement2 = document.createElement('div');
            GooeeContainerElement2.classList.add("gooee");

            grandParent.appendChild(GooeeContainerElement1);
            grandParent.appendChild(GooeeContainerElement2);

            const GooeeContainer = window.$_gooee.container;
            ReactDOM.render(<GooeeContainer react={window.React} pluginType="main-container" />, GooeeContainerElement1);
            ReactDOM.render(<GooeeContainer react={window.React} pluginType="main-container-end" />, GooeeContainerElement2);

            return () => {
                if (grandParent.contains(GooeeContainerElement1)) {
                    grandParent.removeChild(GooeeContainerElement1);
                }
                if (grandParent.contains(GooeeContainerElement2)) {
                    grandParent.removeChild(GooeeContainerElement2);
                }
            };
        }
    }, []);

    return <div ref={containerRef} style={{ display: 'none' }}></div>;
};

export const DefaultContainer = () => {
    const render = useMemo(() => {
        if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
            return null;
        }

        const GooeeContainer = window.$_gooee.container;

        return <>
            <GooeeContainer react={window.React} pluginType="default" />
        </>;
    }, [window.$_gooee ? window.$_gooee.container : undefined]);

    return render;
}

export const PhotoModeContainer: ModuleRegistryExtend = (Component) => {
    return (props) => {
        const { children, ...otherProps } = props || {};
        const render = useMemo(() => {
            if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
                return <Component {...otherProps} />;
            }

            const GooeeContainer = window.$_gooee.container;

            return <>
                <Component {...otherProps} />
                <GooeeContainer react={window.React} pluginType="photomode-container" />
            </>;
        }, [window.$_gooee ? window.$_gooee.container : undefined]);

        return render;
    };
}

export const MainMenuContainer = () => {
    const render = useMemo(() => {
        if (!window.$_gooee || typeof window.$_gooee.container === 'undefined') {
            return <></>;
        }

        const GooeeContainer = window.$_gooee.container;

        return <GooeeContainer react={window.React} pluginType="main-menu" />;
    }, [window.$_gooee ? window.$_gooee.container : undefined]);

    return render;
}