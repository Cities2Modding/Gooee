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
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using Gooee.Plugins.Attributes;
using System.Reflection.Emit;

namespace Gooee.Injection
{
    internal class ResourceInjector
    {
        const string UI_IDENTIFIER = "gooeeui";
        const string URL_PREFIX = $"coui://{UI_IDENTIFIER}/";

        public static bool MakeHookUICompatible = false;

        static readonly string ASSEMBLY_PATH = Path.GetDirectoryName( Assembly.GetExecutingAssembly( ).Location );
        public static readonly string MOD_PATH = Path.Combine( Application.persistentDataPath, "Mods", "Gooee" );
        static readonly string PLUGIN_PATH = Path.Combine( MOD_PATH, "Plugins" );
        static readonly string CHANGELOG_READ_PATH = Path.Combine( MOD_PATH, "changelog.ini" );

        static readonly string UI_PATH = Path.Combine( Application.streamingAssetsPath, "~UI~" );
        static readonly string GAMEUI_PATH = Path.Combine( UI_PATH, "GameUI" );
        static readonly string HOOKUI_PATH = Path.Combine( UI_PATH, "HookUI" );

        static readonly string GAMEUI_INDEX_HTML = Path.Combine( GAMEUI_PATH, "index.html" );
        static readonly string GAMEUI_INDEX_JS = Path.Combine( GAMEUI_PATH, "index.js" );

        static readonly string HOOKUI_INDEX_HTML = Path.Combine( HOOKUI_PATH, "index.html" );
        static readonly string HOOKUI_INDEX_JS = Path.Combine( HOOKUI_PATH, "index.js" );

        static readonly string NON_HOOKUI_INDEX_HTML = Path.Combine( MOD_PATH, "index.html" );
        static readonly string NON_HOOKUI_INDEX_JS = Path.Combine( MOD_PATH, "index.js" );

        const string CV_JS_FILENAME = "gooee.js";
        const string CV_CSS_FILENAME = "gooee.css";

        const string SCRIPT_ELEMENT = "<script src=\"index.js\"></script>";
        const string NON_HOOKUI_SCRIPT_ELEMENT = $"<script src=\"{URL_PREFIX}index.js\"></script>";
        const string STYLE_ELEMENT = "<link href=\"index.css\" rel=\"stylesheet\"/>";
        const string NON_HOOKUI_STYLE_ELEMENT = "<link href=\"index.css\" rel=\"stylesheet\">";
        const string GOOEE_STYLE_ELEMENT = "<link href=\"coui://GameUI/index.css\" rel=\"stylesheet\"/>";
        const string CV_SCRIPT_ELEMENT = $"<script src=\"{URL_PREFIX}{CV_JS_FILENAME}\"></script>";
        const string CV_STYLE_ELEMENT = $"    <link href=\"{URL_PREFIX}{CV_CSS_FILENAME}\" rel=\"stylesheet\"/>";

        static readonly (string Search, string Replacement)[] INJECTION_POINTS = new[]
        {
            ("(0,e.jsx)(ITe,{})]", "(0,e.jsx)(ITe,{}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'bottom-right-toolbar'})]"),
            ("className:Bge.pauseMenuLayout,children:[R&&(0,e.jsx)", "className:Bge.pauseMenuLayout,children:[(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-right-toolbar'}),R&&(0,e.jsx)"),
            ("(0,e.jsx)(JOe,{})]", "(0,e.jsx)(JOe,{}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'bottom-left-toolbar'})]"),

            ("(0,e.jsx)(rIe,{focusKey:MSe.toolbar})", "(0,e.jsx)(rIe,{focusKey:MSe.toolbar}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'default'})"),
            ("]}),(0,e.jsx)(rIe,{focusKey:MSe.toolbar})", ",(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'main-container'})]}),(0,e.jsx)(rIe,{focusKey:MSe.toolbar})"),

            // Photo mode panel
            ("var n=t.children;return(0,e.jsx)(\"div\",{className:Oe()(Bge.photoModePanelLayout),children:n})", "var n=t.children;return(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'photomode-container',photoMode:{className:Oe()(Bge.photoModePanelLayout),children:n}})"),
        };

        static readonly (string Search, string Replacement) HOOKUI_INJECTION_POINT = ("(0,e.jsx)(window._$hookui_menu,{react:i})]", "(0,e.jsx)(window._$hookui_menu,{react:i}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-left-toolbar'})]");
        static readonly (string Search, string Replacement) NON_HOOKUI_INJECTION_POINT = ("qge.lock})})})})]", "qge.lock})})})}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-left-toolbar'})]");

        private static readonly GooeeLogger _log = GooeeLogger.Get( "Gooee" );

        static bool HasInjected = false;

        public static JsonSerializerSettings _jsonSettings = new JsonSerializerSettings
        {
            DefaultValueHandling = DefaultValueHandling.Populate,
            NullValueHandling = NullValueHandling.Include,
            Converters = new[]
            {
                new Newtonsoft.Json.Converters.StringEnumConverter( )
            }
        };

        public static bool IsHookUILoaded( )
        {
            if ( MakeHookUICompatible )
                return true;

            var directory = Path.GetDirectoryName( Assembly.GetExecutingAssembly( ).Location );
            var parent = Directory.GetParent( directory ).FullName;

            var files = Directory.GetFiles( parent, "*.dll", SearchOption.AllDirectories );

            MakeHookUICompatible = files.Count( f => f.ToLower( ).EndsWith( "hookuimod.dll" ) ) > 0;
            
            return MakeHookUICompatible;
        }

