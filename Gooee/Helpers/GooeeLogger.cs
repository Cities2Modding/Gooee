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
        }

        public void Trace( string message )
        {
            _gameLog.Trace( message );
        }

        public void Info( string message )
        {
            _gameLog.Info( message );
        }

        public void Debug( string message )
        {
            _gameLog.Debug( message );
        }

        public void Warning( string message )
        {
            _gameLog.Warn( message );
            // Will already propagate to console
        }

        public void Warning( Exception exception )
        {
            _gameLog.Warn( exception );
            // Will already propagate to console
        }

        public void Error( string message )
        {
            _gameLog.Error( message );
            // Will already propagate to console
        }

        public void Error( Exception exception )
        {
            _gameLog.Error( exception );
            // Will already propagate to console
        }
    }
}
