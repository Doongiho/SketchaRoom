import { create } from "zustand"

export interface Room {
  id: string
  name: string
  description: string
  createdBy: string
  createdByName?: string
}

interface RoomState {
  rooms: Room[]
  setRooms: (rooms: Room[]) => void
  clearRooms: () => void
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  clearRooms: () => set({ rooms: [] }),
}))
