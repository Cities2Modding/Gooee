using System;

namespace Gooee.Plugins.Attributes
{
    [AttributeUsage( AttributeTargets.Class, AllowMultiple = false, Inherited = false )]
    public class ControllerTypeAttribute<TController> : Attribute
        where TController : IController
    {
    }

    [AttributeUsage( AttributeTargets.Class, AllowMultiple = false, Inherited = false )]
    public class ControllerTypesAttribute : Attribute
    {
        public Type[] Types
        {
            get;
            private set;
        }

        public ControllerTypesAttribute( params Type[] types )
        {
            Types = types;
        }
    }
}
