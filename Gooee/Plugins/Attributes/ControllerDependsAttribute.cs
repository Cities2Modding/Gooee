using Game;
using System;

namespace Gooee.Plugins.Attributes
{
    [AttributeUsage( AttributeTargets.Class, AllowMultiple = true, Inherited = false )]
    public class ControllerDependsAttribute : Attribute
    {
        public SystemUpdatePhase UpdatePhase
        {
            get;
            private set;
        }

        public Type Type
        {
            get;
            private set;
        }

        public ControllerDependsAttribute( SystemUpdatePhase updatePhase, Type type )
        {
            UpdatePhase = updatePhase;
            Type = type;
        }
    }
}
