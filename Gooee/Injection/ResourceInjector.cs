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

namespace Gooee.Injection
{
    internal class ResourceInjector
    {
        const string UI_IDENTIFIER = "gooeeui";
        const string URL_PREFIX = $"coui://{UI_IDENTIFIER}/";

        public static bool MakeHookUICompatible = false;

        public static readonly string MOD_PATH = Path.Combine( Application.persistentDataPath, "Mods", "Gooee" );
        static readonly string PLUGIN_PATH = Path.Combine( MOD_PATH, "Plugins" );
        static readonly string CHANGELOG_READ_PATH = Path.Combine( MOD_PATH, "changelog.ini" );

        static readonly string UI_PATH = Path.Combine( Application.streamingAssetsPath, "~UI~" );
        static readonly string GAMEUI_PATH = Path.Combine( UI_PATH, "GameUI" );
        static readonly string HOOKUI_PATH = Path.Combine( UI_PATH, "HookUI" );

        static readonly string GAMEUI_INDEX_HTML = Path.Combine( GAMEUI_PATH, "index.html" );
        static readonly string GAMEUI_INDEX_JS = Path.Combine( GAMEUI_PATH, "index.js" );

        public static readonly string HOOKUI_INDEX_HTML = Path.Combine( HOOKUI_PATH, "index.html" );
        static readonly string HOOKUI_INDEX_JS = Path.Combine( HOOKUI_PATH, "index.js" );

        public static readonly string NON_HOOKUI_INDEX_HTML = Path.Combine( MOD_PATH, "index.html" );
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
            // Use this as a guide to find when patch changes the names!!
            // Look for 'Continue Tutorial'
            // (0,z.jsx)(ITe,{})]})]})})})},sIe=function(){var t=C(Kp);return(0,z.jsx)("div",{className:Oe()(HTe,t&&KTe),children:(0,z.jsx)("div",{className:zTe,children:(0,z.jsxs)(Fn,{focusKey:tIe,children:[(0,z.jsx)(Ok,{}),(0,z.jsx)(qG,{}),(0,z.jsx)(jOe,{}),(0,z.jsx)(VOe,{}),(0,z.jsx)(UOe,{}),(0,z.jsx)(MOe,{})]})})})},cIe=function(t){var n=t.children,r=C(Yc),o=C(Xc),a=C(Gc),l=aS(),s=(0,i.useMemo)((function(){return{"Continue Tutorial":tu}})
            ("(0,z.jsx)(BSe,{})]", "(0,z.jsx)(BSe,{}),(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'bottom-right-toolbar'})]"),
            //Y
            // This one tends to be quite reliable due to pauseMenuLayout
            // but the xxx. will vary between patches
            // className:Bge.pauseMenuLayout,children:[R&&(0,z.jsx)
            ("className:nbe.pauseMenuLayout,children:[", "className:nbe.pauseMenuLayout,children:[(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'top-right-toolbar'}),"),
            
            // This one is a bit of a pain in the arse so you still have
            // to use 'Continue Tutorial' and this structure to find it
            // (0,z.jsx)(JOe,{})]}),(0,z.jsx)(ATe,{focusKey:nIe}),(0,z.jsxs)("div",{className:qTe,children:[aIe,(0,z.jsx)(jTe,{}),oIe,(0,z.jsx)(ETe,{}),oIe,(0,z.jsx)(OTe,{}),oIe,(0,z.jsx)(DTe,{}),aIe,(0,z.jsx)(ITe,{})]})]})})})},sIe=function(){var t=C(Kp);return(0,z.jsx)("div",{className:Oe()(HTe,t&&KTe),children:(0,z.jsx)("div",{className:zTe,children:(0,z.jsxs)(Fn,{focusKey:tIe,children:[(0,z.jsx)(Ok,{}),(0,z.jsx)(qG,{}),(0,z.jsx)(jOe,{}),(0,z.jsx)(VOe,{}),(0,z.jsx)(UOe,{}),(0,z.jsx)(MOe,{})]})})})},cIe=function(t){var n=t.children,r=C(Yc),o=C(Xc),a=C(Gc),l=aS(),s=(0,i.useMemo)((function(){return{"Continue Tutorial":tu}}),[]),c=(0,i.useMemo)((function(){return{"Previous Tutorial Phase":iS}})
            ("(0,z.jsx)(vSe,{})]", "(0,z.jsx)(vSe,{}),(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'bottom-left-toolbar'})]"),

