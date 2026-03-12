import { AlertCircle, Edit3, Package, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import {
	addPantryItem,
	deletePantryItem,
	updatePantryItem,
	usePantryItems,
} from "../hooks/use-pantry";
import { getPantryReminders } from "../lib/reminders";
import { formatQuantity } from "../lib/units";
import type { CanonicalUnit, IngredientCategory, PantryItem } from "../models/types";
import { useUIStore } from "../stores/ui-store";

const CATEGORIES: IngredientCategory[] = [
	"meat",
	"produce",
	"dairy",
	"spice",
	"condiment",
	"dry-goods",
	"frozen",
	"other",
];

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

type FormMode =
	| { kind: "closed" }
	| { kind: "add" }
	| { kind: "edit"; item: PantryItem };

export function PantryPage() {
	const items = usePantryItems();
	const { unitSystem } = useUIStore();
	const [form, setForm] = useState<FormMode>({ kind: "closed" });
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

	const reminders = useMemo(() => getPantryReminders(items), [items]);
	const grouped = useMemo(() => {
		const groups = new Map<string, PantryItem[]>();
		for (const item of items) {
			if (!groups.has(item.category)) groups.set(item.category, []);
			groups.get(item.category)!.push(item);
		}
		return groups;
	}, [items]);

	return (
		<div>
			<PageHeader
				title="Pantry"
				actions={
					<Button size="sm" onClick={() => setForm({ kind: "add" })}>
						<Plus className="h-4 w-4" />
						Add
					</Button>
				}
			/>

			{/* Reminders */}
			{reminders.length > 0 && (
				<div className="mx-4 mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
					<div className="flex items-center gap-1.5 text-sm font-medium text-amber-800 mb-1">
						<AlertCircle className="h-4 w-4" />
						Pantry Update Reminder
					</div>
					<p className="text-xs text-amber-700">
						{reminders.map((r) => r.name).join(", ")} — time to check and update quantities.
					</p>
				</div>
			)}

			{/* Form */}
			{form.kind !== "closed" && (
				<PantryForm
					initial={form.kind === "edit" ? form.item : undefined}
					onSave={async (data) => {
						if (form.kind === "edit") {
							await updatePantryItem(form.item.id, data);
						} else {
							await addPantryItem(data);
						}
						setForm({ kind: "closed" });
					}}
					onCancel={() => setForm({ kind: "closed" })}
				/>
			)}

			{items.length === 0 && form.kind === "closed" ? (
				<EmptyState
					icon={<Package className="h-12 w-12" />}
					title="Pantry is empty"
					description="Track what ingredients you have at home. Items will be auto-added when you check off shopping list items."
					action={
						<Button onClick={() => setForm({ kind: "add" })}>
							<Plus className="h-4 w-4" />
							Add Item
						</Button>
					}
				/>
			) : (
				<div className="p-4 space-y-4">
					{Array.from(grouped.entries()).map(([category, catItems]) => (
						<div key={category}>
							<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
								{CATEGORY_LABELS[category] ?? category}
							</h3>
							<div className="space-y-1">
								{catItems.map((item) => (
									<div
										key={item.id}
										className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 border border-gray-100"
									>
										<div className="flex-1 min-w-0">
											<span className="text-sm text-gray-900">
												{item.name}
											</span>
										</div>
										<span className="text-xs text-gray-500 shrink-0">
											{formatQuantity(item.quantity, item.unit, unitSystem)}
										</span>
										<button
											type="button"
											className="rounded p-1 text-gray-400 hover:text-gray-600"
											onClick={() =>
												setForm({ kind: "edit", item })
											}
										>
											<Edit3 className="h-3.5 w-3.5" />
										</button>
										{confirmDelete === item.id ? (
											<div className="flex gap-1">
												<Button
													size="sm"
													variant="danger"
													onClick={async () => {
														await deletePantryItem(item.id);
														setConfirmDelete(null);
													}}
												>
													Yes
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onClick={() => setConfirmDelete(null)}
												>
													No
												</Button>
											</div>
										) : (
											<button
												type="button"
												className="rounded p-1 text-gray-400 hover:text-red-500"
												onClick={() => setConfirmDelete(item.id)}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function PantryForm({
	initial,
	onSave,
	onCancel,
}: {
	initial?: PantryItem;
	onSave: (data: Omit<PantryItem, "id" | "lastUpdated" | "nextReminderAt">) => Promise<void>;
	onCancel: () => void;
}) {
	const [name, setName] = useState(initial?.name ?? "");
	const [quantity, setQuantity] = useState(initial?.quantity ?? 0);
	const [unit, setUnit] = useState<CanonicalUnit>(initial?.unit ?? "g");
	const [category, setCategory] = useState<IngredientCategory>(
		initial?.category ?? "other",
	);
	const [reminderDays, setReminderDays] = useState(
		initial?.reminderIntervalDays ?? 0,
	);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		await onSave({
			name: name.trim().toLowerCase(),
			quantity,
			unit,
			category,
			reminderIntervalDays: reminderDays > 0 ? reminderDays : undefined,
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="mx-4 mt-3 rounded-lg bg-white border border-gray-200 p-3 space-y-3"
		>
			<h3 className="text-sm font-semibold">
				{initial ? "Edit Pantry Item" : "Add to Pantry"}
			</h3>
			<input
				type="text"
				placeholder="Ingredient name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-green-500 focus:outline-none"
				required
				autoFocus
			/>
			<div className="flex gap-2">
				<input
					type="number"
					placeholder="Qty"
					value={quantity || ""}
					onChange={(e) => setQuantity(Number(e.target.value))}
					className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-green-500 focus:outline-none"
					min={0}
					step="any"
				/>
				<select
					value={unit}
					onChange={(e) => setUnit(e.target.value as CanonicalUnit)}
					className="rounded border border-gray-300 px-2 py-1.5 text-sm"
				>
					<option value="g">g</option>
					<option value="ml">ml</option>
					<option value="unit">unit</option>
				</select>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value as IngredientCategory)}
					className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
				>
					{CATEGORIES.map((c) => (
						<option key={c} value={c}>
							{CATEGORY_LABELS[c]}
						</option>
					))}
				</select>
			</div>
			<div>
				<label className="text-xs text-gray-500">
					Reminder interval (days, 0 = no reminder)
					<input
						type="number"
						value={reminderDays}
						onChange={(e) => setReminderDays(Number(e.target.value))}
						className="mt-0.5 w-24 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-green-500 focus:outline-none"
						min={0}
					/>
				</label>
			</div>
			<div className="flex gap-2">
				<Button type="submit" size="sm" disabled={!name.trim()}>
					{initial ? "Update" : "Add"}
				</Button>
				<Button type="button" size="sm" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
