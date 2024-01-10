using System;

namespace Gooee.Plugins.Attributes
{
    [AttributeUsage( AttributeTargets.Method, AllowMultiple = false, Inherited = true )]
    public class OnTriggerAttribute : Attribute
    {
    }
}
