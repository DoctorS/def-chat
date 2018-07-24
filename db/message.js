const mongoose = require('./mongoose'),
  Schema = mongoose.Schema,
  schema = new Schema({
    region: {
      type: String,
      required: true
    },
    room: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true
    },
    created: {
      type: Number,
      default: Date.now
    }
  })

exports.Message = mongoose.model('Message', schema)
