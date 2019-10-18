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
    required: false,
    trim: true,
  },
  latitude: {
    type: String,
    required: false,
    trim: true,
  },
  longitude: {
    type: String,
    required: false,
    trim: true,
  },
  alerttext: {
    type: String,
    required: false,
  },
  alertvalue: {
    type: String,
    required: false,
    trim: true,
  },
  assettext: {
    type: String,
    required: false,
  },
  assetvalue: {
    type: String,
    required: false,
    trim: true,
  },
  messagetext: {
    type: String,
    required: false,
  },
});

deviceSchema.plugin(timestamp);

const Device = mongoose.model('Device', deviceSchema);

export default Device;