import { BookOpen, Clock, Plus, Trash2, Edit3 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import {
	addRecipe,
	createEmptyIngredient,
	deleteRecipe,
	updateRecipe,
	useRecipes,
} from "../hooks/use-recipes";
import type { IngredientCategory, Recipe, RecipeIngredient } from "../models/types";
import { DISPLAY_UNITS, toCanonical } from "../lib/units";

type FormMode = { kind: "closed" } | { kind: "create" } | { kind: "edit"; recipe: Recipe };

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

const UNIT_OPTIONS = Object.entries(DISPLAY_UNITS).map(([key, u]) => ({
	value: key,
	label: `${u.abbreviation || key} (${u.label})`,
}));

export function RecipesPage() {
	const recipes = useRecipes();
	const [form, setForm] = useState<FormMode>({ kind: "closed" });
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

	return (
		<div>
			<PageHeader
				title="Recipes"
				actions={
					<Button
						size="sm"
						onClick={() => setForm({ kind: "create" })}
					>
						<Plus className="h-4 w-4" />
						New
					</Button>
				}
			/>

			{form.kind !== "closed" ? (
				<RecipeFormView
					initial={form.kind === "edit" ? form.recipe : undefined}
					onSave={async (data) => {
						if (form.kind === "edit") {
							await updateRecipe(form.recipe.id, data);
						} else {
							await addRecipe({ ...data, isPreset: false });
						}
						setForm({ kind: "closed" });
					}}
					onCancel={() => setForm({ kind: "closed" })}
				/>
			) : recipes.length === 0 ? (
				<EmptyState
					icon={<BookOpen className="h-12 w-12" />}
					title="No recipes"
					description="Add your first recipe to get started."
					action={
						<Button onClick={() => setForm({ kind: "create" })}>
							<Plus className="h-4 w-4" />
							New Recipe
						</Button>
					}
				/>
			) : (
				<div className="p-4 space-y-3">
					{recipes.map((recipe) => (
						<div
							key={recipe.id}
							className="rounded-lg bg-white p-4 shadow-sm border border-gray-100"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-gray-900">{recipe.name}</h3>
									{recipe.description && (
										<p className="text-sm text-gray-500 mt-0.5">
											{recipe.description}
										</p>
									)}
									<div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
										<span>{recipe.servings} servings</span>
										{recipe.prepTimeMinutes && (
											<span className="flex items-center gap-0.5">
												<Clock className="h-3 w-3" />
												{recipe.prepTimeMinutes + (recipe.cookTimeMinutes ?? 0)}m
											</span>
										)}
										<span>{recipe.ingredients.length} ingredients</span>
									</div>
									{recipe.tags.length > 0 && (
										<div className="flex gap-1 mt-2 flex-wrap">
											{recipe.tags.map((tag) => (
												<span
													key={tag}
													className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
												>
													{tag}
												</span>
											))}
										</div>
									)}
								</div>
								<div className="flex gap-1 ml-2">
									<button
										type="button"
										className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
										onClick={() => setForm({ kind: "edit", recipe })}
									>
										<Edit3 className="h-4 w-4" />
									</button>
									{confirmDelete === recipe.id ? (
										<div className="flex gap-1">
											<Button
												size="sm"
												variant="danger"
												onClick={async () => {
													await deleteRecipe(recipe.id);
													setConfirmDelete(null);
												}}
											>
												Delete
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
											className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
											onClick={() => setConfirmDelete(recipe.id)}
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function RecipeFormView({
	initial,
	onSave,
	onCancel,
}: {
	initial?: Recipe;
	onSave: (data: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "isPreset">) => Promise<void>;
	onCancel: () => void;
}) {
	const [name, setName] = useState(initial?.name ?? "");
	const [description, setDescription] = useState(initial?.description ?? "");
	const [servings, setServings] = useState(initial?.servings ?? 4);
	const [prepTime, setPrepTime] = useState(initial?.prepTimeMinutes ?? 0);
	const [cookTime, setCookTime] = useState(initial?.cookTimeMinutes ?? 0);
	const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
	const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
		initial?.ingredients ?? [createEmptyIngredient()],
	);
	const [instructions, setInstructions] = useState<string[]>(
		initial?.instructions ?? [""],
	);
	const [saving, setSaving] = useState(false);

	function updateIngredient(index: number, field: string, value: string | number) {
		setIngredients((prev) =>
			prev.map((ing, i) => {
				if (i !== index) return ing;

				if (field === "displayUnit") {
					const unitStr = value as string;
					const canonical = toCanonical(ing.quantity, unitStr);
					return { ...ing, displayUnit: unitStr, unit: canonical.unit };
				}

				return { ...ing, [field]: value };
			}),
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		setSaving(true);

		const validIngredients = ingredients.filter((i) => i.name.trim() && i.quantity > 0);
		// Recalculate canonical values
		const processedIngredients = validIngredients.map((ing) => {
			const du = ing.displayUnit || "g";
			const canonical = toCanonical(ing.quantity, du);
			return {
				...ing,
				unit: canonical.unit,
				displayUnit: du,
				displayQuantity: ing.quantity,
				quantity: canonical.value,
			};
		});

		await onSave({
			name: name.trim(),
			description: description.trim() || undefined,
			servings,
			prepTimeMinutes: prepTime || undefined,
			cookTimeMinutes: cookTime || undefined,
			tags: tags
				.split(",")
				.map((t) => t.trim().toLowerCase())
				.filter(Boolean),
			ingredients: processedIngredients,
			instructions: instructions.filter((s) => s.trim()),
		});
		setSaving(false);
	}

	return (
		<form onSubmit={handleSubmit} className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-bold">
					{initial ? "Edit Recipe" : "New Recipe"}
				</h2>
				<button type="button" className="text-sm text-gray-500 hover:text-gray-700" onClick={onCancel}>
					Cancel
				</button>
			</div>

			<div className="space-y-3">
				<input
					type="text"
					placeholder="Recipe name *"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
					required
				/>
				<input
					type="text"
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
				/>
				<div className="grid grid-cols-3 gap-2">
					<label className="text-xs text-gray-500">
						Servings
						<input
							type="number"
							min={1}
							value={servings}
							onChange={(e) => setServings(Number(e.target.value))}
							className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
						/>
					</label>
					<label className="text-xs text-gray-500">
						Prep (min)
						<input
							type="number"
							min={0}
							value={prepTime}
							onChange={(e) => setPrepTime(Number(e.target.value))}
							className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
						/>
					</label>
					<label className="text-xs text-gray-500">
						Cook (min)
						<input
							type="number"
							min={0}
							value={cookTime}
							onChange={(e) => setCookTime(Number(e.target.value))}
							className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
						/>
					</label>
				</div>
				<input
					type="text"
					placeholder="Tags (comma-separated, e.g. pasta, quick)"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
					className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
				/>
			</div>

			{/* Ingredients */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-semibold text-gray-700">Ingredients</h3>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => setIngredients([...ingredients, createEmptyIngredient()])}
					>
						<Plus className="h-3 w-3" />
						Add
					</Button>
				</div>
				<div className="space-y-2">
					{ingredients.map((ing, i) => (
						<div key={`ing-${i}`} className="flex gap-1.5 items-start">
							<input
								type="text"
								placeholder="Name"
								value={ing.name}
								onChange={(e) => updateIngredient(i, "name", e.target.value)}
								className="flex-1 min-w-0 rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none"
							/>
							<input
								type="number"
								placeholder="Qty"
								value={ing.quantity || ""}
								onChange={(e) =>
									updateIngredient(i, "quantity", Number(e.target.value))
								}
								className="w-16 rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none"
								min={0}
								step="any"
							/>
							<select
								value={ing.displayUnit || "g"}
								onChange={(e) => updateIngredient(i, "displayUnit", e.target.value)}
								className="w-20 rounded border border-gray-300 px-1 py-1.5 text-xs focus:border-green-500 focus:outline-none"
							>
								{UNIT_OPTIONS.map((u) => (
									<option key={u.value} value={u.value}>
										{u.value}
									</option>
								))}
							</select>
							<select
								value={ing.category}
								onChange={(e) => updateIngredient(i, "category", e.target.value)}
								className="w-24 rounded border border-gray-300 px-1 py-1.5 text-xs focus:border-green-500 focus:outline-none"
							>
								{CATEGORIES.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
							<button
								type="button"
								className="rounded p-1 text-gray-400 hover:text-red-500"
								onClick={() =>
									setIngredients(ingredients.filter((_, j) => j !== i))
								}
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Instructions */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h3 className="text-sm font-semibold text-gray-700">Instructions</h3>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						onClick={() => setInstructions([...instructions, ""])}
					>
						<Plus className="h-3 w-3" />
						Add Step
					</Button>
				</div>
				<div className="space-y-2">
					{instructions.map((step, i) => (
						<div key={`step-${i}`} className="flex gap-1.5 items-start">
							<span className="mt-1.5 text-xs text-gray-400 w-5 text-right shrink-0">
								{i + 1}.
							</span>
							<textarea
								placeholder={`Step ${i + 1}`}
								value={step}
								onChange={(e) => {
									const updated = [...instructions];
									updated[i] = e.target.value;
									setInstructions(updated);
								}}
								rows={2}
								className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none resize-none"
							/>
							<button
								type="button"
								className="rounded p-1 text-gray-400 hover:text-red-500"
								onClick={() =>
									setInstructions(instructions.filter((_, j) => j !== i))
								}
							>
								<Trash2 className="h-3.5 w-3.5" />
							</button>
						</div>
					))}
				</div>
			</div>

			<div className="flex gap-2 pt-2">
				<Button type="submit" disabled={saving || !name.trim()} className="flex-1">
					{saving ? "Saving..." : initial ? "Update Recipe" : "Create Recipe"}
				</Button>
				<Button type="button" variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
