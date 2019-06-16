import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  mainflux_pwd: {
    type: Number,
    required: true,
    trim: true,
  }
});

userSchema.plugin(timestamp);

const User = mongoose.model('User', userSchema);

export default User;
