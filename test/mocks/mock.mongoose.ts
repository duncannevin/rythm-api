import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

(<any>mongoose).Promise = bluebird;

export async function mockMongoose (): Promise<void> {
  const mongoServer = new MongoMemoryServer();

  const mongoUri = await mongoServer.getConnectionString(true);

  mongoose.connect.bind(mongoose)(mongoUri, { useNewUrlParser: true });

  mongoose.connection.on('error', e => {
    if (e.message.code === 'ETIMEDOUT') {
      console.error(e);
    } else {
      throw e;
    }
  });

  mongoose.connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });

  mongoose.connection.once('disconnected', () => {
    console.log('MongoDB disconnected!');
    mongoServer.stop();
  });
};
