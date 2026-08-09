import { configureStore } from "@reduxjs/toolkit";
import { scheduleReducer } from "./slices/schedule-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      schedule: scheduleReducer,
    },
  });
};
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
