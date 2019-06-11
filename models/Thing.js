import mongoose from 'mongoose';

const thingSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Thing = mongoose.model('Thing', thingSchema);

export default Thing;