import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
  currentGuests: number;
  activeOrder?: string;
}

export interface TableStore {
  tables: Table[];
  selectedTable: Table | null;
  occupancyPercentage: number;
  setTables: (tables: Table[]) => void;
  selectTable: (table: Table) => void;
  updateTableStatus: (tableId: string, status: Table["status"]) => void;
  getOccupancyPercentage: () => number;
}

export const useTableStore = create<TableStore>()(
  devtools((set, get) => ({
    tables: [],
    selectedTable: null,
    occupancyPercentage: 0,

    setTables: (tables) => {
      const occupancy = tables.filter((t) => t.status === "occupied").length;
      const percentage = (occupancy / tables.length) * 100;

      set({ tables, occupancyPercentage: percentage });
    },

    selectTable: (table) => set({ selectedTable: table }),

    updateTableStatus: (tableId, status) =>
      set((state) => ({
        tables: state.tables.map((t) =>
          t._id === tableId ? { ...t, status } : t
        ),
      })),

    getOccupancyPercentage: () => get().occupancyPercentage,
  }))
);
