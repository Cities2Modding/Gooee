using Colossal.Reflection;
using Colossal.UI.Binding;
using Game.UI;
using Gooee.Helpers;
using Gooee.Injection;
using Gooee.Plugins.Attributes;
using Gooee.Systems;
using Newtonsoft.Json;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using BaseModel = Gooee.Plugins.Model;

namespace Gooee.Plugins
{
    public abstract partial class Controller<TModel> : UISystemBase, IController
        where TModel : class, IModel, IJsonWritable
    {
        public IGooeePlugin Plugin
        {
            get;
            protected set;
        }

        protected TModel Model
        {
            get;
            private set;
        }

        protected GooeeSettings Settings
        {
            get
            {
                if ( Plugin is not IGooeeSettings gooeeSettingsPlugin )
                    return null;

                return gooeeSettingsPlugin.Settings;
            }
        }

        protected GetterValueBinding<string> Binding
        {
            get;
            set;
        }

        private FieldInfo DirtyField
        {
            get;
            set;
        }

        private MethodInfo[] TriggerMethods
        {
            get;
            set;
        }

        protected string PluginID
        {
            get;
            private set;
        }

        protected string ControllerID
        {
            get;
            private set;
        }

        protected GooeeLogger Log
        {
            get;
            private set;
        }

        //private BoundEventHandle ModelListener
        //{

        //    get;
        //    set;
        //}

        //static readonly MethodInfo _registerListener = typeof( Model ).GetMethod( "RegisterListener", BindingFlags.Instance | BindingFlags.NonPublic );
        private readonly GooeeLogger _log = GooeeLogger.Get( "Cities2Modding" );

        private string _lastModelJson = string.Empty;
        private string _modelJson = string.Empty;

        private static long _settingsUpdates = 0;
        private static ConcurrentDictionary<string, string> _closeRequests = [];
        private GooeeUISystem _gooeeUISystem;

        /// <summary>
        /// Occurs when Gooee has fully loaded in a controller and its dependencies.
        /// </summary>
        public virtual void OnLoaded( )
        {
            _gooeeUISystem = World.GetExistingSystemManaged<GooeeUISystem>( );

            if ( Plugin is IGooeeLogger gooeeLogger )
                Log = gooeeLogger.Log;

            PluginID = Plugin.Name.ToLowerInvariant( ).Replace( " ", "_" ).Trim( );
            ControllerID = PluginID + "." + GetType( ).Name.Replace( "Controller", "" ).ToLowerInvariant( ).Trim( );

            if ( Settings != null )
            {
                Settings.onSettingsApplied += ( setting ) =>
                {
                    Interlocked.Increment( ref _settingsUpdates );
                };
            }

            Model = Configure( );

            //ApplyPatches( Model );

            //ModelListener = ( BoundEventHandle ) _registerListener.Invoke( Model, new object[] { this } );

            //_log.Info( $"Register binding for mod req: {ControllerID}.model" );

            Binding = new GetterValueBinding<string>( ControllerID, "model", ( ) =>
            {
                if ( !string.IsNullOrEmpty( _modelJson ) )
                    return _modelJson;

                _modelJson = JsonConvert.SerializeObject( Model, ResourceInjector._jsonSettings );                
                return _modelJson;
            } );

            DirtyField = Binding.GetType( ).GetField( "m_ValueDirty", BindingFlags.Instance | BindingFlags.NonPublic );

            AddUpdateBinding( Binding );

            TriggerMethods = GetType( ).GetMethodsWithAttribute<OnTriggerAttribute>( )
                .ToArray( );

            if ( TriggerMethods?.Length > 0 )
            {
                foreach ( var m in TriggerMethods )
                {
                    var parameters = m.GetParameters( );

                    if ( parameters?.Length > 0 && parameters.Length < 3 && parameters.Count( p => p.ParameterType != typeof( string ) ) == 0 )
                    {
                        if ( parameters.Length == 1 )
                            AddBinding( new TriggerBinding<string>( ControllerID, m.Name, ( a ) => { m.Invoke( this, a ); } ) );
                        else
                            AddBinding( new TriggerBinding<string, string>( ControllerID, m.Name, ( a, b ) => { m.Invoke( this, a, b ); } ) );
                    }
                    else
                        AddBinding( new TriggerBinding( ControllerID, m.Name, ( ) => { m.Invoke( this ); } ) );
                }
            }

            AddBinding( new TriggerBinding<string>( ControllerID, "updateProperty", OnUpdateProperty ) );

            _log.Info( $"Controller '{ControllerID}' registered." );
        }

        /// <summary>
        /// Try request a Gooee plugin controller to close. (Used to prevent conflicts between plugins)
        /// </summary>
        /// <remarks>
        /// (It is down to individual mods to handle visibility updating etc. They can choose
        /// to not close as to prevent plugins closing that should not be.)
        /// </remarks>
        /// <param name="pluginName">The lowercase plugin name</param>
        /// <param name="controllerName">The lowercase controller name (Without 'controller' at the end)</param>
        protected void TryRequestClose( string pluginName, string controllerName )
        {
            var key = pluginName.ToLowerInvariant() + "." + controllerName.ToLowerInvariant().Replace( "controller", "" ).Trim( );

            if ( _closeRequests.ContainsKey( pluginName ) )
                return;

            _closeRequests.TryAdd( key, ControllerID );
        }

        protected override void OnUpdate( )
        {
            base.OnUpdate( );

            var settingsUpdates = Interlocked.Read( ref _settingsUpdates );

            if ( settingsUpdates > 0 )
            {
                Interlocked.Exchange( ref _settingsUpdates, 0 );
                OnSettingsUpdated( );
            }

            // Process a close request if there is one
            if ( _closeRequests.ContainsKey( ControllerID ) )
            {
                OnCloseRequested( _closeRequests[ControllerID] );
                _closeRequests.TryRemove( ControllerID, out _ );
            }
        }

        /// <summary>
        /// Other Gooee plugins may request that your plugin closes,
        /// it is up to you to choose whether to update your own model to comply.
        /// </summary>
        /// <param name="requesterControllerID">The controller ID of the close requester</param>
        protected virtual void OnCloseRequested( string requesterControllerID )
        {        
        }

        //private void ApplyPatches( IModel model )
        //{
        //    var harmony = new Harmony( "Harmony.Gooee." + GetType( ).FullName );

        //    foreach ( var prop in model.GetType( ).GetProperties( BindingFlags.Public | BindingFlags.Instance ) )
        //    {
        //        if ( prop.IsDefined( typeof( ObservableAttribute ), true ) )
        //        {
        //            var originalSetter = prop.GetSetMethod( );

        //            if ( originalSetter != null )
        //            {
        //                var postfix = GetType().GetMethod( nameof( OnServerUpdateModelPostfix ), BindingFlags.Static | BindingFlags.NonPublic );
        //                harmony.Patch( originalSetter, postfix: new HarmonyMethod( postfix ) );
        //            }
        //        }
        //    }
        //}

        //private static void OnServerUpdateModelPostfix( IModel __instance )
        //{
        //    var method = __instance.GetType( ).GetMethod( "OnServerUpdateModel", BindingFlags.Instance | BindingFlags.NonPublic );
        //    method.Invoke( __instance, null );
        //}

        /// <summary>
        /// Configure the model and inject any dependencies via the world system.
        /// </summary>
        /// <returns></returns>
        public abstract TModel Configure( );

        /// <summary>
        /// Mount a UI resource path so images etc can be loaded
        /// from local file system to GameFace.
        /// </summary>
        /// <param name="route">The URL lowercase route prefix (e.g. example would be coui://example/{path})</param>
        /// <param name="path">The local file system path to mount</param>
        protected void MountResources( string route, string path )
        {
            ResourceInjector.MountResources( route, path );
        }

        protected void TriggerUpdate( )
        {
            _modelJson = JsonConvert.SerializeObject( Model, ResourceInjector._jsonSettings );

            //if ( _lastModelJson != _modelJson )
            //{
                OnModelUpdated( );
                DirtyField.SetValue( Binding, true );
             //   _lastModelJson = _modelJson;
            //}
        }

        private void OnUpdateProperty( string json )
        {
            if ( string.IsNullOrEmpty( json ) )
                return;

            var modelType = Model.GetType( );

            BaseModel.EnsureType( modelType );

            if ( !BaseModel._propertiesCache.ContainsKey( modelType ) )
                return;

            // Assuming that propertiesCache is a Dictionary and already populated
            var properties = BaseModel._propertiesCache[modelType];

            if ( properties == null )
                return;

            var dic = JsonConvert.DeserializeObject<Dictionary<string, object>>( json );
            if ( dic == null || !dic.TryGetValue( "property", out var propertyName ) )
                return;

            var property = properties.FirstOrDefault( p => p.Name == ( string ) propertyName );
            if ( property == null )
                return;

            if ( !dic.TryGetValue( "value", out var val ) )
                return;

            // Optimize type checks and conversions
            if ( val.GetType( ) != property.PropertyType )
            {
                if ( TryConvertValue( property.PropertyType, val, out var convertedValue ) )
                {
                    property.SetValue( Model, convertedValue );
                }
            }
            else
            {
                property.SetValue( Model, val );
            }

            TriggerUpdate( );
        }

        /// <summary>
        /// Called when the model is updated
        /// </summary>
        protected virtual void OnModelUpdated( )
        {        
        }

        /// <summary>
        /// Called when the your GooeeSettings instance is updated
        /// </summary>
        protected virtual void OnSettingsUpdated( )
        {
        }

        /// <summary>
        /// Try to convert a property value
        /// </summary>
        /// <param name="propertyType"></param>
        /// <param name="val"></param>
        /// <param name="result"></param>
        /// <returns></returns>
        private bool TryConvertValue( Type propertyType, object val, out object result )
        {
            result = null;
            if ( propertyType == typeof( decimal ) )
            {
                if ( val is string stringValue && int.TryParse( stringValue, out var intValue ) )
                {
                    result = intValue / 100m;
                    return true;
                }
                else if ( val is long longValue )
                {
                    result = longValue / 100m;
                    return true;
                }
                else if ( val is int intValue2 )
                {
                    result = intValue2 / 100m;
                    return true;
                }
            }
            else if ( propertyType == typeof( int ) && val is long longValue )
            {
                result = ( int ) longValue;
                return true;
            }
            else if ( propertyType.IsEnum && val is string strVal )
            {
                if ( Enum.TryParse( propertyType, strVal, out var enumValue ) )
                {
                    result = enumValue;
                    return true;
                }
            }
            else if ( propertyType.IsEnum && val is int intVal  )
            {
                result = Convert.ChangeType( intVal, propertyType );
                return true;
            }
            return false;
        }

        protected void TriggerToolbarUpdate( )
        {
            _gooeeUISystem?.BuildToolbarChildCache( );
        }
    }
}
