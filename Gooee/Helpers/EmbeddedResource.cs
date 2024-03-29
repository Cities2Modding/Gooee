﻿using System;
using System.IO;
using System.Reflection;

namespace Gooee.Helpers
{
    /// <summary>
    /// A utility class for loading embedded resources from assemblies.
    /// </summary>
    public static class EmbeddedResource
    {
        // Holds a reference to the executing assembly.
        private static readonly Assembly _assembly = Assembly.GetExecutingAssembly( );

        /// <summary>
        /// Loads an embedded resource as a byte array.
        /// </summary>
        /// <param name="resourceName">The name of the embedded resource to load.</param>
        /// <param name="targetAssembly">The assembly to load the resource from, defaults to the executing assembly.</param>
        /// <returns>A byte array containing the contents of the embedded resource.</returns>
        /// <exception cref="InvalidOperationException">Thrown if the resource cannot be found in the specified assembly.</exception>
        public static byte[] Load( string resourceName, Assembly targetAssembly = null )
        {
            var assembly = targetAssembly ?? _assembly;

            using ( var stream = assembly.GetManifestResourceStream( resourceName ) )
            {
                if ( stream == null )
                    throw new InvalidOperationException( "Resource not found: " + resourceName );

                var buffer = new byte[stream.Length];
                stream.Read( buffer, 0, buffer.Length );
                return buffer;
            }
        }

        /// <summary>
        /// Loads an embedded resource as a string.
        /// </summary>
        /// <param name="resourceName">The name of the embedded resource to load.</param>
        /// <param name="targetAssembly">The assembly to load the resource from, defaults to the executing assembly.</param>
        /// <returns>A string containing the contents of the embedded resource.</returns>
        /// <exception cref="InvalidOperationException">Thrown if the resource cannot be found in the specified assembly.</exception>
        public static string LoadText( string resourceName, Assembly targetAssembly = null )
        {
            var assembly = targetAssembly ?? _assembly;

            using ( var stream = assembly.GetManifestResourceStream( resourceName ) )
            {
                if ( stream == null )
                    throw new InvalidOperationException( "Resource not found: " + resourceName );

                using ( var reader = new StreamReader( stream ) )
                {
                    return reader.ReadToEnd( );
                }
            }
        }

        /// <summary>
        /// Check if a resource exists.
        /// </summary>
        /// <param name="resourceName"></param>
        /// <param name="targetAssembly"></param>
        /// <returns></returns>
        public static bool Exists( string resourceName, Assembly targetAssembly = null )
        {
            if ( string.IsNullOrEmpty( resourceName ) || targetAssembly == null )
                return false;

            var assembly = targetAssembly ?? _assembly;

            try
            {
                using ( var stream = assembly.GetManifestResourceStream( resourceName ) )
                {
                    if ( stream == null )
                        return false;

                    return true;
                }
            }
            catch ( Exception )
            {
                return false;
            }
        }
    }
}