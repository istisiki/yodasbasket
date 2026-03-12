import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { db } from "../db/database";
import type { MealPlan, MealPlanEntry } from "../models/types";

export function useMealPlans() {
	return useLiveQuery(() => db.mealPlans.orderBy("createdAt").reverse().toArray()) ?? [];
}

export function useMealPlan(id: string | undefined) {
	return useLiveQuery(() => (id ? db.mealPlans.get(id) : undefined), [id]);
}

export async function createMealPlan(name: string): Promise<string> {
	const id = nanoid();
	await db.mealPlans.add({ id, name, entries: [], createdAt: Date.now() });
	return id;
}

export async function updateMealPlanEntries(id: string, entries: MealPlanEntry[]) {
	await db.mealPlans.update(id, { entries });
}

export async function addEntryToMealPlan(planId: string, entry: MealPlanEntry) {
	const plan = await db.mealPlans.get(planId);
	if (!plan) return;
	const existing = plan.entries.find((e) => e.recipeId === entry.recipeId);
	if (existing) {
		existing.servings += entry.servings;
		await db.mealPlans.update(planId, { entries: [...plan.entries] });
	} else {
		await db.mealPlans.update(planId, { entries: [...plan.entries, entry] });
	}
}

export async function removeEntryFromMealPlan(planId: string, recipeId: string) {
	const plan = await db.mealPlans.get(planId);
	if (!plan) return;
	await db.mealPlans.update(planId, {
		entries: plan.entries.filter((e) => e.recipeId !== recipeId),
	});
}

export async function deleteMealPlan(id: string) {
	await db.mealPlans.delete(id);
}

export async function getOrCreateActivePlan(): Promise<MealPlan> {
	const plans = await db.mealPlans.orderBy("createdAt").reverse().toArray();
	if (plans.length > 0) return plans[0];
	const id = nanoid();
	const plan: MealPlan = { id, name: "My Meal Plan", entries: [], createdAt: Date.now() };
	await db.mealPlans.add(plan);
	return plan;
}
