import { nanoid } from "nanoid";
import { db } from "./database";
import { SEED_RECIPES } from "./seed-recipes";

const SEED_KEY = "yodasbasket_seeded";

export async function seedIfNeeded() {
	if (localStorage.getItem(SEED_KEY)) return;

	const existingCount = await db.recipes.count();
	if (existingCount > 0) {
		localStorage.setItem(SEED_KEY, "1");
		return;
	}

	const now = Date.now();
	const recipes = SEED_RECIPES.map((r) => ({
		...r,
		id: nanoid(),
		createdAt: now,
		updatedAt: now,
	}));

	await db.recipes.bulkAdd(recipes);
	localStorage.setItem(SEED_KEY, "1");
}
