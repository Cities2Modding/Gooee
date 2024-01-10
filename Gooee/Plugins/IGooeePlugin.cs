using System;

namespace Gooee.Plugins
{
    /// <summary>
    /// Core plugin interface for mods to use to integrate their custom UIs.
    /// </summary>
    public interface IGooeePlugin
    {
        string Name 
        { 
            get;
        }

        string ScriptResource
        {
            get;
        }

        string StyleResource
        {
            get;
        }
    }

    /// <summary>
    /// Plugin interface with a controller
    /// </summary>
    public interface IGooeePluginWithController : IGooeePlugin
    {
        IController Controller
        {
            get;
            set;
        }
    }

    /// <summary>
    /// Plugin interface with multiple controllers
    /// </summary>
    public interface IGooeePluginWithControllers : IGooeePlugin
    {
        IController[] Controllers
        {
            get;
            set;
        }
    }
}
