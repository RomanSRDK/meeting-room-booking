import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RoomList } from "@/components/Rooms/RoomList/RoomList";
import { Schedule } from "@/components/Schedule/Schedule";
import { BookingModal } from "@/components/BookingModal/BookingModal";
import { BookingDetailsModal } from "@/components/BookingDetailsModal/BookingDetailsModal";
import { getQueryClient } from "@/lib/get-query-client";
import { roomsQueryOptions } from "@/queries/room-queries";

export default async function HomePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(roomsQueryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section>
        <h1>Meeting rooms</h1>
        <RoomList />
        <Schedule />
        <BookingModal />
        <BookingDetailsModal />
      </section>
    </HydrationBoundary>
  );
}
