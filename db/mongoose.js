const mongoose = require("mongoose"),
  config = require("config");
mongoose.Promise = require("bluebird");
mongoose.connect(`mongodb://localhost:${config.dbPort}/${config.dbName}`, {
    useNewUrlParser: true
});

module.exports = mongoose;
