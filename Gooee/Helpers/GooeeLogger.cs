using BepInEx.Logging;
using Colossal.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Gooee.Helpers
{
    public class GooeeLogger
    {
        private static Dictionary<string, GooeeLogger> _loggers = new Dictionary<string, GooeeLogger>( );
        
        protected readonly ILog _gameLog;
        protected readonly ManualLogSource _bepInEx;

        public static GooeeLogger Get( string name )
        {
            if ( _loggers.ContainsKey( name ) )
                return _loggers[name];

            var logger = new GooeeLogger( name );
            _loggers[name] = logger;
            return logger;
        }

        internal GooeeLogger( string name )
        {
            _gameLog = LogManager.GetLogger( name );
            _bepInEx = ( ManualLogSource ) BepInEx.Logging.Logger.Sources.FirstOrDefault( s => s.SourceName == name );
        }

        public void Trace( string message )
        {
            _gameLog.Trace( message );
            _bepInEx.LogInfo( message ); // No Trace?
        }

        public void Info( string message )
        {
            _gameLog.Info( message );
            _bepInEx.LogInfo( message );
        }

        public void Debug( string message )
        {
            _gameLog.Debug( message );
            _bepInEx.LogDebug( message );
        }

        public void Warning( string message )
        {
            _gameLog.Warn( message );
            _bepInEx.LogWarning( message );
        }

        public void Warning( Exception exception )
        {
            _gameLog.Warn( exception );
            _bepInEx.LogWarning( exception );
        }

        public void Error( string message )
        {
            _gameLog.Error( message );
            _bepInEx.LogError( message );
        }

        public void Error( Exception exception )
        {
            _gameLog.Error( exception );
            _bepInEx.LogError( exception );
        }
    }
}
