using Game.Settings;
using Game.SceneFlow;

namespace Gooee
{
    internal class LibrarySettings : GooeeSettings
    {
        [SettingsUIHidden]
        protected override string UIResource => "Gooee.Resources.settings.xml";

        public bool ChangeLog
        {
            get;
            set;
        }

        public bool AVal
        {
            get;
            set;
        }

        public bool BVal
        {
            get;
            set;
        }

        public bool CVal
        {
            get;
            set;
        }

        public LibrarySettings( )
        {
        }

        public override void SetDefaults( )
        {
            ChangeLog = true;
        }

        public void ShowChangeLog( )
        {
            GameManager.instance.userInterface.view.View.ExecuteScript( "engine.trigger('gooee.resetChangeLog');" );
        }
    }
}
