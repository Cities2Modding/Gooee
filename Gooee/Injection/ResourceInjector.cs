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

namespace Gooee.Injection
{
    internal class ResourceInjector
    {
        const string UI_IDENTIFIER = "gooeeui";
        const string URL_PREFIX = $"coui://{UI_IDENTIFIER}/";

        static readonly string ASSEMBLY_PATH = Path.GetDirectoryName( Assembly.GetExecutingAssembly( ).Location );
        static readonly string MOD_PATH = Path.Combine( Application.persistentDataPath, "Mods", "Gooee" );
        static readonly string PLUGIN_PATH = Path.Combine( MOD_PATH, "Plugins" );

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
            ("(0,e.jsx)(HEe,{})]", "(0,e.jsx)(HEe,{}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'bottom-right-toolbar'})]"),
            ("(0,e.jsx)(window._$hookui_menu,{react:i})", "(0,e.jsx)(window._$hookui_menu,{react:i}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-left-toolbar'})"),
            ("className:oge.pauseMenuLayout,children:[R&&(0,e.jsx)", "className:oge.pauseMenuLayout,children:[(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'top-right-toolbar'}),R&&(0,e.jsx)"),
            ("(0,e.jsx)(vEe,{})]", "(0,e.jsx)(vEe,{}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'bottom-left-toolbar'})]"),

            ("(0,e.jsx)(xTe,{focusKey:QSe.toolbar})", "(0,e.jsx)(xTe,{focusKey:QSe.toolbar}),(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'default'})"),
            ("]}),(0,e.jsx)(xTe,{focusKey:QSe.toolbar})", ",(0,e.jsx)(window.$_gooee.container,{react:i,pluginType:'main-container'})]}),(0,e.jsx)(xTe,{focusKey:QSe.toolbar})"),
        };

        /// <summary>
        /// Inject Gooee into the HookUI index.html and index.js.
        /// </summary>
        public static void Inject( )
        {
            if ( !Directory.Exists( HOOKUI_PATH ) )
            {
                UnityEngine.Debug.Log( "No HookUI folder found!" );
                return;
            }

            UnityEngine.Debug.Log( "Saving Gooee resources!" );
            SaveResources( );

            UnityEngine.Debug.Log( "Loading Gooee plugins!" );
            PluginLoader.Load( );

            UnityEngine.Debug.Log( "Injecting Gooee js!" );
            InjectJS( );
            UnityEngine.Debug.Log( "Injecting Gooee html!" );
            InjectHTML( );

            SetupFileWatcher( );
            UnityEngine.Debug.Log( "Installed Gooee!" );
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
            foreach ( var plugin in PluginLoader.Plugins.Values )
            {
                if ( !string.IsNullOrEmpty( plugin.ScriptResource ) )
                {
                    var scriptFileName = plugin.Name + Path.GetExtension( plugin.ScriptResource );
                    var newScript = $"    <script src=\"{URL_PREFIX}Plugins/{scriptFileName}\"></script>";
                    scriptBuilder.AppendLine( newScript );
                }

                if ( !string.IsNullOrEmpty( plugin.StyleResource ) )
                {
                    var styleFileName = plugin.Name + Path.GetExtension( plugin.StyleResource );
                    var newStyle = $"    <link href=\"{URL_PREFIX}Plugins/{styleFileName}\" rel=\"stylesheet\"/>";
                    styleBuilder.AppendLine( newStyle );
                }
            }
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
                UnityEngine.Debug.LogError( $"Failed to load resource: {resourceName}" );
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
                UnityEngine.Debug.LogError( $"Failed to load resource: {resourceName}" );
                // Error
                return;
            }

            var extension = Path.GetExtension( resourceName );

            File.WriteAllText( Path.Combine( PLUGIN_PATH, pluginName + extension ), contents );
        }

        /// <summary>
        /// Ensure the UI resource handler is setup
        /// </summary>
        public static void SetupResourceHandler( )
        {
            var resourceHandler = ( GameUIResourceHandler ) GameManager.instance.userInterface.view.uiSystem.resourceHandler;

            if ( resourceHandler == null || resourceHandler.HostLocationsMap.ContainsKey( UI_IDENTIFIER ) )
            {
                UnityEngine.Debug.Log( "Failed to setup resource handler for Gooee." );
                return;
            }

            UnityEngine.Debug.Log( "Setup resource handler for Gooee." );
            resourceHandler.HostLocationsMap.Add( UI_IDENTIFIER, new List<string> { MOD_PATH } );
        }

        private static void SetupFileWatcher( )
        {
            FileSystemWatcher watcher = new FileSystemWatcher
            {
                Path = MOD_PATH,
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName,
                Filter = "*.*"
            };

            watcher.Changed += OnChanged;
            watcher.Created += OnChanged;
            watcher.EnableRaisingEvents = true;
        }

        static FieldInfo _liveReload = typeof( UIView ).GetField( "m_LiveReload", BindingFlags.NonPublic | BindingFlags.Instance );
        static MethodInfo _onChanged = typeof( UILiveReload ).GetMethod( "OnChanged", BindingFlags.NonPublic | BindingFlags.Instance );

        private static void OnChanged( object source, FileSystemEventArgs e )
        {
            if ( e.ChangeType != WatcherChangeTypes.Changed )
            {
                return;
            }

            if ( e.FullPath.EndsWith( ".js" ) || e.FullPath.EndsWith( ".css" ) )
            {
                var liveReload = ( UILiveReload ) _liveReload.GetValue( GameManager.instance.userInterface.view );

                // Redirect the on changed event to the internal UI so it reloads properly.
                _onChanged.Invoke( liveReload, e.FullPath );

                UnityEngine.Debug.Log( "Gooee reloaded the UI view." );
            }
        }
    }
}
