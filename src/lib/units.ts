import type { CanonicalUnit } from "../models/types";

export interface DisplayUnit {
	label: string;
	abbreviation: string;
	system: "us" | "metric" | "universal";
	canonicalUnit: CanonicalUnit;
	toCanonical: number; // multiply display value by this to get canonical (g or ml)
}

export const DISPLAY_UNITS: Record<string, DisplayUnit> = {
	// Mass - metric
	g: { label: "grams", abbreviation: "g", system: "metric", canonicalUnit: "g", toCanonical: 1 },
	kg: {
		label: "kilograms",
		abbreviation: "kg",
		system: "metric",
		canonicalUnit: "g",
		toCanonical: 1000,
	},
	// Mass - US
	oz: {
		label: "ounces",
		abbreviation: "oz",
		system: "us",
		canonicalUnit: "g",
		toCanonical: 28.3495,
	},
	lb: {
		label: "pounds",
		abbreviation: "lb",
		system: "us",
		canonicalUnit: "g",
		toCanonical: 453.592,
	},
	// Volume - metric
	ml: {
		label: "milliliters",
		abbreviation: "ml",
		system: "metric",
		canonicalUnit: "ml",
		toCanonical: 1,
	},
	L: {
		label: "liters",
		abbreviation: "L",
		system: "metric",
		canonicalUnit: "ml",
		toCanonical: 1000,
	},
	// Volume - US
	tsp: {
		label: "teaspoons",
		abbreviation: "tsp",
		system: "us",
		canonicalUnit: "ml",
		toCanonical: 4.92892,
	},
	tbsp: {
		label: "tablespoons",
		abbreviation: "tbsp",
		system: "us",
		canonicalUnit: "ml",
		toCanonical: 14.7868,
	},
	cup: {
		label: "cups",
		abbreviation: "cup",
		system: "us",
		canonicalUnit: "ml",
		toCanonical: 236.588,
	},
	"fl oz": {
		label: "fluid ounces",
		abbreviation: "fl oz",
		system: "us",
		canonicalUnit: "ml",
		toCanonical: 29.5735,
	},
	// Count
	unit: {
		label: "units",
		abbreviation: "",
		system: "universal",
		canonicalUnit: "unit",
		toCanonical: 1,
	},
	piece: {
		label: "pieces",
		abbreviation: "pc",
		system: "universal",
		canonicalUnit: "unit",
		toCanonical: 1,
	},
	clove: {
		label: "cloves",
		abbreviation: "clove",
		system: "universal",
		canonicalUnit: "unit",
		toCanonical: 1,
	},
};

export function toCanonical(value: number, displayUnit: string): { value: number; unit: CanonicalUnit } {
	const u = DISPLAY_UNITS[displayUnit];
	if (!u) return { value, unit: "unit" };
	return { value: value * u.toCanonical, unit: u.canonicalUnit };
}

export function fromCanonical(
	canonicalValue: number,
	canonicalUnit: CanonicalUnit,
	targetDisplayUnit: string,
): number {
	const u = DISPLAY_UNITS[targetDisplayUnit];
	if (!u || u.canonicalUnit !== canonicalUnit) return canonicalValue;
	return canonicalValue / u.toCanonical;
}

function pickBestUnit(canonicalValue: number, canonicalUnit: CanonicalUnit, system: "us" | "metric"): { value: number; displayUnit: string } {
	if (canonicalUnit === "unit") {
		return { value: canonicalValue, displayUnit: "unit" };
	}

	const candidates = Object.entries(DISPLAY_UNITS).filter(
		([, u]) => u.canonicalUnit === canonicalUnit && (u.system === system || u.system === "universal"),
	);

	let best: { value: number; displayUnit: string } = { value: canonicalValue, displayUnit: canonicalUnit };
	let bestScore = Number.POSITIVE_INFINITY;

	for (const [key, u] of candidates) {
		const converted = canonicalValue / u.toCanonical;
		// Prefer values between 0.25 and 1000
		const score = converted < 0.25 ? 1 / converted : converted > 1000 ? converted : 0;
		if (score < bestScore || (score === bestScore && converted >= 1)) {
			bestScore = score;
			best = { value: converted, displayUnit: key };
		}
	}

	return best;
}

export function formatQuantity(
	canonicalValue: number,
	canonicalUnit: CanonicalUnit,
	system: "us" | "metric",
): string {
	const { value, displayUnit } = pickBestUnit(canonicalValue, canonicalUnit, system);
	const rounded = Math.round(value * 100) / 100;
	const u = DISPLAY_UNITS[displayUnit];
	const abbr = u?.abbreviation ?? displayUnit;
	if (canonicalUnit === "unit" && !abbr) return `${rounded}`;
	return `${rounded} ${abbr}`;
}

export function getDisplayUnitsForCanonical(canonicalUnit: CanonicalUnit, system?: "us" | "metric"): string[] {
	return Object.entries(DISPLAY_UNITS)
		.filter(
			([, u]) =>
				u.canonicalUnit === canonicalUnit &&
				(!system || u.system === system || u.system === "universal"),
		)
		.map(([key]) => key);
}
