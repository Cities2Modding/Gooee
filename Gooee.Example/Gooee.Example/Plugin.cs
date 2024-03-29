﻿using BepInEx;
using HarmonyLib;
using System.Reflection;
using System.Linq;
using Gooee.Plugins.Attributes;
using Gooee.Plugins;
using Gooee.Example.UI;

#if BEPINEX_V6
    using BepInEx.Unity.Mono;
#endif

namespace Gooee.Example
{
    [BepInPlugin( MyPluginInfo.PLUGIN_GUID, MyPluginInfo.PLUGIN_NAME, MyPluginInfo.PLUGIN_VERSION )]
    public class Plugin : BaseUnityPlugin
    {
        private void Awake( )
        {
            var harmony = Harmony.CreateAndPatchAll( Assembly.GetExecutingAssembly( ), MyPluginInfo.PLUGIN_GUID + "_Cities2Harmony" );

            var patchedMethods = harmony.GetPatchedMethods( ).ToArray( );

            // Plugin startup logic
            Logger.LogInfo( $"Plugin {MyPluginInfo.PLUGIN_GUID} is loaded! Patched methods: " + patchedMethods.Length );

            foreach ( var patchedMethod in patchedMethods )
            {
                Logger.LogInfo( $"Patched method: {patchedMethod.Module.Name}:{patchedMethod.Name}" );
            }
        }
    }

    [ControllerTypes( typeof( ExampleController ) )]
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
