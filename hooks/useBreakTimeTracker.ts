import { useIdleTimer } from 'react-idle-timer';
import { useState, useRef } from 'react';
import axios from "axios";

const API_URL =
  "https://8u9jb1wkze.execute-api.ap-south-1.amazonaws.com/dev/v1/break-time";

export function useBreakTimeTracker(userId, inactivityThreshold = 3000) {
  const [isInactive, setIsInactive] = useState(false);
  const inactiveStartTime = useRef(null);

  // ✅ If no userId, do nothing
  if (!userId) {
    console.warn("No userId provided. Break time tracking disabled.");
    return { isInactive: false };
  }

  const incrementBreakTime = async (inactiveSeconds) => {
    try {
      const breakTime = Math.floor(inactiveSeconds / 60); // Convert seconds to minutes
      if (breakTime > 0) {
        const response = await axios.post(API_URL, {
          userId,
          breakTime
        });
        console.log("Break time updated:", response.data);
      } else {
        console.log("Inactive time too short, skipping API call");
      }
    } catch (error) {
      console.error("Error updating break time:", error);
    }

    // console.log("Interaction time us started");
  };

  const handleOnIdle = () => {
    console.log('User is idle');
    setIsInactive(true);
    inactiveStartTime.current = Date.now();
  };

  const handleOnActive = () => {
    console.log('User is active');
    
    if (isInactive && inactiveStartTime.current) {
      const inactiveDuration = Math.floor(
        (Date.now() - inactiveStartTime.current) / 1000
      );
      console.log(`User was inactive for ${inactiveDuration} seconds`);
      incrementBreakTime(inactiveDuration);
    }
    
    setIsInactive(false);
    inactiveStartTime.current = null;
  };

  const { reset, pause, resume, getRemainingTime, isIdle } = useIdleTimer({
    timeout: inactivityThreshold,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    throttle: 500, // Prevents rapid firing (use either throttle OR debounce, not both)
    startOnMount: true, // Start tracking immediately
    startManually: false, // Don't require manual start
    stopOnIdle: false, // Keep timer running when idle
    crossTab: true, // Sync across browser tabs
    events: [
      'mousemove',
      'keydown',
      'wheel',
      'DOMMouseScroll',
      'mousewheel',
      'mousedown',
      'touchstart',
      'touchmove',
      'MSPointerDown',
      'MSPointerMove',
      'visibilitychange'
    ]
  });

  return { 
    isInactive,
    reset,              // Manual reset if needed
    pause,              // Pause tracking
    resume,             // Resume tracking
    getRemainingTime,   // Get remaining time before idle
    isIdle              // Alternative way to check idle state from library
  };
}