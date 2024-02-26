using Game.Notifications;
using Gooee.Helpers;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Reflection;

namespace Gooee.Plugins.Attributes
{
    /// <summary>
    /// Define Gooee toolbar entries that automatically execute actions in your controllers.
    /// </summary>
    [AttributeUsage( AttributeTargets.Class, AllowMultiple = false, Inherited = false )]
    public class PluginToolbarAttribute : Attribute
    {
        public Type ControllerType
        {
            get;
            private set;
        }

        internal InternalPluginToolbarItem Item
        {
            get;
            private set;
        }

        /// <summary>
        /// Setup a toolbar entry for your plugin and a method to be 
        /// triggered when it is clicked.
        /// </summary>
        /// <param name="controllerType">The controller type with the method you want to execute.</param>
        /// <param name="onClickMethod">The method in your controller to execute on click</param>
        /// <param name="label">The label to show in the menu</param>
        /// <param name="icon">The icon SVG URL</param>
        public PluginToolbarAttribute( Type controllerType, string onClickMethod, string label = null, string icon = null )
        {
            ControllerType = controllerType;
            Item = new InternalPluginToolbarItem
            {
                OnClickMethod = controllerType.GetMethod( onClickMethod, BindingFlags.Instance | BindingFlags.NonPublic ),
                Label = label,
                Icon = icon,
                IsFAIcon = false
            };
        }

        /// <summary>
        /// Setup a toolbar entry for your plugin and a method to be 
        /// triggered when it is clicked.
        /// </summary>
        /// <param name="controllerType">The controller type with the method you want to execute.</param>
        /// <param name="jsonResource">The embedded resource path for the JSON data</param>
        public PluginToolbarAttribute( Type controllerType, string jsonResource )
        {
            ControllerType = controllerType;

            var json = EmbeddedResource.LoadText( jsonResource, controllerType.Assembly );

            if ( string.IsNullOrEmpty( json ) )
                throw new InvalidOperationException( "Specify the correct JSON schema for your Gooee toolbar." );
            
            var item = JsonConvert.DeserializeObject<PluginToolbarItem>( json );

            if ( item == null )
                throw new InvalidOperationException( "Unable to serialize JSON for Gooee toolbar item" );

            Item = new InternalPluginToolbarItem
            {
                OnClickMethod = controllerType.GetMethod( item.OnClick, BindingFlags.Instance | BindingFlags.NonPublic ),
                OnGetChildren = string.IsNullOrEmpty( item.OnGetChildren ) ? null : controllerType.GetMethod( item.OnGetChildren, BindingFlags.Instance | BindingFlags.NonPublic ),
                OnClickKey = item.OnClickKey,
                Label = item.Label,
                Icon = item.Icon,
                IconClassName = item.IconClassName,
                IsFAIcon = item.IsFAIcon
            };

            if ( item.Children?.Length > 0 )
            {
                Item.Children = item.Children.Select( c => new InternalPluginToolbarItem
                {
                    OnClickMethod = controllerType.GetMethod( c.OnClick, BindingFlags.Instance | BindingFlags.NonPublic ),
                    OnClickKey = c.OnClickKey,
                    Label = c.Label,
                    Icon = c.Icon,
                    IconClassName = c.IconClassName,
                    IsFAIcon = c.IsFAIcon
                } ).ToArray( );
            }
        }
    }

    internal class InternalPluginToolbarItem
    {
        public MethodInfo OnClickMethod
        {
            get;
            set;
        }

        public string OnClickKey
        {
            get;
            set;
        }

        public MethodInfo OnGetChildren
        {
            get;
            set;
        }

        public string Label
        {
            get;
            set;
        }

        public string Icon
        {
            get;
            set;
        }

        public bool IsFAIcon
        {
            get;
            set;
        }

        public string IconClassName
        {
            get;
            set;
        }

        public InternalPluginToolbarItem[] Children
        {
            get;
            set;
        }
    }

    internal class PluginToolbarItem
    {
        /// <summary>
        /// The label to show in the menu
        /// </summary>
        public string Label
        {
            get;
            set;
        }

        /// <summary>
        /// The icon SVG URL or Font awesome CSS class name
        /// </summary>
        public string Icon
        {
            get;
            set;
        }

        /// <summary>
        /// Is it a FontAwesome icon name?
        /// </summary>
        public bool IsFAIcon
        {
            get;
            set;
        }

        /// <summary>
        /// If a mask icon or FontAwesome icon, specify a CSS class
        /// that applies a background color.
        /// </summary>
        public string IconClassName
        {
            get;
            set;
        }

        /// <summary>
        /// The method in your controller to execute on click
        /// </summary>
        public string OnClick
        {
            get;
            set;
        }

        /// <summary>
        /// If specified, a string parameter with this value will be passed
        /// to the invoked click method.
        /// </summary>
        public string OnClickKey
        {
            get;
            set;
        }

        /// <summary>
        /// The child toolbar items to show in the dropdown menu sub-menu.
        /// </summary>
        public PluginToolbarChildItem[] Children
        {
            get;
            set;
        }

        /// <summary>
        /// Method in controller used to get dynamic child items.
        /// </summary>
        public string OnGetChildren
        {
            get;
            set;
        }
    }

    /// <summary>
    /// A child item of a toolbar, used for sub-menus.
    /// </summary>
    public class PluginToolbarChildItem
    {
        /// <summary>
        /// The label to show in the menu
        /// </summary>
        public string Label
        {
            get;
            set;
        }

        /// <summary>
        /// The icon SVG URL or Font awesome CSS class name
        /// </summary>
        public string Icon
        {
            get;
            set;
        }

        /// <summary>
        /// Is it a FontAwesome icon name?
        /// </summary>
        public bool IsFAIcon
        {
            get;
            set;
        }

        /// <summary>
        /// If a mask icon or FontAwesome icon, specify a CSS class
        /// that applies a background color.
        /// </summary>
        public string IconClassName
        {
            get;
            set;
        }

        /// <summary>
        /// The method in your controller to execute on click
        /// </summary>
        public string OnClick
        {
            get;
            set;
        }

        /// <summary>
        /// If specified, a string parameter with this value will be passed
        /// to the invoked click method.
        /// </summary>
        public string OnClickKey
        {
            get;
            set;
        }
    }
}
