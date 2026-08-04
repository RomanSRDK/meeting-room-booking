import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Booking } from "@/types/booking";

type BookingDraft = {
  roomId: string;
  startsAt: string;
  endsAt: string;
};

type ScheduleState = {
  selectedRoomId: string | null;
  isBookingModalOpen: boolean;
  bookingDraft: BookingDraft | null;
  isBookingDetailsModalOpen: boolean;
  selectedBooking: Booking | null;
};

const initialState: ScheduleState = {
  selectedRoomId: null,
  isBookingModalOpen: false,
  bookingDraft: null,
  isBookingDetailsModalOpen: false,
  selectedBooking: null,
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

    openBookingDetailsModal: (state, action: PayloadAction<Booking>) => {
      state.isBookingDetailsModalOpen = true;
      state.selectedBooking = action.payload;
    },

    closeBookingDetailsModal: (state) => {
      state.isBookingDetailsModalOpen = false;
      state.selectedBooking = null;
    },
  },
});

export const {
  selectRoom,
  openBookingModal,
  closeBookingModal,
  openBookingDetailsModal,
  closeBookingDetailsModal,
} = scheduleSlice.actions;

export const scheduleReducer = scheduleSlice.reducer;
