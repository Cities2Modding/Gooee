using HarmonyLib;
using Gooee.Injection;
using System.IO;

namespace Gooee.Patches
{
    ///// <summary>
    ///// Main HookUI postfix patch, it allows us to piggyback off of HookUI also
    ///// ensuring no friction with mods that use it.
    ///// </summary>
    //[HarmonyPatch( typeof( HookUIMod.Plugin ), "WriteFileToPath" )]
    //public static class HookUIPlugin_WriteFileToPathPatch
    //{
    //    public static void Postfix( string filePath, string destinationPath )
    //    {
    //        var fileName = Path.GetFileName( destinationPath );

    //        if ( fileName.ToLower() == "index.html" )
    //    }
    //}
}
