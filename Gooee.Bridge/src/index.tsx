import { ModRegistrar } from "cs2/modding";
import {
    TopLeftToolBar, TopRightToolBar, BottomLeftToolBar,
    BottomRightToolBar, MainContainer, DefaultContainer,
    PhotoModeContainer, BottomRightContainer, MainMenuContainer
} from "components/_gooee-container";

const register: ModRegistrar = (moduleRegistry) => {
    moduleRegistry.extend("game-ui/game/components/toolbar/top/toolbar-button-strip/toolbar-button-strip.tsx", "ToolbarButtonStrip", BottomLeftToolBar);
    moduleRegistry.extend("game-ui/game/components/toolbar/top/toggles.tsx", "PhotoModeToggle", BottomRightToolBar);
    moduleRegistry.extend("game-ui/game/components/photo-mode/photo-mode-panel.tsx", "PhotoModePanel", PhotoModeContainer);
    
    moduleRegistry.append("GameTopLeft", MainContainer);
    moduleRegistry.append("GameTopLeft", TopLeftToolBar);
    moduleRegistry.append("GameTopRight", TopRightToolBar);
    moduleRegistry.append("Game", DefaultContainer);
    moduleRegistry.append("GameBottomRight", BottomRightContainer);
    moduleRegistry.append("Menu", MainMenuContainer);

}

export default register;