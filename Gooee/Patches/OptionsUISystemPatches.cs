using Gooee.Injection;
using cohtml.Net;
using Colossal.Localization;
using Game.SceneFlow;
using Game.UI.Menu;
using HarmonyLib;
using System;

namespace Gooee.Patches
{
    /// <summary>
    /// Set's up the resource handler when the UI system is setup.
    /// </summary>
    [HarmonyPatch( typeof( OptionsUISystem ), "OnCreate" )]
    public static class OptionsUISystem_OnCreatePatch
    {
        public static void Postfix( )
        {
            ResourceInjector.SetupResourceHandler( );
        }
    }
}
