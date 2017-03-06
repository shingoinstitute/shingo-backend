var winston = require('winston')
var path = require('path');

/**
 * A wrapper for the winston logger
 * @param log_level :: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }. If empty the env var LOG_LEVEL will be checked. Defaults to debug.
 * @param log_file :: The path to a general log file. If empty the env var LOG_FILE will be checked. Defaults to 'logs/info.log' (requires logs dir to exist).
 * @param log_error_file :: Similar to log_file execpt it only logs errors.
 * @member logger :: the actual logger to use. Reference https://github.com/winstonjs/winston#instantiating-your-own-logger.
 */
function Logger(log_level, log_path, log_file){
    this.log_level = log_level || process.env.LOG_LEVEL || 'debug';
    this.log_path = log_path || process.env.LOG_PATH || 'logs';
    this.log_file = log_file || process.env.LOG_FILE || 'info.log';

    this.logger = new (winston.Logger)({
        level: this.log_level,
        levels: winston.config.npm.levels,
        colors: winston.config.npm.colors,
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                prettyPrint: true,
                timestamp: true
            }),
            new (winston.transports.File)({ 
                name: 'info-log',
                filename: path.normalize(path.join(this.log_path, this.log_file)),
                level: this.log_level,
                colorize: false,
                prettyPrint: false,
                timestamp: true,
                tailable: true,
                json: true
            })
        ],
        exitOnError: false
    });
}

module.exports = Logger;