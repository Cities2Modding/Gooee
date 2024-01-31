
namespace Gooee.Plugins
{
    /// <summary>
    /// Core model class interface (Following MVC pattern)
    /// </summary>
    public interface IModel
    {
        IController Controller
        {
            get; 
        }
    }
}
