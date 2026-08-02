import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type BookingDraft = {
  roomId: string;
  startsAt: string;
  endsAt: string;
};

type ScheduleState = {
  isBookingModalOpen: boolean;
  bookingDraft: BookingDraft | null;
};

const initialState: ScheduleState = {
  isBookingModalOpen: false,
  bookingDraft: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    openBookingModal: (state, action: PayloadAction<BookingDraft>) => {
      state.isBookingModalOpen = true;
      state.bookingDraft = action.payload;
    },

    closeBookingModal: (state) => {
      state.isBookingModalOpen = false;
      state.bookingDraft = null;
    },
  },
});

export const { openBookingModal, closeBookingModal } = scheduleSlice.actions;

export const scheduleReducer = scheduleSlice.reducer;
