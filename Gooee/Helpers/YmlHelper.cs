using System.Collections.Generic;
using System;

namespace Gooee.Helpers
{
    public static class YmlHelper
    {
        public static Dictionary<string, Dictionary<string, string>> Parse( string assemblyName, string settingsName, string contents )
        {
            if ( string.IsNullOrEmpty( contents ) )
                return null;

            var result = new Dictionary<string, Dictionary<string, string>>( );
            string currentMainKey = null;

            var lines = contents.Split( Environment.NewLine, StringSplitOptions.RemoveEmptyEntries );

            foreach ( var line in lines )
            {
                if ( string.IsNullOrWhiteSpace( line ) || line.Trim().StartsWith( "#" ) )
                    continue;

                if ( !line.StartsWith( " " ) )
                {
                    currentMainKey = line.Trim( ':' ).Trim( );
                    result[currentMainKey] = new Dictionary<string, string>( );
                }
                else
                {
                    var parts = line.Trim( ).Split( new[] { ':' }, 2 );

                    if ( parts.Length != 2 )
                        throw new FormatException( "Invalid line format" );

                    var key = parts[0].Trim( );
                    var value = parts[1].Trim( );

                    // Convert to the ugly options keys
                    if ( settingsName != null && key.Trim() == "ModName" )
                        result[currentMainKey]["Options.SECTION[" + assemblyName + "." + settingsName + "]"] = value;
                    else if ( settingsName != null && key.EndsWith( ".Option_desc" ) )
                        result[currentMainKey]["Options.OPTION_DESCRIPTION[" + assemblyName + "." + settingsName + "." + settingsName + "." + key.Replace( ".Option_desc", "" ) + "]"] = value;
                    else if ( settingsName != null && key.EndsWith( ".Option" ) )
                        result[currentMainKey]["Options.OPTION[" + assemblyName + "." + settingsName + "." + settingsName + "." + key.Replace( ".Option", "" ) + "]"] = value;
                    else if ( settingsName != null && key.EndsWith( ".Group" ) )
                        result[currentMainKey]["Options.GROUP[" + assemblyName + "." + settingsName + "." + key.Replace( ".Group", "" ) + "]"] = value;
                    else if ( settingsName != null && key.EndsWith( ".Tab" ) )
                        result[currentMainKey]["Options.TAB[" + assemblyName + "." + settingsName + "." + key.Replace( ".Tab", "" ) + "]"] = value;
                    else
                        result[currentMainKey][key] = value;
                }
            }

            return result;
        }
    }
}