            // This one is quite easy to find as .toolbar is a constant
            // but xxx. and the (xxx, will vary between patches
            // (0,z.jsx)(rIe,{focusKey:MSe.toolbar})
            ("(0,z.jsx)(rTe,{focusKey:pIe.toolbar})", "(0,z.jsx)(rTe,{focusKey:pIe.toolbar}),(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'default'})"),
            
            // This is similar to the above, so follow the same procedure
            // ]}),(0,z.jsx)(rIe,{focusKey:MSe.toolbar})
            ("]}),(0,z.jsx)(rTe,{focusKey:pIe.toolbar})", ",(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'main-container'}),(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'main-container-end'})]}),(0,z.jsx)(rTe,{focusKey:pIe.toolbar})"),

            // This is again fairly easy due to the photoModeLayout
            // but xxx. will vary etc between patches
            // var n=t.children;return(0,z.jsx)(\"div\",{className:Oe()(Bge.photoModePanelLayout),children:n})
            ("var t=e.children;return(0,z.jsx)(\"div\",{className:_d()(nbe.photoModePanelLayout),children:t})", "var t=e.children;return(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'photomode-container',photoMode:{className:_d()(nbe.photoModePanelLayout),children:t}})"),
           // 
        };

        // This one is quite static as it relies simply on HookUI
        static readonly (string Search, string Replacement) HOOKUI_INJECTION_POINT = ("(0,z.jsx)(window._$hookui_menu,{react:Y})]", "(0,z.jsx)(window._$hookui_menu,{react:Y}),(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'top-left-toolbar'})]");

        // This one is quite easy, you can look for .lock or the class names like so:
        // qge.lock})})})})]})};const Qge={field:"field_eZ6",header:"header_oa2"
        static readonly (string Search, string Replacement) NON_HOOKUI_INJECTION_POINT = ("ube.lock})})})})]", "ube.lock})})})}),(0,z.jsx)(window.$_gooee.container,{react:Y,pluginType:'top-left-toolbar'})]");

        private static readonly GooeeLogger _log = GooeeLogger.Get( "Cities2Modding" );

        static bool HasInjected = false;

        public static bool InvalidVersion
        {
            get;
            private set;
        }

        public static JsonSerializerSettings _jsonSettings = new JsonSerializerSettings
        {
            DefaultValueHandling = DefaultValueHandling.Populate,
            NullValueHandling = NullValueHandling.Include,
            Converters = new[]
            {
                new Newtonsoft.Json.Converters.StringEnumConverter( )
            }
        };

        static ResourceInjector( )
        {
            InvalidVersion = !ValidateVersion( );
        }

        public static bool IsHookUILoaded( )
        {
            if ( MakeHookUICompatible )
                return true;

            MakeHookUICompatible = AppDomain.CurrentDomain.GetAssemblies( )
                .Count( a => !a.IsDynamic && a.FullName.ToLowerInvariant( ).Contains( "hookuimod" ) ) > 0;
            
            return MakeHookUICompatible;
        }

