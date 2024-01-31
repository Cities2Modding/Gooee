namespace Gooee.Plugins
{
    public interface IController
    {
        IGooeePlugin Plugin
        {
            get;
        }

        void OnLoaded( );
    }
}