        /// <summary>
        /// Inject Gooee into the HookUI index.html and index.js.
        /// </summary>
        public static void Inject( )
        {
            if ( HasInjected )
                return;

            MakeHookUICompatible = IsHookUILoaded( );

            if ( !Directory.Exists( MakeHookUICompatible ? HOOKUI_PATH : GAMEUI_PATH ) )
            {
                _log.Error( "No UI folder found!" );
                return;
            }

            SaveResources( );

            PluginLoader.Load( );

            InjectJS( );
            InjectHTML( );

            SetupFileWatcher( );
            _log.Info( "Installed Gooee!" );
            HasInjected = true;
        }

        private static void InjectJS( )
        {
            var js = File.ReadAllText( MakeHookUICompatible ? HOOKUI_INDEX_JS : GAMEUI_INDEX_JS );

            if ( MakeHookUICompatible )
            {
                js = js.Replace( HOOKUI_INJECTION_POINT.Search, HOOKUI_INJECTION_POINT.Replacement );
            }
            else
                js = js.Replace( NON_HOOKUI_INJECTION_POINT.Search, NON_HOOKUI_INJECTION_POINT.Replacement );

            foreach ( var injectionPoint in INJECTION_POINTS )
            {
                js = js.Replace( injectionPoint.Search, injectionPoint.Replacement );
            }

            File.WriteAllText( MakeHookUICompatible ? HOOKUI_INDEX_JS : NON_HOOKUI_INDEX_JS, js );
        }

        private static void InjectHTML( )
        {
            var html = File.ReadAllText( MakeHookUICompatible ? HOOKUI_INDEX_HTML : GAMEUI_INDEX_HTML );
            html = TransformHTML( html );

            File.WriteAllText( MakeHookUICompatible ? HOOKUI_INDEX_HTML : NON_HOOKUI_INDEX_HTML, html );
        }

        /// <summary>
        /// Transform the index.html file to include our styles and scripts.
        /// </summary>
        /// <param name="html"></param>
        private static string TransformHTML( string html )
        {
            var scriptBuilder = new StringBuilder( CV_SCRIPT_ELEMENT );
            var styleBuilder = new StringBuilder( GOOEE_STYLE_ELEMENT );

            styleBuilder.AppendLine( );
            styleBuilder.AppendLine( CV_STYLE_ELEMENT );

            scriptBuilder.AppendLine( );

            IncludePlugins( scriptBuilder, styleBuilder );

            scriptBuilder.AppendLine( "    " + ( MakeHookUICompatible ? SCRIPT_ELEMENT : NON_HOOKUI_SCRIPT_ELEMENT ) );

            html = html.Replace( SCRIPT_ELEMENT, scriptBuilder.ToString( ) );
            html = html.Replace( MakeHookUICompatible ? STYLE_ELEMENT : NON_HOOKUI_STYLE_ELEMENT, styleBuilder.ToString( ) );
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

            scriptBuilder.AppendLine( "<script type=\"text/javascript\">" );
            scriptBuilder.AppendLine( "window.$_gooee_defaultModel = [];" );
            scriptBuilder.AppendLine( "window.$_gooee_toolbar = [];" );

            var pluginIndex = 0;
            foreach ( var plugin in PluginLoader.Plugins.Values )
            {
                PluginLoader.GetControllerTypes( plugin, out var controllerTypes, out var modelTypes );

                if ( controllerTypes?.Count > 0 && modelTypes?.Count > 0 )
                {
                    for ( var i = 0; i < controllerTypes.Count; i++ )
                    {
                        var controllerType = controllerTypes[i];
                        var modelType = modelTypes[i];
                        var defaultModel = Activator.CreateInstance( modelType );
                        var json = JsonConvert.SerializeObject( defaultModel, _jsonSettings );
                        var js = $"   window.$_gooee_defaultModel[\"{plugin.Name.ToLower( )}.{controllerType.Name.ToLower( ).Replace( "controller", "" )}\"] = {Regex.Replace( json, @"\""([A-Za-z0-9_@]+)\""\:", "$1:" )};";
                        scriptBuilder.AppendLine( js );
                    }

                    var toolbarAttribute = plugin.GetType( ).GetCustomAttribute<PluginToolbarAttribute>( );

                    if ( toolbarAttribute != null )
                    {
                        var js = $"   window.$_gooee_toolbar[\"{plugin.Name.ToLower( )}\"] = {{Name:\"{plugin.Name}\", Label:{( toolbarAttribute.Label != null ? $"\"{toolbarAttribute.Label}\"" : "null" )}, Icon:{( toolbarAttribute.Icon != null ? $"\"{toolbarAttribute.Icon}\"" : "null" )}, Controller:\"{toolbarAttribute.ControllerType.Name.ToLower( ).Replace( "controller", "" )}\", Method:\"{toolbarAttribute.OnClickMethod.Name}\"}};";
                        scriptBuilder.AppendLine( js );
                    }
                }
                pluginIndex++;
            }

            scriptBuilder.AppendLine( "</script>" );

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

            //if ( pluginChangeLogs.Count > 0 )
            //{
            //    scriptBuilder.AppendLine( "" );
            //    var pluginList = string.Join (",", pluginChangeLogs );
            //    scriptBuilder.AppendLine( @"    <script type=""text/javascript"">window.$_gooee_changeLogShow = " + HasChangeLogUpdated().ToString().ToLower() + "; window.$_gooee_changeLogs = [" + pluginList + "];</script>" );
            //}
            //else
            //{
            //    scriptBuilder.AppendLine( @"    <script type=""text/javascript"">window.$_gooee_changeLogShow = false; window.$_gooee_changeLogs = [];</script>" );
            //}
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
