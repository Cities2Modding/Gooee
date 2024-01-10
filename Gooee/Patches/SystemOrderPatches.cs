using Game.Common;
using Game;
using HarmonyLib;
using Gooee.Systems;

namespace Gooee.Patches
{
    [HarmonyPatch( typeof( SystemOrder ) )]
    public static class SystemOrderPatch
    {
        [HarmonyPatch( "Initialize" )]
        [HarmonyPostfix]
        public static void Postfix( UpdateSystem updateSystem )
        {            
            updateSystem.UpdateAt<GooeeUISystem>( SystemUpdatePhase.UIUpdate );
        }
    }
}
