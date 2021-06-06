import clock from "clock";
import document from "document";
import { display } from "display";
import {me} from "appbit"

// Tick every second
clock.granularity = "seconds";

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");

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

// Rotate the hands every tick
function updateClock() {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);
}

// Update the clock every tick event
clock.addEventListener("tick", updateClock);


if (display.aodAvailable && me.permissions.granted("access_aod")) {
  display.aodAllowed = true;
  // display.aodActive = true;
  display.addEventListener("change", () => {
    console.log("aod active: ", display.aodActive)
    if (!display.aodActive && display.on) {
      clock.granularity = "seconds";
      secHand.style.display = 'inline';
    } else {
      clock.granularity = "minutes";
      secHand.style.display = 'none';
    }
  })
}