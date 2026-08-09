"use client";

import { useSyncExternalStore } from "react";
import { getUserTimeZone, OFFICE_TIME_ZONE } from "@/lib/date-time";

function subscribeToTimeZone() {
  return () => {};
}

export function useUserTimeZone() {
  return useSyncExternalStore(
    subscribeToTimeZone,
    getUserTimeZone,
    () => OFFICE_TIME_ZONE,
  );
}
