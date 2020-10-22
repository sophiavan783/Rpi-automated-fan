var sendata = {
  automation: "",
  temperature: 0,
};

function automateFan() {
  var onCheckbox = document.getElementById("oncheck");
  if (onCheckbox.checked) {
    localStorage.setItem("Automation", "Yes");
    sendata["automation"] = "start";
    message = new Paho.MQTT.Message(JSON.stringify(sendata));
    message.destinationName = "tempdata/sophiaautomation";
    client.send(message);
  } else {
    localStorage.setItem("Automation", "No");
    sendata["automation"] = "stop";
    message = new Paho.MQTT.Message(JSON.stringify(sendata));
    message.destinationName = "tempdata/sophiaautomation";
    client.send(message);
  }
}
var chart;

// called when a message arrives
function onMessageArrived(message) {
  data = JSON.parse(message.payloadString);
  const [date, value] = [data.datetime, data.temperature];
  document.getElementById("current-temperature").innerHTML = data.temperature;
  const point = [new Date(date).getTime(), value];
  const series = chart.series[0],
    shift = series.data.length > 20;
  chart.series[0].addPoint(point, true, shift);
}

$(document).ready(function () {
  chart = new Highcharts.Chart({
    chart: {
      renderTo: "temperature-graph",
      defaultSeriesType: "spline",
    },
    title: {
      text: "Live Temperature Graph",
    },
    xAxis: {
      type: "datetime",
      tickPixelInterval: 150,
      maxZoom: 20 * 1000,
    },
    yAxis: {
      minPadding: 0.2,
      maxPadding: 0.2,
      title: {
        text: "Value",
        margin: 80,
      },
    },
    series: [
      {
        name: "Temperature",
        data: [],
      },
    ],
  });
});

window.onload = function () {
  // Create a client instance
  client = new Paho.MQTT.Client("broker.hivemq.com", Number(8000), "client123");

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  // connect the client
  client.connect({ onSuccess: onConnect });

  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe("tempdata/sophia");
    automateFan();
  }
  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }

  const item = localStorage.getItem("Automation");
  if (item === "Yes") {
    sendata["automation"] = "start";
    document.getElementById("oncheck").checked = true;
  } else {
    sendata["automation"] = "stop";
    document.getElementById("oncheck").checked = false;
  }

  var changeTemp = document.getElementById("threshold");
  const tempstore = localStorage.getItem("Temperature");
  if (tempstore) {
    document.getElementById("threshold").value = tempstore;
    sendata["temperature"] = tempstore;
  }
  changeTemp.addEventListener("change", function (e) {
    localStorage.setItem("Temperature", e.target.value);
    sendata["temperature"] = e.target.value;
    message = new Paho.MQTT.Message(JSON.stringify(sendata));
    message.destinationName = "tempdata/sophiaautomation";
    client.send(message);
  });
};
