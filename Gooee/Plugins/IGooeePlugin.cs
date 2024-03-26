using Gooee.Helpers;
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
    }

    /// <summary>
    /// Plugin interface with a controller
    /// </summary>
    [Obsolete( "Please use ControllerTypes with IGooeePluginWithControllers instead!" )]
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

    public interface IGooeeChangeLog
    {
        string Version
        {
            get;
        }

        string ChangeLogResource
        {
            get;
        }
    }

    public interface IGooeeStyleSheet
    {
        string StyleResource
        {
            get;
        }
    }

    public interface IGooeeSettings
    {
        GooeeSettings Settings
        {
            get;
            set;
        }
    }

    public interface IGooeeLanguages
    {
        string LanguageResourceFolder
        {
            get;
        }
    }

    public interface IGooeeLogger
    {
        GooeeLogger Log
        {
            get;
            set;
        }
    }
}