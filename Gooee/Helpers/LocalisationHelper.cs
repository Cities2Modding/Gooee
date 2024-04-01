using Colossal.Localization;
using Game.SceneFlow;
using Game.UI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

namespace Gooee.Helpers
{
    public static class LocalisationHelper
    {
        static readonly Lazy<LocalizationManager> _localizationManager = new Lazy<LocalizationManager>( () => GameManager.instance.localizationManager );
        static readonly Lazy<string[]> _locales = new Lazy<string[]>( ( ) => _localizationManager.Value.GetSupportedLocales( ) );

        private static readonly GooeeLogger _log = GooeeLogger.Get( "Cities2Modding" );

        /// <summary>
        /// Load an embedded resource .yml language and register it with the game.
        /// </summary>
        /// <param name="resourcePath"></param>
        /// <param name="targetAssembly"></param>
        public static void Load( string resourcePath, Assembly targetAssembly = null, string settingsName = null )
        {
            var hasLoadedAny = false;
            var localisationManager = _localizationManager.Value;
            var results = new List<string>( );

            foreach ( var locale in _locales.Value )
            {
                var resourceName = $"{resourcePath}.{locale}.yml";

                if ( !EmbeddedResource.Exists( resourceName, targetAssembly ) )
                    continue;

                var yml = EmbeddedResource.LoadText( resourceName, targetAssembly );
                var ymlInstance = YmlHelper.Parse( Path.GetFileNameWithoutExtension( targetAssembly.Location ), settingsName,  yml );

                if ( ymlInstance != null && ymlInstance.TryGetValue( "lang", out var language ) )
                {
                    localisationManager.AddSource( locale, new MemorySource( language ) );
                    results.Add( locale );
                    hasLoadedAny = true;
                }
            }

            if ( !hasLoadedAny )
            {
                _log.Warning( $"Could not find localisation for '{resourcePath}'." );
            }
            else
                _log.Info( $"Loaded localisation for '{targetAssembly.GetName().Name}' [{string.Join( ", ", results )}]." );
        }
    }
}