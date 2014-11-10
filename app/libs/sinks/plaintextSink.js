var fs = require('fs');

module.exports = function (path) {

	var file;
	var space = ' ';
	var tab = '\t';
  var newLine = '\n';
  var hyphen = '-';
  var colon = ':';
  var fullStop = '.';
	
	function error(err) {
		console.log(err);
	}

  function formatDate(date){
    var day = date.getDay();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var milleSecond = date.getMilliseconds();

    return year + hyphen + month + hyphen + day + space + hour + colon + minute + colon + second + fullStop + milleSecond;
  }

	return {
		logInformation: function(message, payload, callback) {
			var log = {
				EventId: 1,
				Level: "information",
				Message: message,
				EventName: "logInformation"
			};

      var currentDate = formatDate(new Date());

      var result = 
        'Begin' + space + currentDate + space + '[1234567]' + space + '[CanalPlay_Orange]' + space + 'Home' + space + 'http://localhost/index.html'+ newLine +
        tab + space + 'Home' + space + 'http://localhost/api/1'+ newLine +
        tab + space + 'Home' + space + 'http://localhost/api/2'+ newLine +
        tab + space + 'Home' + space + 'http://localhost/api/3'+ newLine +
        'End' + newLine;
      fs.appendFile(path, result, error);

			callback();
		}
	};
};

