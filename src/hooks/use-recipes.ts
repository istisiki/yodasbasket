import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { db } from "../db/database";
import type { Recipe, RecipeIngredient } from "../models/types";

export function useRecipes() {
	const recipes = useLiveQuery(() => db.recipes.orderBy("name").toArray()) ?? [];
	return recipes;
}

export function useRecipe(id: string | undefined) {
	return useLiveQuery(() => (id ? db.recipes.get(id) : undefined), [id]);
}

export async function addRecipe(
	data: Omit<Recipe, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
	const id = nanoid();
	const now = Date.now();
	await db.recipes.add({ ...data, id, createdAt: now, updatedAt: now });
	return id;
}

export async function updateRecipe(
	id: string,
	data: Partial<Omit<Recipe, "id" | "createdAt">>,
) {
	await db.recipes.update(id, { ...data, updatedAt: Date.now() });
}

export async function deleteRecipe(id: string) {
	await db.recipes.delete(id);
}

export function createEmptyIngredient(): RecipeIngredient {
	return {
		name: "",
		quantity: 0,
		unit: "g",
		displayUnit: "g",
		category: "other",
	};
}
