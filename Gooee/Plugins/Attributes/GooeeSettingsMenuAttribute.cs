using System;

namespace Gooee.Plugins.Attributes
{
    [AttributeUsage( AttributeTargets.Class, AllowMultiple = false, Inherited = false )]
    public class GooeeSettingsMenuAttribute : Attribute
    {
        public Type Type
        {
            get;
            private set;
        }

        public GooeeSettingsMenuAttribute( Type type )
        {
            Type = type;
        }
    }
}
