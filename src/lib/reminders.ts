import type { PantryItem } from "../models/types";

export function getPantryReminders(items: PantryItem[]): PantryItem[] {
	const now = Date.now();
	return items.filter(
		(item) => item.nextReminderAt != null && item.nextReminderAt <= now,
	);
}

export function calculateNextReminder(
	intervalDays: number | undefined,
	fromDate?: number,
): number | undefined {
	if (!intervalDays) return undefined;
	const from = fromDate ?? Date.now();
	return from + intervalDays * 24 * 60 * 60 * 1000;
}
