using System;
using System.Reflection;

namespace Gooee.Plugins.Attributes
{
    [AttributeUsage( AttributeTargets.Class, AllowMultiple = false, Inherited = false )]
    public class PluginToolbarAttribute : Attribute
    {
        public MethodInfo OnClickMethod
        {
            get;
            private set;
        }

        public Type ControllerType
        {
            get;
            private set;
        }

        public string Label
        {
            get;
            private set;
        }

        public string Icon
        {
            get;
            private set;
        }

        /// <summary>
        /// Setup a toolbar entry for your plugin and a method to be 
        /// triggered when it is clicked.
        /// </summary>
        /// <param name="controllerType"></param>
        /// <param name="onClickMethod"></param>
        /// <param name="label"></param>
        /// <param name="icon"></param>
        public PluginToolbarAttribute( Type controllerType, string onClickMethod, string label = null, string icon = null )
        {
            ControllerType = controllerType;
            OnClickMethod = controllerType.GetMethod( onClickMethod, BindingFlags.Instance | BindingFlags.NonPublic );
            Label = label;
            Icon = icon;
        }
    }
}
