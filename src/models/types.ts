export type CanonicalUnit = "g" | "ml" | "unit";

export type IngredientCategory =
	| "meat"
	| "produce"
	| "dairy"
	| "spice"
	| "condiment"
	| "dry-goods"
	| "frozen"
	| "other";

export interface RecipeIngredient {
	name: string;
	quantity: number;
	unit: CanonicalUnit;
	displayUnit?: string;
	displayQuantity?: number;
	category: IngredientCategory;
}

export interface Recipe {
	id: string;
	name: string;
	description?: string;
	servings: number;
	prepTimeMinutes?: number;
	cookTimeMinutes?: number;
	tags: string[];
	ingredients: RecipeIngredient[];
	instructions: string[];
	isPreset: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface PantryItem {
	id: string;
	name: string;
	quantity: number;
	unit: CanonicalUnit;
	category: IngredientCategory;
	lastUpdated: number;
	reminderIntervalDays?: number;
	nextReminderAt?: number;
}

export interface MealPlanEntry {
	recipeId: string;
	servings: number;
}

export interface MealPlan {
	id: string;
	name: string;
	entries: MealPlanEntry[];
	createdAt: number;
}

export interface ShoppingListItem {
	id: string;
	name: string;
	quantity: number;
	unit: CanonicalUnit;
	displayUnit?: string;
	displayQuantity?: number;
	category: IngredientCategory;
	checked: boolean;
	isManual: boolean;
	sourceRecipeIds: string[];
}

export type UnitSystem = "us" | "metric";
