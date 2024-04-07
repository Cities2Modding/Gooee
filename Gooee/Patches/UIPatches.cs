using HarmonyLib;
using Gooee.Injection;
using System.IO;
using cohtml.Net;
using Colossal.UI;
using Game.SceneFlow;
using Game.UI;
using System.Collections.Generic;
using System.Reflection;
using System;
using System.Linq;
using Game.Modding;
using Unity.Entities;
using Gooee.Systems;

namespace Gooee.Patches
{
    public static class UIPatches
    {
        const string UI_URL = "coui://gooeeui/";
        public const string INDEX_PATH = UI_URL + "index.html";

        private static void EnsureFolder( )
        {
            ResourceInjector.SetupResourceHandler( );
        }

        //[HarmonyPatch( typeof( GameManager ), "InitializeUI" )]
        //public static class GameManager_InitializeUIPatch
        //{
        //    public static void Postfix( GameManager __instance )
        //    {
        //        if ( ResourceInjector.IsHookUILoaded( ) )
        //        {
        //            return;
        //        }

        //        UnityEngine.Debug.Log( "Using non-HookUI injection!" );
        //        EnsureFolder( );
        //        ResourceInjector.Inject( );
        //        __instance.userInterface.view.url = INDEX_PATH;
        //        UIManager.defaultUISystem.defaultUIView.url = INDEX_PATH;
        //    }
        //}

        //[HarmonyPatch( typeof( UISystemBootstrapper ), "Awake" )]
        //public static class UISystemBootstrapper_AwakePatch
        //{
        //    public static void Postfix( UISystemBootstrapper __instance )
        //    {
        //        if ( ResourceInjector.IsHookUILoaded( ) )
        //        {
        //           return;
        //        }

        //        EnsureFolder( );
        //        ResourceInjector.Inject( );
        //        UIManager.defaultUISystem.defaultUIView.url = INDEX_PATH;
        //        __instance.m_Url = INDEX_PATH;
        //    }
        //}

        [HarmonyPatch( typeof( ModManager ), "InitializeUIModules" )]
        public static class ModManager_InitializeUIModulesPatch
        {
            public static void Postfix( UISystemBootstrapper __instance )
            {
                var gooee = World.DefaultGameObjectInjectionWorld.GetExistingSystemManaged<GooeeUISystem>( );

                if ( gooee == null )
                    return;

                gooee.LoadGooee( );
            }
        }

        public static void InstallGameResourceHook( Harmony harmony )
        {
            var requestDataType = typeof( GameUIResourceHandler ).GetNestedTypes( BindingFlags.NonPublic | BindingFlags.Instance )
                                        .FirstOrDefault( t => t.Name == "GameResourceRequestData" )
                                        ?? throw new Exception( "Gooee: Failed to find GameResourceRequestData to hook!" );

            var constructorInfo = requestDataType.GetConstructor( BindingFlags.Public | BindingFlags.Instance, null,
                                        new Type[] { typeof( uint ), typeof( string ), typeof( IResourceResponse ) }, null )
                                        ?? throw new Exception( "Gooee: Failed to find the constructor to hook!" );

            harmony.Patch( constructorInfo, new HarmonyMethod( typeof( UIPatches ), nameof( GameResourceRequestDataPrefix ) ) );
        }

        /// <summary>
        /// Bugfix to repoint resources back to the correct location due to the injection
        /// </summary>
        /// <param name="id"></param>
        /// <param name="uri"></param>
        /// <param name="response"></param>
        static void GameResourceRequestDataPrefix( ref uint id, ref string uri, ref IResourceResponse response )
        {
            var lowerUrl = uri.ToLowerInvariant( );

            if ( lowerUrl.StartsWith( "coui://gooeeui/media/" ) )
                uri = "coui://GameUI/Media/" + uri.Substring( "coui://gooeeui/media/".Length );
            else if( lowerUrl.StartsWith( "coui://gooeeui/media%5c" ) )
                uri = "coui://GameUI/Media/" + uri.Substring( "coui://gooeeui/media%5c".Length );
            else if ( lowerUrl.StartsWith( "coui://gooeeui/static/" ) )
                uri = "coui://GameUI/Static/" + uri.Substring( "coui://gooeeui/static/".Length );
            else if ( lowerUrl.StartsWith( "coui://gooeeui/index.css" ) )
                uri = "coui://GameUI/index.css";

            //if ( lowerUrl.StartsWith( "coui://gooeeui/index.js" ) ||
            //    lowerUrl.StartsWith( "coui://gooeeui/index.html" ) ||
            //    lowerUrl.StartsWith( "coui://gooeeui/gooee.js" ) ||
            //    lowerUrl.StartsWith( "coui://gooeeui/gooee.css" ) ||
            //    lowerUrl.StartsWith( "coui://gooeeui/fa/" ) ||
            //    lowerUrl.StartsWith( "coui://gooeeui/plugins/" ) )
            //    return;

            //if ( lowerUrl.Contains( "coui://gooeeui/" ) )
            //    uri = "coui://GameUI/" + uri.Substring( "coui://gooeeui/".Length + 1 );
        }
    }
}
