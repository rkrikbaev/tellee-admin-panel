import mongoose from 'mongoose';
require('dotenv').config();

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

mongoose.Promise = global.Promise;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export { connectDb };
