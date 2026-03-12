import { db } from "../db/database";

export interface ExportData {
	version: 1;
	exportedAt: number;
	recipes: unknown[];
	pantryItems: unknown[];
	mealPlans: unknown[];
}

export async function exportAllData(): Promise<ExportData> {
	const [recipes, pantryItems, mealPlans] = await Promise.all([
		db.recipes.toArray(),
		db.pantryItems.toArray(),
		db.mealPlans.toArray(),
	]);

	return {
		version: 1,
		exportedAt: Date.now(),
		recipes,
		pantryItems,
		mealPlans,
	};
}

export function downloadJson(data: ExportData) {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `yodasbasket-backup-${new Date().toISOString().slice(0, 10)}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ imported: number }> {
	const text = await file.text();
	const data = JSON.parse(text) as ExportData;

	if (data.version !== 1) {
		throw new Error(`Unsupported export version: ${data.version}`);
	}

	let count = 0;

	await db.transaction("rw", [db.recipes, db.pantryItems, db.mealPlans], async () => {
		if (data.recipes?.length) {
			await db.recipes.bulkPut(data.recipes as never[]);
			count += data.recipes.length;
		}
		if (data.pantryItems?.length) {
			await db.pantryItems.bulkPut(data.pantryItems as never[]);
			count += data.pantryItems.length;
		}
		if (data.mealPlans?.length) {
			await db.mealPlans.bulkPut(data.mealPlans as never[]);
			count += data.mealPlans.length;
		}
	});

	return { imported: count };
}
