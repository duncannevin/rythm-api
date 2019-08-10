import { configure, getLogger } from 'log4js';
import * as errorHandler from 'errorhandler';
import { startupLog } from './utils/loggers.utl';

const app = require('./app');

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
configure('./src/config/log4js.json');

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  const runningMsg: string = `App is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`;
  startupLog.info(runningMsg);
  if (app.get('env') === 'development') {
    console.log(runningMsg);
    console.log('  Press CTRL-C to stop\n');
  }
});