        /// <summary>
        /// Inject Gooee into the HookUI index.html and index.js.
        /// </summary>
        public static void Inject( )
        {
            if ( HasInjected || InvalidVersion )
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
            _log.Info( $"Installed Gooee ({(MakeHookUICompatible ? "HOOKUI-INJECTION" : "DEFAULT-INJECTION" )})." );
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

        private static bool ValidateVersion( )
        {
            var js = File.ReadAllText( GAMEUI_INDEX_JS );

            return js.Contains( NON_HOOKUI_INJECTION_POINT.Search );
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

                    if ( toolbarAttribute?.Item != null )
                    {
                        var toolbarItem = toolbarAttribute.Item;
                        var sb = new StringBuilder( );
                        if ( toolbarItem.Children?.Length > 0 )
                        {
                            sb.Append( "[" );

                            foreach ( var toolbarChildItem in toolbarItem.Children )
                            {
                                if ( sb.Length > 1 )
                                    sb.Append( "," + Environment.NewLine );

                                sb.Append( $"{{Label:{( toolbarChildItem.Label != null ? $"\"{toolbarChildItem.Label}\"" : "null" )}, Icon:{( toolbarChildItem.Icon != null ? $"\"{toolbarChildItem.Icon}\"" : "null" )}, IconClassName:{( toolbarChildItem.IconClassName != null ? $"\"{toolbarChildItem.IconClassName}\"" : "null" )}, IsFAIcon: {toolbarChildItem.IsFAIcon.ToString( ).ToLower( )}, Method:\"{toolbarChildItem.OnClickMethod.Name}\", MethodKey:{( toolbarChildItem.OnClickKey != null ? $"\"{toolbarChildItem.OnClickKey}\"" : "null" )}}}" );
                            }
                            sb.Append( "]" );
                        }
                        else
                            sb.Append( "null" );

                        var js = $"   window.$_gooee_toolbar[\"{plugin.Name.ToLower( )}\"] = {{Name:\"{plugin.Name}\", Label:{( toolbarItem.Label != null ? $"\"{toolbarItem.Label}\"" : "null" )}, Icon:{( toolbarItem.Icon != null ? $"\"{toolbarItem.Icon}\"" : "null" )}, IconClassName:{( toolbarItem.IconClassName != null ? $"\"{toolbarItem.IconClassName}\"" : "null" )}, IsFAIcon: {toolbarItem.IsFAIcon.ToString().ToLower()}, Controller:\"{toolbarAttribute.ControllerType.Name.ToLower( ).Replace( "controller", "" )}\", Method:\"{toolbarItem.OnClickMethod.Name}\", MethodKey:{( toolbarItem.OnClickKey != null ? $"\"{toolbarItem.OnClickKey}\"" : "null" )}, Children:{sb}}};";
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

                //if ( plugin is IGooeeChangeLog clPlugin && !string.IsNullOrEmpty( clPlugin.ChangeLogResource ) )
                //{
                //    pluginChangeLogs.Add( "{ \"name\": \"" + plugin.Name + "\", \"version\": \"" + clPlugin.Version + "\", \"timestamp\": \"" + GetPluginTimeStamp( plugin.GetType().Assembly ).ToString() + "\" }" );
                //}
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
            var faZip = Path.Combine( Mod.AssemblyPath, "FA.zip" );

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
            var uiSystem = GameManager.instance.userInterface.view.uiSystem;
            
            if ( uiSystem == null )
            {
                _log.Error( "Failed to setup resource handler for Gooee." );
                return;
            }

            _log.Info( "Setup resource handler for Gooee." );
            uiSystem.AddHostLocation( UI_IDENTIFIER, MOD_PATH, false );
        }

        public static void MountResources( string uri, string path )
        {
            var uiSystem = GameManager.instance.userInterface.view.uiSystem;

            if ( uiSystem == null )
            {
                _log.Error( "Failed to setup resource handler for " + uri + "." );
                return;
            }

            _log.Info( "Setup resource handler for " + uri + "." );
            uiSystem.AddHostLocation( uri, path, false );
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

        public static FieldInfo _liveReload = typeof( UIView ).GetField( "m_LiveReload", BindingFlags.NonPublic | BindingFlags.Instance );
        public static MethodInfo _onChanged = typeof( UILiveReload ).GetMethod( "OnChanged", BindingFlags.NonPublic | BindingFlags.Instance );

        private static void OnChanged( object source, FileSystemEventArgs e )
        {
            if ( e.ChangeType != WatcherChangeTypes.Changed )
            {
                return;
            }

            if ( e.FullPath.EndsWith( ".js" ) || e.FullPath.EndsWith( ".css" ) || e.FullPath.EndsWith( ".md" ) )
            {
                var liveReload = ( UILiveReload ) _liveReload.GetValue( GameManager.instance.userInterface.view );

                if ( liveReload != null )
                {
                    // Redirect the on changed event to the internal UI so it reloads properly.
                    _onChanged.Invoke( liveReload, e.FullPath );
                }
                else
                {
                    GameManager.instance.userInterface.view.View.Reload( );
                }
                _log.Info( "Gooee reloaded the UI view." );
            }
        }
    }
}
