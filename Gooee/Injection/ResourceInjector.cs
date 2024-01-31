using Gooee.Helpers;
using Gooee.Plugins;
using Colossal.Reflection;
using Colossal.UI;
using Game.SceneFlow;
using Game.UI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using UnityEngine;
using System.IO.Compression;
using System.Linq;

namespace Gooee.Injection
{
    internal class ResourceInjector
    {
        const string UI_IDENTIFIER = "gooeeui";
        const string URL_PREFIX = $"coui://{UI_IDENTIFIER}/";

        static readonly string ASSEMBLY_PATH = Path.GetDirectoryName( Assembly.GetExecutingAssembly( ).Location );
        public static readonly string MOD_PATH = Path.Combine( Application.persistentDataPath, "Mods", "Gooee" );
        static readonly string PLUGIN_PATH = Path.Combine( MOD_PATH, "Plugins" );
        static readonly string CHANGELOG_READ_PATH = Path.Combine( MOD_PATH, "changelog.ini" );

        static readonly string UI_PATH = Path.Combine( Application.streamingAssetsPath, "~UI~" );
        static readonly string HOOKUI_PATH = Path.Combine( UI_PATH, "HookUI" );
        static readonly string INDEX_HTML = Path.Combine( HOOKUI_PATH, "index.html" );
        static readonly string INDEX_JS = Path.Combine( HOOKUI_PATH, "index.js" );

        const string CV_JS_FILENAME = "gooee.js";
        const string CV_CSS_FILENAME = "gooee.css";

        const string SCRIPT_ELEMENT = "<script src=\"index.js\"></script>";
        const string STYLE_ELEMENT = "<link href=\"index.css\" rel=\"stylesheet\"/>";
        const string CV_SCRIPT_ELEMENT = $"<script src=\"{URL_PREFIX}{CV_JS_FILENAME}\"></script>";
        const string CV_STYLE_ELEMENT = $"    <link href=\"{URL_PREFIX}{CV_CSS_FILENAME}\" rel=\"stylesheet\"/>";

        static readonly (string Search, string Replacement)[] INJECTION_POINTS = new[]
        {
            ("(0,e.jsx)(ITe,{})]", "(0,e.jsx)(ITe,{}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'bottom-right-toolbar'})]"),
            ("(0,e.jsx)(window._$hookui_menu,{react:i})", "(0,e.jsx)(window._$hookui_menu,{react:i}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-left-toolbar'})"),
            ("className:Bge.pauseMenuLayout,children:[R&&(0,e.jsx)", "className:Bge.pauseMenuLayout,children:[(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-right-toolbar'}),R&&(0,e.jsx)"),
            ("(0,e.jsx)(JOe,{})]", "(0,e.jsx)(JOe,{}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'bottom-left-toolbar'})]"),

            ("(0,e.jsx)(rIe,{focusKey:MSe.toolbar})", "(0,e.jsx)(rIe,{focusKey:MSe.toolbar}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'default'})"),
            ("]}),(0,e.jsx)(rIe,{focusKey:MSe.toolbar})", ",(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'main-container'})]}),(0,e.jsx)(rIe,{focusKey:MSe.toolbar})"),
        };

        private static readonly GooeeLogger _log = GooeeLogger.Get( "Gooee" );

        /// <summary>
        /// Inject Gooee into the HookUI index.html and index.js.
        /// </summary>
        public static void Inject( )
        {
            if ( !Directory.Exists( HOOKUI_PATH ) )
            {
                _log.Error( "No HookUI folder found!" );
                return;
            }

            SaveResources( );

            PluginLoader.Load( );

            InjectJS( );
            InjectHTML( );

            SetupFileWatcher( );
            _log.Info( "Installed Gooee!" );
        }

        private static void InjectJS( )
        {
            var js = File.ReadAllText( INDEX_JS );

            foreach ( var injectionPoint in INJECTION_POINTS )
            {
                js = js.Replace( injectionPoint.Search, injectionPoint.Replacement );
            }

            File.WriteAllText( INDEX_JS, js );
        }

        private static void InjectHTML( )
        {
            var html = File.ReadAllText( INDEX_HTML );
            html = TransformHTML( html );

            File.WriteAllText( INDEX_HTML, html );
        }

