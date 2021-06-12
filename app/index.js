import clock from "clock";
import document from "document";
import { display } from "display";
import {me} from "appbit"
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import { today } from "user-activity";

// Tick every second
clock.granularity = "seconds";

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");
let mainDial = document.getElementById("dial");
let clockNums = document.getElementById("clockNumbers");
let gradientBg = document.getElementById("gradientBG");
let iconHRM = document.getElementById("iconHRM");
let txtHRM = document.getElementById("txtHRM");
let hRMcontainer = document.getElementById("heart-container");
let iconSteps = document.getElementById("iconSteps");
let txtSteps = document.getElementById("txtSteps");
let stepscontainer = document.getElementById("step-container");
let dateText = document.getElementById("dateId");
let monText = document.getElementById("monthId");
let dateContainer = document.getElementById("date-container");

let watchID, hrm;
let lastReading = 0;
let heartRate;


function activityCallback(data) {
  txtSteps.text = `${data.steps.pretty}`;
  iconSteps.animate("highlight");
}

function getDeniedStats() {
  return {
    raw: 0,
    pretty: "Denied"
  }
}

function getSteps() {
  let val = (today.adjusted.steps || 0);
  return {
    raw: val,
    pretty: val > 999 ? Math.floor(val/1000) + "," + ("00"+(val%1000)).slice(-3) : val
  }
}
let activityData = () => {
  return {  
    steps: getSteps(),
  };  
}

if (me.permissions.granted("access_activity")) {

} else {
  console.log("Denied User Activity permission");
  activityCallback({
    steps: getDeniedStats(),
  });
}

function hrmCallback(data) {
  txtHRM.text = `${data.bpm}`;
    if (data.bpm !== "--") {
    iconHRM.animate("highlight");
  }
}

function start() {
  if (!watchID) {
    hrm.start();
    getReading();
    watchID = setInterval(getReading, 1000);
  }
}

function stop() {
  hrm.stop();
  clearInterval(watchID);
  watchID = null;
}

function getReading() {
  if (hrm.timestamp === lastReading) {
    heartRate = "--";
  } else {
    heartRate = hrm.heartRate;
  }
  lastReading = hrm.timestamp;
  hrmCallback({
    bpm: heartRate,
    zone: user.heartRateZone(hrm.heartRate || 0),
    restingHeartRate: user.restingHeartRate
  });
}

if (HeartRateSensor && me.permissions.granted("access_heart_rate") && me.permissions.granted("access_user_profile")) {
  hrmCallback = hrmCallback;
  hrm = new HeartRateSensor();
  start();
  lastReading = hrm.timestamp;
} else {
  console.log("Denied Heart Rate or User Profile permissions");
  callback({
    bpm: "???",
    zone: "denied",
    restingHeartRate: "???"
  });
}


let tmpAngle = -90;
let names = ["6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5"];

// for (let i = 3; i <= 12; i+=3) {
//   // get the testbox
//   let c = document.getElementById(`text-${i}`);

//   // 110 is the distance from the center (150,150) that the text will be placed on
//   // the smaller the number, the closed the textboxes will be to the center dot.
//   let a = rotatePoint({ x: 168, y: 168 }, { x: 0, y: 130 }, tmpAngle);

//   // slight adjustment to make sure things are centered...
//   c.x = a.x;
//   c.y = a.y;

//   // get the text to show
  
//   // c.text = names[i - 1];

//   // console.log(`test-text${i}, ${tmpAngle}, ${names[i - 1]}`);

//   tmpAngle += 90;
// }

function rotatePoint(origin, offsets, angle) {
  let radians = (angle * Math.PI) / 180.0;
  let cos = Math.cos(radians);
  let sin = Math.sin(radians);
  let dX = offsets.x;
  let dY = offsets.y;

  return {
    x: Math.round(cos * dX - sin * dY + origin.x),
    y: Math.round(sin * dX + cos * dY + origin.y),
  };
}

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

const monNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
// Rotate the hands every tick
function updateClock() {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);

  if(display.on)
  {
    activityCallback(activityData());
    let dayNumber = zeroPad(today.getDate());
    let monNumber = today.getMonth();
    dateText.text=dayNumber;
    monText.text = monNames[monNumber-1];


  }
}

// Update the clock every tick event
clock.addEventListener("tick", updateClock);


if (display.aodAvailable && me.permissions.granted("access_aod")) {
  display.aodAllowed = true;
  display.addEventListener("change", () => {
    if (!display.aodActive && display.on) {
      clock.granularity = "seconds";
      secHand.style.display = 'inline';
      mainDial.style.display = 'inline';
      clockNums.style.display = "inline";
      gradientBg.style.display = 'inline';
      hRMcontainer.style.display = 'inline';
      stepscontainer.style.display = 'inline';
      dateContainer.style.display = 'inline';
      start();
    } else {
      clock.granularity = "minutes";
      secHand.style.display = 'none';
      mainDial.style.display = 'none';
      clockNums.style.display = "none";
      gradientBg.style.display = 'none';
      hRMcontainer.style.display = 'none';
      stepscontainer.style.display = 'none';
      dateContainer.style.display = 'none';
      stop();
    }
  })
}