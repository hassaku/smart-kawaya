(function() {
  var checkIndex = 0;
  var valueTarget = 0;
  var valueRoom = 0;

  setInterval(function() {
    var sensorType = (checkIndex == 0) ? "A0" : "A1";
    $.ajax({
      type: 'POST',
      url: "https://api.spark.io/v1/devices/48ff6a065067555031111087/analogread",
      data: {
        "access_token": "c4962c1e9f738e41bd7e41d5e80f4768a3a94708",
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
        console.log("connection error : " + sensorType);
        console.log(json);
      }
    });
    checkIndex = (checkIndex + 1) % 2;
  }, 1000);
}).call(this);

chrome.browserAction.onClicked.addListener(
  function knock() {
    console.log("knock");
    // on
    $.ajax({
      type: 'POST',
      url: "https://api.spark.io/v1/devices/48ff6a065067555031111087/analogwrite",
      data: {
        "access_token": "c4962c1e9f738e41bd7e41d5e80f4768a3a94708",
        "params"      : "D0,20"
      },
      success: function(json) {
        var wait_time =  function(time) {
          return (function() {
            var dfd = $.Deferred()
            setTimeout(function() { dfd.resolve(); }, time);
            return dfd.promise()
          })
        }
        wait_time(1000);

        // off
        $.ajax({
          type: 'POST',
          url: "https://api.spark.io/v1/devices/48ff6a065067555031111087/analogwrite",
          data: {
            "access_token": "c4962c1e9f738e41bd7e41d5e80f4768a3a94708",
            "params"      : "D0,0"
          },
          success: function(json) {
            var value = json.return_value;
          },
          error: function(json) {
            console.log("connection error : buzzer");
            console.log(json);
          }
        });
      },
      error: function(json) {
        console.log("connection error : buzzer");
        console.log(json);
      }
    });
  }
);
