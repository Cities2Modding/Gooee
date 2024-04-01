using Game;
using Gooee.Helpers;
using Gooee.Injection;
using Gooee.Plugins.Attributes;
using Gooee.Systems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Unity.Entities;

namespace Gooee.Plugins
{
    internal class PluginLoader
    {
        public static Dictionary<string, IGooeePlugin> Plugins
        {
            get;
            private set;
        } = new Dictionary<string, IGooeePlugin>( );

        private static readonly GooeeLogger _log = GooeeLogger.Get( "Cities2Modding" );

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
                        _log.Error( $"Gooee plugin failed to load '{plugin.Name}.'" );
                        // Log error
                        continue;
                    }

                    if ( plugin is IGooeeLogger gooeeLogger )
                        gooeeLogger.Log = new GooeeLogger( plugin.Name );

                    _log.Info( $"Gooee plugin loaded '{plugin.Name}.'" );
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

                if ( plugin is IGooeeStyleSheet stPlugin && !string.IsNullOrEmpty( stPlugin.StyleResource ) )
                    ResourceInjector.SavePluginResource( assembly, plugin.Name, stPlugin.StyleResource );

                if ( !string.IsNullOrEmpty( plugin.ScriptResource ) )
                    ResourceInjector.SavePluginResource( assembly, plugin.Name, plugin.ScriptResource );

                if ( plugin is IGooeeChangeLog clPlugin && !string.IsNullOrEmpty( clPlugin.ChangeLogResource ) )
                    ResourceInjector.SavePluginResource( assembly, plugin.Name, clPlugin.ChangeLogResource );
            }
        }

        public static void GetControllerTypes( IGooeePlugin plugin, out List<Type> controllerTypes, out List<Type> modelTypes )
        {
            controllerTypes = new List<Type>( );
            modelTypes = new List<Type>( );

            var pluginType = plugin.GetType( );
            var customAttributes = pluginType.GetCustomAttributes( );

            var controllerTypeAttribute = customAttributes
                .FirstOrDefault( a => typeof( ControllerTypeAttribute<> ).IsAssignableFrom( a.GetType( ) ) );

            if ( controllerTypeAttribute != null && plugin is IGooeePluginWithController pluginWithController )
            {
                var controllerType = pluginWithController.GetType( );
                controllerTypes.Add( controllerType );
                modelTypes.Add( controllerType.BaseType.GetGenericArguments( )[0] );
            }
            else
            {
                var controllersTypeAttribute = pluginType.GetCustomAttribute<ControllerTypesAttribute>( );

                if ( controllersTypeAttribute != null &&
                    typeof( IGooeePluginWithControllers ).IsAssignableFrom( plugin.GetType( ) ) )
                {
                    if ( controllersTypeAttribute.Types?.Length > 0 )
                    {
                        IGooeePluginWithControllers pluginWithControllers = ( IGooeePluginWithControllers ) plugin;

                        foreach ( var t in controllersTypeAttribute.Types )
                        {
                            controllerTypes.Add( t );
                            modelTypes.Add( t.BaseType.GetGenericArguments( )[0] );
                        }
                    }
                    else
                        _log.Error( $"Gooee failed to find any controller types for {pluginType.FullName}" );
                }
                else
                    _log.Error( $"Gooee failed to instantiate a controller for plugin {pluginType.FullName}" );
            }
        }
    }
}
