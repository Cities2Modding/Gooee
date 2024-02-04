using cohtml.Net;
using Colossal.Reflection;
using Colossal.UI.Binding;
using Game.SceneFlow;
using Game.Vehicles;
using Gooee.Plugins.Attributes;
using HarmonyLib;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;

namespace Gooee.Plugins
{
    public abstract class Model : IModel, IJsonWritable
    {
        [JsonIgnore]
        public IController Controller
        {        
            get;
            private set;
        }

        public static Dictionary<Type, PropertyInfo[]> _propertiesCache = new Dictionary<Type, PropertyInfo[]>( );

        //private BoundEventHandle RegisterListener( IController controller )
        //{
        //    Controller = controller;

        //    var view = GameManager.instance.userInterface.view.View;
        //    var key = $"gooee.binding.{Controller.Plugin.Name.Replace( " ", "" ).ToLower( )}.{Controller.GetType( ).Name.Replace( "Controller", "" ).ToLower( )}.set";

        //    return view.RegisterForEvent( key, OnClientUpdateModel );
        //}

        //private string Serialise( )
        //{
        //    return JsonConvert.SerializeObject( this );
        //}

        //protected virtual void OnClientUpdateModel( string json )
        //{
        //    if ( string.IsNullOrEmpty( json ) )
        //        return;

        //    var type = GetType( );
        //    var newModel = JsonConvert.DeserializeObject( json, type );

        //    if ( newModel != null )
        //    {
        //        if ( !_propertiesCache.TryGetValue( type, out var properties ) )
        //        {
        //            properties = type.GetProperties( BindingFlags.Public | BindingFlags.Instance );
        //            _propertiesCache[type] = properties;
        //        }

        //        foreach ( var property in properties )
        //        {
        //            property.SetValue( this, property.GetValue( newModel, null ) );
        //        }
        //    }
        //}

        //protected virtual void OnServerUpdateModel( )
        //{
        //    var view = GameManager.instance.userInterface.view.View;
        //    var key = $"gooee.binding.{Controller.Plugin.Name.Replace( " ", "" ).ToLower( )}.{Controller.GetType( ).Name.Replace( "Controller", "" ).ToLower( )}.get";

        //    view.TriggerEvent( key, Serialise( ) );
        //}

        public static void EnsureType( Type type )
        {
            try
            {
                if ( !_propertiesCache.TryGetValue( type, out var properties ) )
                {
                    properties = type.GetProperties( BindingFlags.Public | BindingFlags.Instance );
                    _propertiesCache[type] = properties;
                }
            }
            catch ( Exception ex )
            {
                UnityEngine.Debug.LogException( ex );
            }
        }

        public void Write( IJsonWriter writer )
        {
            try
            {            
                var type = GetType( );
                if ( !_propertiesCache.TryGetValue( type, out var properties ) )
                {
                    properties = type.GetProperties( BindingFlags.Public | BindingFlags.Instance );
                    _propertiesCache[type] = properties;
                }

                ParseType( writer, this, properties );
            }
            catch ( Exception ex )
            {
                UnityEngine.Debug.LogException( ex );
            }
        }

        private void ParseType( IJsonWriter writer, object instance, PropertyInfo[] properties )
        {
            writer.TypeBegin( instance.GetType( ).FullName );

            foreach ( var property in properties )
            {
                if ( typeof( IController ).IsAssignableFrom( property.PropertyType ) )
                    continue;

                var value = property.GetValue( instance );
                if ( value == null )
                {
                    writer.WriteNull( );
                    continue;
                }

                WriteProperty( writer, property, value );
            }

            writer.TypeEnd( );
        }

        private void WriteProperty( IJsonWriter writer, PropertyInfo property, object value )
        {
            writer.PropertyName( property.Name );
            WritePropertyValue( writer, value );
        }

        private void WritePropertyValue( IJsonWriter writer, object value )
        {
            var valueType = value.GetType( );

            // Handling various value types
            switch ( value )
            {
                case string stringValue:
                    writer.Write( stringValue );
                    break;
                case float singleValue:
                    writer.Write( singleValue );
                    break;
                case double doubleValue:
                    writer.Write( doubleValue );
                    break;
                case short int16Value:
                    writer.Write( int16Value );
                    break;
                case uint uint32Value:
                    writer.Write( uint32Value );
                    break;
                case int int32Value:
                    writer.Write( int32Value );
                    break;
                case long int64Value:
                    writer.Write( int64Value );
                    break;
                case bool boolValue:
                    writer.Write( boolValue );
                    break;
                case decimal decimalValue:
                    writer.Write( ( int ) ( decimalValue * 100 ) ); // Writing decimal as INT up two decimal places
                    break;
                case Enum enumValue:
                    writer.Write( enumValue.ToString( ) ); // Writing enum as string
                    break;
                default:
                    WriteComplexType( writer, value, valueType );
                    break;
            }
        }

