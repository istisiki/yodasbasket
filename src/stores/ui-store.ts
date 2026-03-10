import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UnitSystem } from "../models/types";

interface UIState {
	unitSystem: UnitSystem;
	subtractPantry: boolean;
	setUnitSystem: (system: UnitSystem) => void;
	toggleSubtractPantry: () => void;
}

export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			unitSystem: "metric",
			subtractPantry: false,
			setUnitSystem: (unitSystem) => set({ unitSystem }),
			toggleSubtractPantry: () => set((s) => ({ subtractPantry: !s.subtractPantry })),
		}),
		{ name: "yodasbasket-ui" },
	),
);
