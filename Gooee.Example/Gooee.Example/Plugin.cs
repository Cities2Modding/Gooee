using HarmonyLib;
using Gooee.Plugins.Attributes;
using Gooee.Plugins;
using Gooee.Example.UI;
using Colossal.Logging;
using Game.Modding;
using Game;

namespace Gooee.Example
{
    public class Mod : IMod
    {
        private static ILog _log = LogManager.GetLogger( "Cities2Modding" ).SetShowsErrorsInUI( false );
        private const string HARMONY_ID = "Cities2Modding_ExampleMod";
        private static Harmony _harmony;

        public void OnLoad( UpdateSystem updateSystem )
        {
            _harmony = new Harmony( HARMONY_ID );
            _harmony.PatchAll( );
            _log.Info( "Loaded Example Mod" );
        }

        public void OnDispose( )
        {
            // DO ANY CLEANUP HERE!

            _harmony?.UnpatchAll( HARMONY_ID );
            _log.Info( "Unloaded Example Mod" );
        }
    }

    [ControllerTypes( typeof( ExampleController ) )]
    [PluginToolbar( typeof( ExampleController ), "OnToggleVisible", "Example Mod", "Media/Game/Icons/Photomode.svg" )]
    public class ExamplePlugin : IGooeePluginWithControllers
    {
        public string Name => "Example";

        public string ScriptResource => "Gooee.Example.Resources.ui.js";

        public string StyleResource => null;

        public IController[] Controllers
        {
            get;
            set;
        }
    }
}
