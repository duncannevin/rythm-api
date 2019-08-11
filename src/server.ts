import { configure, getLogger } from 'log4js';
import * as errorHandler from 'errorhandler';
import { startupLog } from './utils/loggers.utl';

const app = require('./app');

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());
configure('./src/config/log4js.json');

declare const module: any;

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  const runningMsg: string = `Rythm is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`;
  startupLog.info(runningMsg);
  if (app.get('env') === 'development') {
    console.log('[DEV]', runningMsg);
    console.log('[DEV]', 'Press CTRL-C to stop');
    if (module.hot) {
      console.log('[DEV]', 'Hot module replacement enabled');
      module.hot.accept();
      module.hot.dispose(() => server.close());
    }
  }
});
