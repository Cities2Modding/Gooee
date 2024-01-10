using Gooee.Injection;
using Game.UI;
using Gooee.Plugins;
using Colossal.IO.AssetDatabase.Internal;
using System.Reflection;
using System.Linq;
using Gooee.Plugins.Attributes;
using System.Collections.Generic;
using Game;
using Colossal.Reflection;

namespace Gooee.Systems
{
    /// <summary>
    /// Main UI system for Gooee, handles data binding, events etc.
    /// </summary>
    public class GooeeUISystem : UISystemBase
    {
        static MethodInfo updateAt = typeof( UpdateSystem ).GetMethod( "UpdateAt", BindingFlags.Public | BindingFlags.Instance );

        protected override void OnCreate( )
        {
            base.OnCreate( );

            ResourceInjector.Inject( );

            PluginLoader.Plugins.Values.ForEach( plugin =>
            {
                var pluginType = plugin.GetType( );
                var controllerTypeAttribute = pluginType.GetCustomAttributes( )
                    .FirstOrDefault( a => typeof( ControllerTypeAttribute<> ).IsAssignableFrom( a.GetType( ) ) );

                if ( controllerTypeAttribute != null && plugin is IGooeePluginWithController pluginWithController )
                {
                    var controllerType = controllerTypeAttribute.GetType( ).GetGenericArguments( )[0];
                    var pluginProperty = controllerType.GetProperty( "Plugin", BindingFlags.NonPublic | BindingFlags.Instance );
                    pluginWithController.Controller = ( IController ) World.GetOrCreateSystemManaged( controllerType );
                    pluginProperty.SetValue( pluginWithController.Controller, plugin );

                    updateAt.MakeGenericMethod( controllerType ).Invoke( World.GetExistingSystemManaged<UpdateSystem>( ), SystemUpdatePhase.UIUpdate );

                    UnityEngine.Debug.Log( $"Gooee instantiated controller {controllerType.FullName} for plugin {pluginType.FullName}" );
                }
                else
                {
                    var controllersTypeAttribute = pluginType.GetCustomAttribute<ControllerTypesAttribute>( );

                    if ( controllersTypeAttribute != null &&
                        typeof( IGooeePluginWithControllers ).IsAssignableFrom( plugin.GetType() ) )
                    {
                        if ( controllersTypeAttribute.Types?.Length > 0 )
                        {
                            IGooeePluginWithControllers pluginWithControllers = ( IGooeePluginWithControllers ) plugin;

                            var controllers = new List<IController>( );

                            controllersTypeAttribute.Types.ForEach( t =>
                            {
                                var pluginProperty = t.GetProperty( "Plugin", BindingFlags.NonPublic | BindingFlags.Instance );
                                var controller = ( IController ) World.GetOrCreateSystemManaged( t );
                                pluginProperty.SetValue( controller, plugin );
                                controllers.Add( controller );
                                controller.OnLoaded( );

                                UnityEngine.Debug.Log( $"Gooee instantiated controller {controller.GetType( ).FullName} for plugin {pluginType.FullName}" );

                                updateAt.MakeGenericMethod( controller.GetType( ) ).Invoke( World.GetExistingSystemManaged<UpdateSystem>( ), SystemUpdatePhase.UIUpdate );
                            } );

                            pluginWithControllers.Controllers = controllers.ToArray( );
                        }
                        else
                            UnityEngine.Debug.LogError( $"Gooee failed to find any controller types for {pluginType.FullName}" );
                    }
                    else
                        UnityEngine.Debug.LogError( $"Gooee failed to instantiate a controller for plugin {pluginType.FullName}" );

                }
            } );
        }
    }
}