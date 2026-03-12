import { nanoid } from "nanoid";
import type {
	MealPlanEntry,
	PantryItem,
	Recipe,
	ShoppingListItem,
} from "../models/types";

export function generateShoppingList(
	entries: MealPlanEntry[],
	recipes: Recipe[],
	pantryItems?: PantryItem[],
): ShoppingListItem[] {
	const recipeMap = new Map(recipes.map((r) => [r.id, r]));
	const merged = new Map<string, ShoppingListItem>();

	for (const entry of entries) {
		const recipe = recipeMap.get(entry.recipeId);
		if (!recipe) continue;

		const scale = entry.servings / recipe.servings;

		for (const ing of recipe.ingredients) {
			const key = normalizeIngredientName(ing.name);
			const existing = merged.get(key);

			if (existing) {
				// Same unit — add quantities
				if (existing.unit === ing.unit) {
					existing.quantity += ing.quantity * scale;
				} else {
					// Different canonical units — keep as separate entries with a suffix
					const altKey = `${key}__${ing.unit}`;
					const altExisting = merged.get(altKey);
					if (altExisting) {
						altExisting.quantity += ing.quantity * scale;
					} else {
						merged.set(altKey, {
							id: nanoid(),
							name: ing.name.toLowerCase().trim(),
							quantity: ing.quantity * scale,
							unit: ing.unit,
							displayUnit: ing.displayUnit,
							displayQuantity: ing.displayQuantity ? ing.displayQuantity * scale : undefined,
							category: ing.category,
							checked: false,
							isManual: false,
							sourceRecipeIds: [recipe.id],
						});
					}
					continue;
				}
				if (!existing.sourceRecipeIds.includes(recipe.id)) {
					existing.sourceRecipeIds.push(recipe.id);
				}
			} else {
				merged.set(key, {
					id: nanoid(),
					name: ing.name.toLowerCase().trim(),
					quantity: ing.quantity * scale,
					unit: ing.unit,
					displayUnit: ing.displayUnit,
					displayQuantity: ing.displayQuantity ? ing.displayQuantity * scale : undefined,
					category: ing.category,
					checked: false,
					isManual: false,
					sourceRecipeIds: [recipe.id],
				});
			}
		}
	}

	// Subtract pantry
	if (pantryItems) {
		const pantryMap = new Map(pantryItems.map((p) => [normalizeIngredientName(p.name), p]));
		for (const [key, item] of merged) {
			const pantryItem = pantryMap.get(key.split("__")[0]);
			if (pantryItem && pantryItem.unit === item.unit) {
				item.quantity = Math.max(0, item.quantity - pantryItem.quantity);
			}
		}
	}

	// Sort by category then name
	const categoryOrder: Record<string, number> = {
		produce: 0,
		meat: 1,
		dairy: 2,
		"dry-goods": 3,
		spice: 4,
		condiment: 5,
		frozen: 6,
		other: 7,
	};

	return Array.from(merged.values())
		.filter((item) => item.quantity > 0)
		.sort((a, b) => {
			const catDiff = (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99);
			if (catDiff !== 0) return catDiff;
			return a.name.localeCompare(b.name);
		});
}

export function normalizeIngredientName(name: string): string {
	return name.toLowerCase().trim().replace(/\s+/g, " ");
}

const ALIASES: Record<string, string> = {
	"minced beef": "ground beef",
	"minced pork": "ground pork",
	"spring onion": "green onion",
	"scallion": "green onion",
	"coriander": "cilantro",
	"capsicum": "bell pepper",
};

export function resolveAlias(name: string): string {
	const normalized = normalizeIngredientName(name);
	return ALIASES[normalized] ?? normalized;
}
