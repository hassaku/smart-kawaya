const API_URL = "https://api.spark.io/v1/devices/48ff6a065067555031111087/";
const ACCESS_TOKEN= "f10fbbd51f64f0a7b6e106726d00d4184e94bf5e";
const INTERVAL = 1000;

function consoleError(devise, json) {
  console.error("connection error : " + devise);
  console.log(json);
}

(function() {
  var checkIndex = 0;
  var valueTarget = 0;
  var valueRoom = 0;

  setInterval(function() {
    var sensorType = (checkIndex == 0) ? "A0" : "A1";
    $.ajax({
      type: 'POST',
      url: API_URL + "analogread",
      data: {
        "access_token": ACCESS_TOKEN,
        "params"      : sensorType
      },
      success: function(json) {
        var value = json.return_value;

        // IR sensor
        if(sensorType == "A0") {
          valueTarget = value;
          //chrome.browserAction.setBadgeText({ text: String(value) });
        // CDS sensor
        } else {
          valueRoom = value;
          var usage = (valueTarget > 1000) ? "use" : "vacant";
          var light = (valueRoom > 1000) ? "light" : "dark";
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
        "access_token": ACCESS_TOKEN,
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
        sleep(INTERVAL);

        // off
        $.ajax({
          type: 'POST',
          url: API_URL + "analogwrite",
          data: {
            "access_token": ACCESS_TOKEN,
            "params"      : "D0,0"
          },
          success: function(json) {
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
