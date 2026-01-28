import * as mongoose from 'mongoose';
import * as process from 'node:process';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> => mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnhub'),
  },
];
