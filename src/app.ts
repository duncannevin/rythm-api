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
import * as expressJwt from 'express-jwt';
import * as swaggerUI from 'swagger-ui-express';
import * as swaggerDocument from '../swagger.json';
import { RRouter } from './routes';
import * as log4js from 'log4js';
import * as passport from 'passport';
import * as favicon from 'serve-favicon';
import * as path from 'path';
import * as cors from 'cors';

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({path: '.env'});

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, {useMongoClient: true})
  .then(() => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    console.log('MongoDB connected on ' + mongoUrl);
  })
  .catch(err => {
    console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
    // process.exit();
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
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true));
app.use(passport.initialize());
app.use(passport.session());

app.use(favicon(path.join(__dirname, '../static', 'icon.png')));
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

module.exports = app;