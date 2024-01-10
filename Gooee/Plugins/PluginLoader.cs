using Gooee.Injection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Gooee.Plugins
{
    internal class PluginLoader
    {
        public static Dictionary<string, IGooeePlugin> Plugins
        {
            get;
            private set;
        } = new Dictionary<string, IGooeePlugin>( );

        public static void Load( )
        {
            FindPlugins( );
            ExportPlugins( );
        }

        private static void FindPlugins( )
        {
            foreach ( var assembly in AppDomain.CurrentDomain.GetAssemblies( ) )
            {
                var pluginTypes = assembly.GetTypes( )
                    .Where( t => t.IsClass && typeof( IGooeePlugin ).IsAssignableFrom( t ) )
                    .ToList( );

                if ( pluginTypes == null || pluginTypes.Count == 0 )
                    continue;

                foreach ( var pluginType in pluginTypes )
                {
                    var plugin = ( IGooeePlugin ) Activator.CreateInstance( pluginType );

                    if ( plugin == null || string.IsNullOrEmpty( plugin.Name ) || Plugins.ContainsKey( plugin.Name ) )
                    {
                        UnityEngine.Debug.LogError( $"Gooee plugin failed to load '{plugin.Name}.'" );
                        // Log error
                        continue;
                    }

                    UnityEngine.Debug.Log( $"Gooee plugin loaded '{plugin.Name}.'" );
                    Plugins.Add( plugin.Name, plugin );
                }
            }
        }

        private static void ExportPlugins( )
        {
            foreach ( var kvp in Plugins )
            {
                var plugin = kvp.Value;
                var assembly = plugin.GetType( ).Assembly;

                if ( !string.IsNullOrEmpty( plugin.StyleResource ) )
                    ResourceInjector.SavePluginResource( assembly, plugin.Name, plugin.StyleResource );

                if ( !string.IsNullOrEmpty( plugin.ScriptResource ) )
                    ResourceInjector.SavePluginResource( assembly, plugin.Name, plugin.ScriptResource );
            }
        }
    }
}
