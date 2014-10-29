var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var LogSchema = new Schema({
	EventId: Number,
  Level: String,
  Message: String,
  Payload: {},
  EventName: String,
  Timestamp: Date
});

module.exports = mongoose.model("log", LogSchema);
