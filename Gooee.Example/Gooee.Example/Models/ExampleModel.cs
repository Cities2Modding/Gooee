using Gooee.Plugins;

namespace Gooee.Example.Models
{
    public class ExampleModel : Model
    {
        public bool IsVisible
        {
            get;
            set;
        }

        public string Message
        {
            get;
            set;
        } = "Hello, world!";
    }
}