        /// <summary>
        /// Transform the index.html file to include our styles and scripts.
        /// </summary>
        /// <param name="html"></param>
        private static string TransformHTML( string html )
        {
            var scriptBuilder = new StringBuilder( CV_SCRIPT_ELEMENT );
            var styleBuilder = new StringBuilder( STYLE_ELEMENT );

            styleBuilder.AppendLine( );
            styleBuilder.AppendLine( CV_STYLE_ELEMENT );

            scriptBuilder.AppendLine( );

            IncludePlugins( scriptBuilder, styleBuilder );

            scriptBuilder.AppendLine( "    " + SCRIPT_ELEMENT );

            html = html.Replace( SCRIPT_ELEMENT, scriptBuilder.ToString( ) );
            html = html.Replace( STYLE_ELEMENT, styleBuilder.ToString( ) );
            return html;
        }

        /// <summary>
        /// Include plugin scripts and styles
        /// </summary>
        /// <param name="scriptBuilder"></param>
        /// <param name="styleBuilder"></param>
        private static void IncludePlugins( StringBuilder scriptBuilder, StringBuilder styleBuilder )
        {
            var pluginChangeLogs = new List<string>( );

            foreach ( var plugin in PluginLoader.Plugins.Values )
            {
                if ( !string.IsNullOrEmpty( plugin.ScriptResource ) )
                {
                    var scriptFileName = plugin.Name.Replace( " ", "_" ) + Path.GetExtension( plugin.ScriptResource );
                    var newScript = $"    <script src=\"{URL_PREFIX}Plugins/{scriptFileName}\"></script>";
                    scriptBuilder.AppendLine( newScript );
                }

                if ( plugin is IGooeeStyleSheet stPlugin && !string.IsNullOrEmpty( stPlugin.StyleResource ) )
                {
                    var styleFileName = plugin.Name.Replace( " ", "_" ) + Path.GetExtension( stPlugin.StyleResource );
                    var newStyle = $"    <link href=\"{URL_PREFIX}Plugins/{styleFileName}\" rel=\"stylesheet\"/>";
                    styleBuilder.AppendLine( newStyle );
                }

                if ( plugin is IGooeeChangeLog clPlugin && !string.IsNullOrEmpty( clPlugin.ChangeLogResource ) )
                {
                    pluginChangeLogs.Add( "{ \"name\": \"" + plugin.Name + "\", \"version\": \"" + clPlugin.Version + "\", \"timestamp\": \"" + GetPluginTimeStamp( plugin.GetType().Assembly ).ToString() + "\" }" );
                }
            }

            if ( pluginChangeLogs.Count > 0 )
            {
                scriptBuilder.AppendLine( "" );
                var pluginList = string.Join (",", pluginChangeLogs );
                scriptBuilder.AppendLine( @"    <script type=""text/javascript"">window.$_gooee_changeLogShow = " + HasChangeLogUpdated().ToString().ToLower() + "; window.$_gooee_changeLogs = [" + pluginList + "];</script>" );
            }
            else
            {
                scriptBuilder.AppendLine( @"    <script type=""text/javascript"">window.$_gooee_changeLogShow = false; window.$_gooee_changeLogs = [];</script>" );
            }
        }

        public static bool HasChangeLogUpdated( )
        {
            var changeLogPlugins = PluginLoader.Plugins.Values.Where( p => p is IGooeeChangeLog ).ToList( );

            if ( changeLogPlugins.Count <= 0 )
                return false;

            if ( !File.Exists( CHANGELOG_READ_PATH ) )
                return true;

            var sb = new StringBuilder( );

            foreach ( var plugin in changeLogPlugins )
            {
                var changeLog = plugin as IGooeeChangeLog;
                sb.AppendLine( $"{plugin.Name},{changeLog.Version}" );
            }

            var existing = File.ReadAllText( CHANGELOG_READ_PATH );

            if ( string.IsNullOrEmpty( existing ) )
                return true;

            return existing != sb.ToString( );
        }

        public static void WriteChangeLogRead( )
        {
            var sb = new StringBuilder();

            foreach ( var plugin in PluginLoader.Plugins.Values.Where( p => p is IGooeeChangeLog ) )
            {
                var changeLog = plugin as IGooeeChangeLog;
                sb.AppendLine($"{plugin.Name},{changeLog.Version}");
            }

            File.WriteAllText( CHANGELOG_READ_PATH, sb.ToString() );
        }

        public static void ResetChangeLog( )
        {
            if ( File.Exists( CHANGELOG_READ_PATH ) )
                File.Delete( CHANGELOG_READ_PATH );
        }

