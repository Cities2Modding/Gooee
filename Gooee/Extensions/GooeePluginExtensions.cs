using Gooee.Plugins;
using System.IO;
using UnityEngine;

namespace Gooee.Extensions
{
    public static class GooeePluginExtensions
    {
        /// <summary>
        /// Get the mod persistent data path
        /// </summary>
        /// <param name="plugin"></param>
        /// <returns></returns>
        public static string GetPath( this IGooeePlugin plugin )
        {
            return Path.Combine( Application.persistentDataPath, "Mods", plugin.Name );
        }
    }
}
