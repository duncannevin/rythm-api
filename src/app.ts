import 'reflect-metadata';
import './di.handler';
import * as express from 'express';
import * as compression from 'compression';  // compresses requests
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as lusca from 'lusca';
import * as dotenv from 'dotenv';
import * as mongo from 'connect-mongo';
import * as mongoose from 'mongoose';
import * as expressValidator from 'express-validator';
import * as bluebird from 'bluebird';
import * as swaggerUI from 'swagger-ui-express';
import * as swaggerDocument from '../swagger.json';
import { RRouter } from './routes';
import * as log4js from 'log4js';
import * as passport from 'passport';
import * as cors from 'cors';
import * as path from 'path';
import { configure } from 'log4js';
import { mongoLogger, shutdownLogger, startupLogger, devLogger } from './utils/loggers.utl';

const MongoStore = mongo(session);

configure(path.resolve('log4js.json'));

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({path: '.env'});

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = compileMongoUrl();

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (<any>mongoose).Promise = bluebird;
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useCreateIndex', true);
  mongoose.connect(mongoUrl)
    .then(() => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
      mongoLogger.info('connected');
      next();
    })
    .catch(err => {
      mongoLogger.error('connection error. Please make sure MongoDB is running. ' + err);
      process.exit();
    });
});

// Express configuration
app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  }),
  unset: 'destroy'
}));
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(passport.initialize());
app.use(passport.session());

let connections = [];

app.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

app.use(cors());

// express routes
const router = new RRouter();
app.use('/auth', router.authRouter);
app.use('/users', router.userRouter);
app.use('/todo', router.todoRouter);

/**
 * Add swagger endpoints
 */
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use('/api/v1', router.swaggerRouter);

app.use((req: express.Request, resp: express.Response) => {
  resp.status(404).send({
    msg: 'Not Found!'
  });
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

declare const module: any;

const server = app.listen(app.get('port'), startup);

module.exports = app;

function startup () {
  const runningMsg: string = `Rythm is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`;
  startupLogger.info(runningMsg);
  if (app.get('env') === 'development') {
    devLogger.info(runningMsg);
    devLogger.info('Press CTRL-C to stop');
    if (module.hot) {
      devLogger.info('Hot module replacement enabled');
      module.hot.accept();
      module.hot.dispose(() => server.close());
    }
  } else {
    startupLogger.info('starting production application');
  }
}

function shutdown () {
  shutdownLogger.info('Received kill signal, shutting down gracefully');
  server.close(() => {
    shutdownLogger.info('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    shutdownLogger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000)
}

function compileMongoUrl (): string {
  const USER = process.env.MONGODB_USER;
  const PASS = process.env.MONGODB_PASS;
  return process.env.MONGODB_URI
    .replace('<user>', USER)
    .replace('<password>', PASS);
}
