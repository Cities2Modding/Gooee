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
using Gooee.Helpers;
using System;
using Colossal.UI.Binding;
using Newtonsoft.Json;
using Colossal.UI;
using static Game.Rendering.Debug.RenderPrefabRenderer;
using Game.SceneFlow;
using Colossal.Serialization.Entities;

namespace Gooee.Systems
{
    /// <summary>
    /// Main UI system for Gooee, handles data binding, events etc.
    /// </summary>
    public class GooeeUISystem : UISystemBase
    {
        //private readonly LibrarySettings _librarySettings = GooeeSettings.Load<LibrarySettings>( );

        private readonly Dictionary<string, (IController Controller, MethodInfo Method)> _toolbarChildSubscribers = [];
        private readonly Dictionary<string, List<PluginToolbarChildItem>> _toolbarChildCache = [];
        private string _toolbarChildJsonCache;

        static MethodInfo updateAt = typeof( UpdateSystem ).GetMethod( "UpdateAt", BindingFlags.Public | BindingFlags.Instance );
        
        private readonly GooeeLogger _log = GooeeLogger.Get( "Gooee" );
        private GetterValueBinding<string> _toolbarItemsBinding;

        private bool HasMoveIt
        {
            get;
            set;
        }

        protected override void OnCreate( )
        {
            base.OnCreate( );;

            //LocalisationHelper.Load( "Gooee.Resources.lang", typeof( GooeeUISystem ).Assembly, "LibrarySettings" );

            //_librarySettings.Register( );

            if ( ResourceInjector.InvalidVersion )
            {
                _log.Error( "Critical error, mods using Gooee cannot be loaded because the game version has changed. Please ensure you are using the latest version of Gooee and if no new version is out yet please be aware it takes a bit of time to adjust to patch updates. Thank you." );

            }
            else
            {
                ResourceInjector.Inject( );
                PluginLoader.Plugins.Values.OrderBy( v => v.Name ).ForEach( ProcessPlugin );

                GameManager.instance.userInterface.view.View.Reload( );
            }

            if ( _toolbarChildSubscribers?.Count > 0 )
            {
                BuildToolbarChildCache( );

                AddUpdateBinding( _toolbarItemsBinding = new GetterValueBinding<string>( "gooee", "toolbarChildren", ( ) =>
                {
                    return _toolbarChildJsonCache;
                } ) );
            }

            AddUpdateBinding( new GetterValueBinding<bool>( "Gooee", "hasMoveIt", ( ) => HasMoveIt ) );

            //AddBinding( new TriggerBinding( "gooee", "onCloseChangeLog", ResourceInjector.WriteChangeLogRead ) );
            //AddBinding( new TriggerBinding( "gooee", "resetChangeLog", ResourceInjector.ResetChangeLog ) );            

            //AddUpdateBinding( new GetterValueBinding<bool>( "gooee", "showChangeLog", ( ) =>
            //{
            //    return ResourceInjector.HasChangeLogUpdated( );
            //} ) );
        }

        protected override void OnGameLoadingComplete( Purpose purpose, GameMode mode )
        {
            base.OnGameLoadingComplete( purpose, mode );

            if ( mode == GameMode.MainMenu )
            {
                HasMoveIt = AppDomain.CurrentDomain.GetAssemblies( )
                    .SelectMany( a => a.GetTypes( ) ).Count( t => t.FullName == "MoveIt.Systems.MIT_System" ) > 0;
            }
        }

        public void BuildToolbarChildCache( bool forceUpdate = false )
        {
            foreach ( var kvp in _toolbarChildSubscribers )
            {
                var sub = kvp.Value;

                if ( sub.Method == null || sub.Controller == null )
                    continue;

                var items = ( List<PluginToolbarChildItem> ) sub.Method.Invoke( sub.Controller, null );

                if ( items == null )
                    continue;

                if ( _toolbarChildCache.ContainsKey( kvp.Key ) )
                    _toolbarChildCache[kvp.Key ] = items;
                else
                    _toolbarChildCache.Add( kvp.Key, items );
            }

            _toolbarChildJsonCache = JsonConvert.SerializeObject( _toolbarChildCache );

            if ( forceUpdate )
                _toolbarItemsBinding?.TriggerUpdate( );
        }

        private void ProcessPlugin( IGooeePlugin plugin )
        {
            PluginLoader.GetControllerTypes( plugin, out var controllerTypes, out var modelTypes );

            var pluginType = plugin.GetType( );

            var customAttributes = pluginType.GetCustomAttributes( );

            var controllerTypeAttribute = customAttributes
                .FirstOrDefault( a => typeof( ControllerTypeAttribute<> ).IsAssignableFrom( a.GetType( ) ) );

            ProcessPluginLanguagesAndSettings( plugin, pluginType, customAttributes );

            if ( controllerTypes?.Count > 0 )
            {
                var toolbarAttribute = plugin.GetType( ).GetCustomAttribute<PluginToolbarAttribute>( );

                IGooeePluginWithControllers pluginWithControllers = ( IGooeePluginWithControllers ) plugin;

                var controllers = new List<IController>( );

                controllerTypes.ForEach( t =>
                {
                    var dependencies = t.GetCustomAttributes<ControllerDependsAttribute>( );
                    var pluginProperty = t.GetProperty( "Plugin", BindingFlags.Public | BindingFlags.Instance );
                    var controller = ( IController ) World.GetOrCreateSystemManaged( t );
                    pluginProperty.SetValue( controller, plugin );
                    controllers.Add( controller );

                    updateAt.MakeGenericMethod( controller.GetType( ) ).Invoke( World.GetExistingSystemManaged<UpdateSystem>( ), SystemUpdatePhase.UIUpdate );

                    if ( dependencies?.Any( ) == true )
                    {
                        dependencies.ForEach( dependency =>
                        {
                            // Not really needed as update at will instantiate it BUT
                            // this guarantees instant Instantiation before controller.
                            World.GetOrCreateSystemManaged( dependency.Type );

                            if ( dependency.UpdatePhase != SystemUpdatePhase.Invalid )
                                updateAt.MakeGenericMethod( dependency.Type ).Invoke( World.GetExistingSystemManaged<UpdateSystem>( ), dependency.UpdatePhase );
                        } );
                    }

                    if ( toolbarAttribute?.ControllerType == t )
                    {
                        var toolbarItem = toolbarAttribute.Item;

                        if ( toolbarItem.OnGetChildren != null )
                        {
                            _toolbarChildSubscribers.TryAdd( plugin.Name.ToLowerInvariant(), (controller, toolbarItem.OnGetChildren) );
                        }
                    }

                    controller.OnLoaded( );

                    _log.Debug( $"Gooee instantiated controller {controller.GetType( ).FullName} for plugin {pluginType.FullName}" );

                    } );

                pluginWithControllers.Controllers = controllers.ToArray( );
            }
            else
                _log.Error( $"Gooee failed to find any controller types for {pluginType.FullName}" );

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