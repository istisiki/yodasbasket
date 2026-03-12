import {
	Check,
	Clipboard,
	ClipboardCheck,
	Plus,
	RotateCcw,
	ShoppingCart,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { useMealPlans } from "../hooks/use-meal-plan";
import { addOrUpdatePantryFromShopping } from "../hooks/use-pantry";
import { useRecipes } from "../hooks/use-recipes";
import { usePantryItems } from "../hooks/use-pantry";
import { copyToClipboard, formatShoppingListForClipboard } from "../lib/clipboard";
import { cn } from "../lib/cn";
import { generateShoppingList } from "../lib/shopping-list";
import { formatQuantity } from "../lib/units";
import type { IngredientCategory, ShoppingListItem } from "../models/types";
import { useUIStore } from "../stores/ui-store";

const CATEGORY_LABELS: Record<string, string> = {
	produce: "Produce",
	meat: "Meat & Seafood",
	dairy: "Dairy",
	"dry-goods": "Dry Goods",
	spice: "Spices",
	condiment: "Condiments & Sauces",
	frozen: "Frozen",
	other: "Other",
};

export function ShoppingPage() {
	const plans = useMealPlans();
	const recipes = useRecipes();
	const pantryItems = usePantryItems();
	const { unitSystem, setUnitSystem, subtractPantry, toggleSubtractPantry } = useUIStore();
	const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
	const [manualItems, setManualItems] = useState<ShoppingListItem[]>([]);
	const [copied, setCopied] = useState(false);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newItemName, setNewItemName] = useState("");
	const [newItemQty, setNewItemQty] = useState("");
	const [newItemUnit, setNewItemUnit] = useState("unit");

	const activePlan = plans[0];

	const generatedItems = useMemo(() => {
		if (!activePlan || activePlan.entries.length === 0) return [];
		return generateShoppingList(
			activePlan.entries,
			recipes,
			subtractPantry ? pantryItems : undefined,
		);
	}, [activePlan, recipes, pantryItems, subtractPantry]);

	const allItems = useMemo(
		() => [...generatedItems, ...manualItems],
		[generatedItems, manualItems],
	);

	// Group by category
	const grouped = useMemo(() => {
		const groups = new Map<string, ShoppingListItem[]>();
		for (const item of allItems) {
			const cat = item.category;
			if (!groups.has(cat)) groups.set(cat, []);
			groups.get(cat)!.push(item);
		}
		return groups;
	}, [allItems]);

	async function toggleCheck(item: ShoppingListItem) {
		const newChecked = new Set(checkedIds);
		if (newChecked.has(item.id)) {
			newChecked.delete(item.id);
		} else {
			newChecked.add(item.id);
			// Auto-add to pantry on checkout
			await addOrUpdatePantryFromShopping(
				item.name,
				item.quantity,
				item.unit,
				item.category,
			);
		}
		setCheckedIds(newChecked);
	}

	async function handleCopy() {
		const text = formatShoppingListForClipboard(allItems, unitSystem);
		const success = await copyToClipboard(text);
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}

	function handleAddManualItem(e: React.FormEvent) {
		e.preventDefault();
		if (!newItemName.trim()) return;
		const item: ShoppingListItem = {
			id: `manual-${Date.now()}`,
			name: newItemName.trim().toLowerCase(),
			quantity: Number(newItemQty) || 1,
			unit: newItemUnit as "g" | "ml" | "unit",
			category: "other" as IngredientCategory,
			checked: false,
			isManual: true,
			sourceRecipeIds: [],
		};
		setManualItems([...manualItems, item]);
		setNewItemName("");
		setNewItemQty("");
		setShowAddForm(false);
	}

	if (allItems.length === 0) {
		return (
			<div>
				<PageHeader title="Shopping List" />
				<EmptyState
					icon={<ShoppingCart className="h-12 w-12" />}
					title="No items"
					description="Add recipes to your meal plan to generate a shopping list."
				/>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title="Shopping List"
				actions={
					<div className="flex gap-1.5">
						<Button size="sm" variant="ghost" onClick={handleCopy}>
							{copied ? (
								<ClipboardCheck className="h-4 w-4" />
							) : (
								<Clipboard className="h-4 w-4" />
							)}
							{copied ? "Copied" : "Copy"}
						</Button>
						<Button size="sm" variant="ghost" onClick={() => setShowAddForm(true)}>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
				}
			/>

			{/* Controls */}
			<div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100 text-xs">
				<button
					type="button"
					className={cn(
						"rounded-full px-3 py-1 border transition-colors",
						unitSystem === "metric"
							? "border-green-500 bg-green-50 text-green-700"
							: "border-gray-300 text-gray-500",
					)}
					onClick={() => setUnitSystem("metric")}
				>
					Metric
				</button>
				<button
					type="button"
					className={cn(
						"rounded-full px-3 py-1 border transition-colors",
						unitSystem === "us"
							? "border-green-500 bg-green-50 text-green-700"
							: "border-gray-300 text-gray-500",
					)}
					onClick={() => setUnitSystem("us")}
				>
					US
				</button>
				<label className="ml-auto flex items-center gap-1.5 cursor-pointer">
					<input
						type="checkbox"
						checked={subtractPantry}
						onChange={toggleSubtractPantry}
						className="rounded border-gray-300 text-green-600 focus:ring-green-500"
					/>
					<span className="text-gray-600">Subtract pantry</span>
				</label>
			</div>

			{/* Add manual item form */}
			{showAddForm && (
				<form
					onSubmit={handleAddManualItem}
					className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 flex gap-2 items-end"
				>
					<input
						type="text"
						placeholder="Item name"
						value={newItemName}
						onChange={(e) => setNewItemName(e.target.value)}
						className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-green-500 focus:outline-none"
						autoFocus
					/>
					<input
						type="number"
						placeholder="Qty"
						value={newItemQty}
						onChange={(e) => setNewItemQty(e.target.value)}
						className="w-16 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-green-500 focus:outline-none"
						min={0}
						step="any"
					/>
					<select
						value={newItemUnit}
						onChange={(e) => setNewItemUnit(e.target.value)}
						className="w-16 rounded border border-gray-300 px-1 py-1.5 text-sm"
					>
						<option value="unit">unit</option>
						<option value="g">g</option>
						<option value="ml">ml</option>
					</select>
					<Button type="submit" size="sm">
						Add
					</Button>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => setShowAddForm(false)}
					>
						Cancel
					</Button>
				</form>
			)}

			{/* Shopping list items grouped by category */}
			<div className="p-4 space-y-4">
				{Array.from(grouped.entries()).map(([category, items]) => (
					<div key={category}>
						<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
							{CATEGORY_LABELS[category] ?? category}
						</h3>
						<div className="space-y-1">
							{items.map((item) => {
								const isChecked = checkedIds.has(item.id);
								return (
									<button
										type="button"
										key={item.id}
										className={cn(
											"w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
											isChecked
												? "bg-gray-100 text-gray-400"
												: "bg-white hover:bg-gray-50",
										)}
										onClick={() => toggleCheck(item)}
									>
										<div
											className={cn(
												"h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
												isChecked
													? "border-green-500 bg-green-500"
													: "border-gray-300",
											)}
										>
											{isChecked && (
												<Check className="h-3 w-3 text-white" />
											)}
										</div>
										<span
											className={cn(
												"flex-1 text-sm",
												isChecked && "line-through",
											)}
										>
											{item.name}
										</span>
										<span className="text-xs text-gray-500 shrink-0">
											{formatQuantity(item.quantity, item.unit, unitSystem)}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				))}

				{checkedIds.size > 0 && (
					<div className="pt-2 text-center">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setCheckedIds(new Set())}
						>
							<RotateCcw className="h-3.5 w-3.5" />
							Uncheck all
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
