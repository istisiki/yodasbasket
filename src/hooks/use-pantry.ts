import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { db } from "../db/database";
import { calculateNextReminder } from "../lib/reminders";
import type { PantryItem } from "../models/types";

export function usePantryItems() {
	return useLiveQuery(() => db.pantryItems.orderBy("category").toArray()) ?? [];
}

export async function addPantryItem(
	data: Omit<PantryItem, "id" | "lastUpdated" | "nextReminderAt">,
): Promise<string> {
	const id = nanoid();
	const now = Date.now();
	await db.pantryItems.add({
		...data,
		id,
		lastUpdated: now,
		nextReminderAt: calculateNextReminder(data.reminderIntervalDays, now),
	});
	return id;
}

export async function updatePantryItem(
	id: string,
	data: Partial<Omit<PantryItem, "id">>,
) {
	const now = Date.now();
	const update: Partial<PantryItem> = { ...data, lastUpdated: now };
	if (data.reminderIntervalDays !== undefined) {
		update.nextReminderAt = calculateNextReminder(data.reminderIntervalDays, now);
	}
	await db.pantryItems.update(id, update);
}

export async function deletePantryItem(id: string) {
	await db.pantryItems.delete(id);
}

export async function addOrUpdatePantryFromShopping(
	name: string,
	quantity: number,
	unit: "g" | "ml" | "unit",
	category: "meat" | "produce" | "dairy" | "spice" | "condiment" | "dry-goods" | "frozen" | "other",
) {
	const existing = await db.pantryItems
		.where("name")
		.equalsIgnoreCase(name.toLowerCase().trim())
		.first();

	if (existing && existing.unit === unit) {
		await db.pantryItems.update(existing.id, {
			quantity: existing.quantity + quantity,
			lastUpdated: Date.now(),
		});
	} else if (!existing) {
		await addPantryItem({ name: name.toLowerCase().trim(), quantity, unit, category });
	}
}
