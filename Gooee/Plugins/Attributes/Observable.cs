
using System;

namespace Gooee.Plugins.Attributes
{
    [AttributeUsage( AttributeTargets.Property, AllowMultiple = false, Inherited = true )]
    public class ObservableAttribute : Attribute
    {
    }
}
