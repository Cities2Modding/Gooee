using Colossal.OdinSerializer.Utilities;
using Colossal.Reflection;
using Colossal.UI.Binding;
using Game.UI;
using Gooee.Plugins.Attributes;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using BaseModel = Gooee.Plugins.Model;

namespace Gooee.Plugins
{
    public abstract class Controller<TModel> : UISystemBase, IController
        where TModel : class, IModel, IJsonWritable
    {
        protected IGooeePlugin Plugin
        {
            get;
            set;
        }

        protected TModel Model
        {
            get;
            private set;
        }

        protected GetterValueBinding<TModel> Binding
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
        
        public virtual void OnLoaded( )
        {
            PluginID = Plugin.Name.ToLowerInvariant( ).Replace( " ", "_" ).Trim( );
            ControllerID = PluginID + "." + GetType( ).Name.Replace( "Controller", "" ).ToLowerInvariant( ).Trim( );

            Model = Configure( );

            UnityEngine.Debug.Log( $"Register binding for mod req: {ControllerID}.model" );

            Binding = new GetterValueBinding<TModel>( ControllerID, "model", ( ) =>
            {
                return Model;
            }, new ValueWriter<TModel>( ).Nullable( ) );

            DirtyField = Binding.GetType( ).GetField( "m_ValueDirty", BindingFlags.Instance | BindingFlags.NonPublic );

            AddUpdateBinding( Binding );

            TriggerMethods = GetType( ).GetMethodsWithAttribute<OnTriggerAttribute>( )
                .ToArray( );

            if ( TriggerMethods?.Length > 0 )
            {
                TriggerMethods.ForEach( m =>
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
                } );
            }


            AddBinding( new TriggerBinding<string>( ControllerID, "updateProperty", OnUpdateProperty ) );

            UnityEngine.Debug.Log( $"Controller listening for events at {ControllerID}." );
        }

        public abstract TModel Configure( );

        protected void TriggerUpdate( )
        {
            DirtyField.SetValue( Binding, true );
        }

        private void OnUpdateProperty( string json )
        {
            if ( string.IsNullOrEmpty( json ) )
                return;

            // Assuming that propertiesCache is a Dictionary and already populated
            var properties = BaseModel._propertiesCache[Model.GetType()];

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
            else if ( propertyType.IsEnum && val is string strVal )
            {
                if ( Enum.TryParse( propertyType, strVal, out var enumValue ) )
                {
                    result = enumValue;
                    return true;
                }
            }
            return false;
        }
    }
}