        private void WriteComplexType( IJsonWriter writer, object value, Type valueType )
        {
            if ( valueType.IsSubclassOfRawGeneric( typeof( List<> ) ) )
            {
                HandleList( writer, value, valueType );
            }
            //else if ( value is Array array )
            //{
            //    HandleArray( writer, array, valueType );
            //}
            else if ( valueType == typeof( Dictionary<string, string> ) )
            {
                HandleDictionary( writer, value );
            }
            else
            {
                // Handle other complex types if needed
            }
        }

        private void HandleList( IJsonWriter writer, object value, Type valueType )
        {
            var list = value as IList;
            if ( list != null )
            {
                var size = list.Count;
                writer.ArrayBegin( size );

                foreach ( var item in list )
                {
                    switch ( item )
                    {
                        case string stringValue:
                            writer.Write( stringValue );
                            break;
                        case float singleValue:
                            writer.Write( singleValue );
                            break;
                        case double doubleValue:
                            writer.Write( doubleValue );
                            break;
                        case short int16Value:
                            writer.Write( int16Value );
                            break;
                        case uint uint32Value:
                            writer.Write( uint32Value );
                            break;
                        case int int32Value:
                            writer.Write( int32Value );
                            break;
                        case long int64Value:
                            writer.Write( int64Value );
                            break;
                        case bool boolValue:
                            writer.Write( boolValue );
                            break;
                        case decimal decimalValue:
                            writer.Write( ( int ) ( decimalValue * 100 ) ); // Writing decimal as INT up two decimal places
                            break;
                        case Enum enumValue:
                            writer.Write( enumValue.ToString( ) ); // Writing enum as string
                            break;
                        default:
                            var innerValueType = valueType.GenericTypeArguments[0];
                            var innerValueProperties = innerValueType.GetProperties( BindingFlags.Instance | BindingFlags.Public );

                            ParseType( writer, item, innerValueProperties );
                            break;
                    }
                }

                writer.ArrayEnd( );
            }
        }

        private void HandleArray( IJsonWriter writer, Array value, Type valueType )
        {
            if ( value != null )
            {
                var size = value.Length;
                writer.ArrayBegin( size );

                foreach ( var item in value )
                {
                    switch ( item )
                    {
                        case string stringValue:
                            writer.Write( stringValue );
                            break;
                        case float singleValue:
                            writer.Write( singleValue );
                            break;
                        case double doubleValue:
                            writer.Write( doubleValue );
                            break;
                        case short int16Value:
                            writer.Write( int16Value );
                            break;
                        case uint uint32Value:
                            writer.Write( uint32Value );
                            break;
                        case int int32Value:
                            writer.Write( int32Value );
                            break;
                        case long int64Value:
                            writer.Write( int64Value );
                            break;
                        case bool boolValue:
                            writer.Write( boolValue );
                            break;
                        case decimal decimalValue:
                            writer.Write( ( int ) ( decimalValue * 100 ) ); // Writing decimal as INT up two decimal places
                            break;
                        case Enum enumValue:
                            writer.Write( enumValue.ToString( ) ); // Writing enum as string
                            break;
                        default:
                            var innerValueType = valueType.GetElementType( );
                            var innerValueProperties = innerValueType.GetProperties( BindingFlags.Instance | BindingFlags.Public );

                            ParseType( writer, item, innerValueProperties );
                            break;
                    }
                }

                writer.ArrayEnd( );
            }
        }

        private void HandleDictionary( IJsonWriter writer, object value )
        {
            var dictionary = value as IDictionary<string, string>;
            if ( dictionary != null )
            {
                var size = dictionary.Count;

                if ( size == 0 )
                {
                    writer.WriteEmptyMap( );
                }
                else
                {
                    writer.MapBegin( size );

                    foreach ( var kvp in dictionary )
                    {
                        writer.Write( kvp.Key );
                        writer.Write( kvp.Value );
                    }

                    writer.MapEnd( );
                }
            }
        }
    }
}
