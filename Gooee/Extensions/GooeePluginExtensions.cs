using Gooee.Injection;
using Gooee.Plugins;
using System.IO;

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
            return Path.Combine( ResourceInjector.DATA_PATH, plugin.Name );
        }
    }
}
