using Game.Tools;
using Gooee.Plugins.Attributes;
using Gooee.Plugins;
using Unity.Entities;
using System;
using Gooee.Example.Models;

namespace Gooee.Example.UI
{
    public partial class ExampleController : Controller<ExampleModel>
    {
        public override ExampleModel Configure( )
        {
            return new ExampleModel( );
        }

        [OnTrigger]
        private void OnTestClick( )
        {
            Model.Message = "An amended message! " + DateTime.Now;
            TriggerUpdate( );
        }

        [OnTrigger]
        private void OnToggleVisible( )
        {
            Model.IsVisible = false;
            TriggerUpdate( );
        }
    }
}
