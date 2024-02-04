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
using Colossal.UI.Binding;
using Gooee.Helpers;
using System;

namespace Gooee.Systems
{
    /// <summary>
    /// Main UI system for Gooee, handles data binding, events etc.
    /// </summary>
    public class GooeeUISystem : UISystemBase
    {
        //private readonly LibrarySettings _librarySettings = GooeeSettings.Load<LibrarySettings>( );

        static MethodInfo updateAt = typeof( UpdateSystem ).GetMethod( "UpdateAt", BindingFlags.Public | BindingFlags.Instance );
        
        private readonly GooeeLogger _log = GooeeLogger.Get( "Gooee" );

        protected override void OnCreate( )
        {
            base.OnCreate( );;

            //LocalisationHelper.Load( "Gooee.Resources.lang", typeof( GooeeUISystem ).Assembly, "LibrarySettings" );

            //_librarySettings.Register( );

            ResourceInjector.Inject( );

            PluginLoader.Plugins.Values.OrderBy( v => v.Name ).ForEach( ProcessPlugin );

            //AddBinding( new TriggerBinding( "gooee", "onCloseChangeLog", ResourceInjector.WriteChangeLogRead ) );
            //AddBinding( new TriggerBinding( "gooee", "resetChangeLog", ResourceInjector.ResetChangeLog ) );            

            //AddUpdateBinding( new GetterValueBinding<bool>( "gooee", "showChangeLog", ( ) =>
            //{
            //    return ResourceInjector.HasChangeLogUpdated( );
            //} ) );
        }

        private void ProcessPlugin( IGooeePlugin plugin )
        {
            PluginLoader.GetControllerTypes( plugin, out var controllerTypes, out var modelTypes );

            var pluginType = plugin.GetType( );

            var customAttributes = pluginType.GetCustomAttributes( );

            var controllerTypeAttribute = customAttributes
                .FirstOrDefault( a => typeof( ControllerTypeAttribute<> ).IsAssignableFrom( a.GetType( ) ) );
            
            if ( controllerTypes?.Count > 0 )
            {
                IGooeePluginWithControllers pluginWithControllers = ( IGooeePluginWithControllers ) plugin;

                var controllers = new List<IController>( );

                controllerTypes.ForEach( t =>
                {
                    var pluginProperty = t.GetProperty( "Plugin", BindingFlags.Public | BindingFlags.Instance );
                    var controller = ( IController ) World.GetOrCreateSystemManaged( t );
                    pluginProperty.SetValue( controller, plugin );
                    controllers.Add( controller );
                    controller.OnLoaded( );

                    _log.Debug( $"Gooee instantiated controller {controller.GetType( ).FullName} for plugin {pluginType.FullName}" );

                    updateAt.MakeGenericMethod( controller.GetType( ) ).Invoke( World.GetExistingSystemManaged<UpdateSystem>( ), SystemUpdatePhase.UIUpdate );
                } );

                pluginWithControllers.Controllers = controllers.ToArray( );
            }
            else
                _log.Error( $"Gooee failed to find any controller types for {pluginType.FullName}" );

            ProcessPluginLanguagesAndSettings( plugin, pluginType, customAttributes );
        }

        private void ProcessPluginLanguagesAndSettings( IGooeePlugin plugin, Type pluginType, IEnumerable<Attribute> customAttributes )
        {

            if ( plugin is IGooeeLanguages langPlugin && plugin is IGooeeSettings settingsPlugin )
            {
                var settingsAttribute = ( GooeeSettingsMenuAttribute ) customAttributes.FirstOrDefault( a => a.GetType( ) == typeof( GooeeSettingsMenuAttribute ) );

                if ( settingsAttribute != null )
                {
                    settingsPlugin.Settings = GooeeSettings.Load( settingsAttribute.Type );
                    settingsPlugin.Settings.Register( );

                    LocalisationHelper.Load( langPlugin.LanguageResourceFolder, pluginType.Assembly, settingsAttribute.Type.Name );
                    _log.Debug( $"Gooee loaded settings for plugin {pluginType.FullName}" );
                }
            }
            else if ( plugin is IGooeeLanguages langPlugin2 )
            {
                LocalisationHelper.Load( langPlugin2.LanguageResourceFolder, pluginType.Assembly );
            }
        }
    }
}