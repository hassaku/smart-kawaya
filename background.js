const API_URL = "https://api.spark.io/v1/devices/48ff6a065067555031111087/";
const INTERVAL = 5000;
const MOTION = 1000;      // Threshold for IR sensor
const BRIGHTNESS = 1000;  // Threshold for CDS sensor

function consoleError(devise, json) {
  console.error("connection error : " + devise);
  console.log(json);
  if(JSON.parse(json.responseText).error == "invalid_grant") {
    chrome.browserAction.setBadgeText({ text: "Token" });
  } else {
    chrome.browserAction.setBadgeText({ text: "Error" });
  }
}

function clearError() {
  chrome.browserAction.setBadgeText({ text: "" });
}

(function() {
  var checkIndex = 0;
  var valueMotion = 0;
  var valueBrightness = 0;

  setInterval(function() {
    var sensorType = (checkIndex == 0) ? "A0" : "A1";
    $.ajax({
      type: 'POST',
      url: API_URL + "analogread",
      data: {
        "access_token": localStorage["accessToken"],
        "params"      : sensorType
      },
      success: function(json) {
        clearError()
        var value = json.return_value;

        // IR sensor
        if(sensorType == "A0") {
          valueMotion = value;
          //chrome.browserAction.setBadgeText({ text: String(value) });
        // CDS sensor
        } else {
          valueBrightness = value;
          var usage = (valueMotion > MOTION) ? "use" : "vacant";
          var light = (valueBrightness > BRIGHTNESS) ? "light" : "dark";
          image = usage + "_" + light + ".png";
          chrome.browserAction.setIcon({ path: image });
        }
      },
      error: function(json) {
        consoleError(sensorType, json);
      }
    });
    checkIndex = (checkIndex + 1) % 2;
  }, INTERVAL);
}).call(this);

chrome.browserAction.onClicked.addListener(
  function knock() {
    console.log("knock");
    // on
    $.ajax({
      type: 'POST',
      url: API_URL + "analogwrite",
      data: {
        "access_token": localStorage["accessToken"],
        "params"      : "D0,20"
      },
      success: function(json) {
        var sleep =  function(time) {
          return (function() {
            var dfd = $.Deferred()
            setTimeout(function() { dfd.resolve(); }, time);
            return dfd.promise()
          })
        }
        sleep(1000);

        // off
        $.ajax({
          type: 'POST',
          url: API_URL + "analogwrite",
          data: {
            "access_token": localStorage["accessToken"],
            "params"      : "D0,0"
          },
          success: function(json) {
            clearError()
            var value = json.return_value;
          },
          error: function(json) {
            consoleError("buzzer", json);
          }
        });
      },
      error: function(json) {
        consoleError("buzzer", json);
      }
    });
  }
);
