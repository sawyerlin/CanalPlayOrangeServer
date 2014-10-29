var Log = require("../models/log.js")
module.exports = function() {

	function createLog() {
		var log = new Log();
		log.Timestamp = new Date();
		return log
	}

	return {
		logInformation: function(message, payload, callback) {
      var eventId = 1;
      var level = "information";
      var eventName = "logInformation";
      var log = createLog();

      log.EventId = eventId;
      log.Level = level;
      log.Message = message;
      log.Payload = payload;
      log.EventName = eventName;

      log.save(callback);
		}
	};
};
