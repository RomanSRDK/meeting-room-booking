"use client";

import { useQuery } from "@tanstack/react-query";

import { roomsQueryOptions } from "@/queries/room-queries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectRoom } from "@/store/slices/schedule-slice";

import styles from "./RoomList.module.css";

export function RoomList() {
  const dispatch = useAppDispatch();

  const selectedRoomId = useAppSelector(
    (state) => state.schedule.selectedRoomId,
  );

  const { data: rooms, isPending, isError } = useQuery(roomsQueryOptions);

  if (isPending) {
    return <p className={styles.state}>Loading rooms...</p>;
  }

  if (isError) {
    return <p className={styles.state}>Failed to load rooms</p>;
  }

  if (rooms.length === 0) {
    return <p className={styles.state}>No rooms available</p>;
  }

  return (
    <ul className={styles.list}>
      {rooms.map((room) => {
        const isSelected = room.id === selectedRoomId;

        return (
          <li key={room.id}>
            <button
              className={`${styles.item} ${isSelected ? styles.selected : ""}`}
              type="button"
              onClick={() => {
                dispatch(selectRoom(room.id));
              }}
            >
              <span className={styles.name}>{room.name}</span>

              <span className={styles.details}>
                Floor {room.floor} · Capacity {room.capacity}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
