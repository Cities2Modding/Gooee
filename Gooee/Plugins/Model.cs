using Colossal.Reflection;
using Colossal.UI.Binding;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;

namespace Gooee.Plugins
{
    public abstract class Model : IModel, IJsonWritable
    {
        public static Dictionary<Type, PropertyInfo[]> _propertiesCache = new Dictionary<Type, PropertyInfo[]>( );

        public void Write( IJsonWriter writer )
        {
            var type = GetType( );
            if ( !_propertiesCache.TryGetValue( type, out var properties ) )
            {
                properties = type.GetProperties( BindingFlags.Public | BindingFlags.Instance );
                _propertiesCache[type] = properties;
            }

            ParseType( writer, this, properties );
        }

        private void ParseType( IJsonWriter writer, object instance, PropertyInfo[] properties )
        {
            writer.TypeBegin( instance.GetType( ).FullName );

            foreach ( var property in properties )
            {
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
                    writer.Write( ( int ) ( decimalValue  * 100 ) ); // Writing decimal as INT up two decimal places
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

        private void HandleDictionary( IJsonWriter writer, object value)
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
