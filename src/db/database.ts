import Dexie, { type EntityTable } from "dexie";
import type { MealPlan, PantryItem, Recipe } from "../models/types";

class YodasBasketDB extends Dexie {
	recipes!: EntityTable<Recipe, "id">;
	pantryItems!: EntityTable<PantryItem, "id">;
	mealPlans!: EntityTable<MealPlan, "id">;

	constructor() {
		super("yodasbasket");

		this.version(1).stores({
			recipes: "id, name, *tags, isPreset, createdAt",
			pantryItems: "id, name, category, nextReminderAt",
			mealPlans: "id, name, createdAt",
		});
	}
}

export const db = new YodasBasketDB();
