import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const deviceSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    required: true,
    trim: true,
  },
  date: new Date("<YYYY-mm-ddTHH:MM>"),
});

deviceSchema.plugin(timestamp);

const Device = mongoose.model('Device', deviceSchema);

export default Device;