        /// <summary>
        /// Retrieves a plugin timestamp.
        /// </summary>
        /// <param name="filePath">The file path.</param>
        /// <returns>The DateTime representing the linker timestamp.</returns>
        private static DateTime GetPluginTimeStamp( Assembly assembly )
        {
            const int peHeaderOffset = 60;
            const int linkerTimestampOffset = 8;
            var b = new byte[2048];

            using ( var s = new System.IO.FileStream( assembly.Location, FileMode.Open, FileAccess.Read ) )
            {
                s.Read( b, 0, 2048 );
            }

            var i = BitConverter.ToInt32( b, peHeaderOffset );
            var secondsSince1970 = BitConverter.ToInt32( b, i + linkerTimestampOffset );
            var dt = new DateTime( 1970, 1, 1, 0, 0, 0 ).AddSeconds( secondsSince1970 );
            return dt.AddHours( TimeZone.CurrentTimeZone.GetUtcOffset( dt ).Hours );
        }

        /// <summary>
        /// Save the core Gooee resources
        /// </summary>
        private static void SaveResources( )
        {
            SaveResource( "Gooee.Resources", CV_JS_FILENAME );
            SaveResource( "Gooee.Resources", CV_CSS_FILENAME );
            ExtractIcons( );
        }

        private static void ExtractIcons( )
        {
            var faPath = Path.Combine( MOD_PATH, "FA" );
            var faZip = Path.Combine( ASSEMBLY_PATH, "FA.zip" );

            if ( !Directory.Exists( faPath ) && File.Exists( faZip ) )
            {
                using ( var zip = ZipFile.OpenRead( faZip ) )
                {
                    zip.ExtractToDirectory( MOD_PATH, true );
                }
            }
        }

        /// <summary>
        /// Save a Gooee resource
        /// </summary>
        /// <param name="namespaceName"></param>
        /// <param name="resourceName"></param>
        public static void SaveResource( string resourceFolder, string fileName )
        {
            var resourceName = $"{resourceFolder}.{fileName}";

            Directory.CreateDirectory( MOD_PATH );

            var contents = EmbeddedResource.LoadText( resourceName );

            if ( contents == null )
            {
                _log.Error( $"Failed to load resource: {resourceName}" );
                // Error
                return;
            }

            File.WriteAllText( Path.Combine( MOD_PATH, fileName ), contents );
        }

        public static void SavePluginResource( Assembly pluginAssembly, string pluginName, string resourceName )
        {
            Directory.CreateDirectory( PLUGIN_PATH );

            var contents = EmbeddedResource.LoadText( resourceName, pluginAssembly );

            if ( contents == null )
            {
                _log.Error( $"Failed to load resource: {resourceName}" );
                // Error
                return;
            }

            var extension = Path.GetExtension( resourceName );

            File.WriteAllText( Path.Combine( PLUGIN_PATH, pluginName.Replace( " ", "_" ) + extension ), contents );
        }

        /// <summary>
        /// Ensure the UI resource handler is setup
        /// </summary>
        public static void SetupResourceHandler( )
        {
            var resourceHandler = ( GameUIResourceHandler ) GameManager.instance.userInterface.view.uiSystem.resourceHandler;

            if ( resourceHandler == null || resourceHandler.HostLocationsMap.ContainsKey( UI_IDENTIFIER ) )
            {
                _log.Error( "Failed to setup resource handler for Gooee." );
                return;
            }

            _log.Info( "Setup resource handler for Gooee." );
            resourceHandler.HostLocationsMap.Add( UI_IDENTIFIER, new List<string> { MOD_PATH } );
        }

        static FileSystemWatcher _watcher;

        private static void SetupFileWatcher( )
        {
            if ( _watcher != null )
                return;

            _watcher = new FileSystemWatcher
            {
                Path = MOD_PATH,
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName,
                Filter = "*.*", 
                IncludeSubdirectories = true
            };

            _watcher.Changed += OnChanged;
            _watcher.Created += OnChanged;
            _watcher.EnableRaisingEvents = true;
        }

        static FieldInfo _liveReload = typeof( UIView ).GetField( "m_LiveReload", BindingFlags.NonPublic | BindingFlags.Instance );
        static MethodInfo _onChanged = typeof( UILiveReload ).GetMethod( "OnChanged", BindingFlags.NonPublic | BindingFlags.Instance );

        private static void OnChanged( object source, FileSystemEventArgs e )
        {
            if ( e.ChangeType != WatcherChangeTypes.Changed )
            {
                return;
            }

            if ( e.FullPath.EndsWith( ".js" ) || e.FullPath.EndsWith( ".css" ) || e.FullPath.EndsWith( ".md" ) )
            {
                var liveReload = ( UILiveReload ) _liveReload.GetValue( GameManager.instance.userInterface.view );

                // Redirect the on changed event to the internal UI so it reloads properly.
                _onChanged.Invoke( liveReload, e.FullPath );

                _log.Info( "Gooee reloaded the UI view." );
            }
        }
    }
}
