"use client";

import { useEffect, useState } from "react";

const MINUTE_IN_MILLISECONDS = 60_000;

export function useCurrentTime(): Date {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;

    function updateCurrentTime() {
      setCurrentTime(new Date());
    }

    const now = new Date();

    const millisecondsUntilNextMinute =
      MINUTE_IN_MILLISECONDS -
      (now.getSeconds() * 1000 + now.getMilliseconds());

    const timeoutId = window.setTimeout(() => {
      updateCurrentTime();

      intervalId = window.setInterval(
        updateCurrentTime,
        MINUTE_IN_MILLISECONDS,
      );
    }, millisecondsUntilNextMinute);

    return () => {
      window.clearTimeout(timeoutId);

      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return currentTime;
}
