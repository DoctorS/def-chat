const crypto = require("crypto"),
  mongoose = require("./mongoose"),
  Schema = mongoose.Schema,
  schema = new Schema({
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 2083
    },
    username: {
        type:String,
        default:''
    },
    hashedPassword: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    token: {
        type:String,
        default:''
    },
    apiToken: {
        type:String,
        default:''
    },
    emailVerif: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {}
    },
    info: {
      type: Schema.Types.Mixed,
      default: {
        ip: null,
        country: null,
        region: null,
        city: null,
        lat: null,
        long: null,
        dt: null,
        userAgent: null
      }
    },
    p: {
      type: Schema.Types.ObjectId
    },
    role: {
      type: Number,
      default: 0
    },
    reward: {
      type: Number,
      default: 0
    },
    balance: {
      type: Number,
      default: 0
    }
  });

schema.methods.encryptPassword = function(password) {
  return crypto
    .createHmac("sha1", this.salt)
    .update(password)
    .digest("hex");
};

schema
  .virtual("password")
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + "";
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._plainPassword;
  });

schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

exports.User = mongoose.model("User", schema);
