using HarmonyLib;
using System.Reflection;
using System.Linq;
using System;
using Gooee.Patches;
using Game.Modding;
using Game;
using UnityEngine;
using Colossal.Logging;
using Gooee.Systems;
using Game.SceneFlow;
using System.IO;
using Game.UI;

namespace Gooee
{
    public class Mod : IMod
    {
        public static string AssemblyPath
        {
            get;
            private set;
        }

        private Harmony _harmony;
        private static ILog _log = LogManager.GetLogger( "Cities2Modding" ).SetShowsErrorsInUI( false );

        public void OnLoad( UpdateSystem updateSystem )
        {
            if ( GameManager.instance.modManager.TryGetExecutableAsset( this, out var asset ) )
            {
                AssemblyPath = Path.GetDirectoryName( asset.path.Replace( '/', Path.DirectorySeparatorChar ) );
            }

            _harmony = new Harmony( "cities2modding_gooee" );

            _harmony.PatchAll( );

            UIPatches.InstallGameResourceHook( _harmony );

            _log.Info( Environment.NewLine + @" @@@@@@@@   @@@@@@    @@@@@@   @@@@@@@@  @@@@@@@@  
@@@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  
!@@        @@!  @@@  @@!  @@@  @@!       @@!       
!@!        !@!  @!@  !@!  @!@  !@!       !@!       
!@! @!@!@  @!@  !@!  @!@  !@!  @!!!:!    @!!!:!    
!!! !!@!!  !@!  !!!  !@!  !!!  !!!!!:    !!!!!:    
:!!   !!:  !!:  !!!  !!:  !!!  !!:       !!:       
:!:   !::  :!:  !:!  :!:  !:!  :!:       :!:       
 ::: ::::  ::::: ::  ::::: ::   :: ::::   :: ::::  
 :: :: :    : :  :    : :  :   : :: ::   : :: ::   
                                                   " );

            updateSystem.UpdateAt<GooeeUISystem>( SystemUpdatePhase.UIUpdate );
        }

        public void OnDispose( )
        {
            _harmony?.UnpatchAll( "cities2modding_gooee" );
        }
    }
}
