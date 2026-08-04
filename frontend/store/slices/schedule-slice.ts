import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type BookingDraft = {
  roomId: string;
  startsAt: string;
  endsAt: string;
};

type ScheduleState = {
  selectedRoomId: string | null;
  isBookingModalOpen: boolean;
  bookingDraft: BookingDraft | null;
};

const initialState: ScheduleState = {
  selectedRoomId: null,
  isBookingModalOpen: false,
  bookingDraft: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    selectRoom: (state, action: PayloadAction<string>) => {
      state.selectedRoomId = action.payload;
    },

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

export const { selectRoom, openBookingModal, closeBookingModal } =
  scheduleSlice.actions;

export const scheduleReducer = scheduleSlice.reducer;
