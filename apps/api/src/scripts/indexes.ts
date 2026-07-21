import 'dotenv/config';
import mongoose from 'mongoose';
import { loadEnv } from '../config/env.js';
import '../models/index.js';

const env = loadEnv();
await mongoose.connect(env.MONGODB_URI, { autoIndex: false });
for (const name of mongoose.modelNames()) {
  await mongoose.model(name).syncIndexes();
  process.stdout.write(`Indexes synchronized: ${name}\n`);
}
await mongoose.disconnect();
