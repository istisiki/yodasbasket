import type { ShoppingListItem, UnitSystem } from "../models/types";
import { formatQuantity } from "./units";

export function formatShoppingListForClipboard(
	items: ShoppingListItem[],
	unitSystem: UnitSystem,
): string {
	const lines: string[] = [];
	let currentCategory = "";

	for (const item of items) {
		if (item.checked) continue;

		if (item.category !== currentCategory) {
			if (lines.length > 0) lines.push("");
			currentCategory = item.category;
			lines.push(`--- ${categoryLabel(currentCategory)} ---`);
		}

		const qty = formatQuantity(item.quantity, item.unit, unitSystem);
		lines.push(`☐ ${item.name} — ${qty}`);
	}

	return lines.join("\n");
}

function categoryLabel(cat: string): string {
	const labels: Record<string, string> = {
		produce: "Produce",
		meat: "Meat & Seafood",
		dairy: "Dairy",
		"dry-goods": "Dry Goods",
		spice: "Spices",
		condiment: "Condiments & Sauces",
		frozen: "Frozen",
		other: "Other",
	};
	return labels[cat] ?? cat;
}

export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback for older browsers
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		const success = document.execCommand("copy");
		document.body.removeChild(textarea);
		return success;
	}
}
