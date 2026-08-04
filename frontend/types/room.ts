export type Room = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
};

export type RoomsResponse = {
  status: number;
  message: string;
  data: Room[];
};
