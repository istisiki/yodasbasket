import { CalendarDays, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import {
	addEntryToMealPlan,
	getOrCreateActivePlan,
	removeEntryFromMealPlan,
	updateMealPlanEntries,
	useMealPlans,
} from "../hooks/use-meal-plan";
import { useRecipes } from "../hooks/use-recipes";
import { cn } from "../lib/cn";
import type { MealPlan } from "../models/types";

export function MealPlanPage() {
	const plans = useMealPlans();
	const recipes = useRecipes();
	const navigate = useNavigate();
	const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
	const [showPicker, setShowPicker] = useState(false);

	useEffect(() => {
		getOrCreateActivePlan().then(setActivePlan);
	}, []);

	// Refresh active plan when plans change
	useEffect(() => {
		if (plans.length > 0) {
			setActivePlan(plans[0]);
		}
	}, [plans]);

	const recipeMap = new Map(recipes.map((r) => [r.id, r]));

	async function handleAddRecipe(recipeId: string) {
		if (!activePlan) return;
		const recipe = recipeMap.get(recipeId);
		if (!recipe) return;
		await addEntryToMealPlan(activePlan.id, {
			recipeId,
			servings: recipe.servings,
		});
		setShowPicker(false);
	}

	async function handleRemove(recipeId: string) {
		if (!activePlan) return;
		await removeEntryFromMealPlan(activePlan.id, recipeId);
	}

	async function handleServingsChange(recipeId: string, delta: number) {
		if (!activePlan) return;
		const updated = activePlan.entries.map((e) =>
			e.recipeId === recipeId ? { ...e, servings: Math.max(1, e.servings + delta) } : e,
		);
		await updateMealPlanEntries(activePlan.id, updated);
	}

	return (
		<div>
			<PageHeader
				title="Meal Plan"
				actions={
					<div className="flex gap-2">
						{activePlan && activePlan.entries.length > 0 && (
							<Button
								size="sm"
								onClick={() => navigate("/shopping")}
							>
								<ShoppingCart className="h-4 w-4" />
								Shopping List
							</Button>
						)}
						<Button size="sm" onClick={() => setShowPicker(true)}>
							<Plus className="h-4 w-4" />
							Add
						</Button>
					</div>
				}
			/>

			{!activePlan || activePlan.entries.length === 0 ? (
				<EmptyState
					icon={<CalendarDays className="h-12 w-12" />}
					title="No meals planned"
					description="Add recipes to your meal plan to generate a shopping list."
					action={
						<Button onClick={() => setShowPicker(true)}>
							<Plus className="h-4 w-4" />
							Add Recipe
						</Button>
					}
				/>
			) : (
				<div className="p-4 space-y-3">
					{activePlan.entries.map((entry) => {
						const recipe = recipeMap.get(entry.recipeId);
						if (!recipe) return null;
						return (
							<div
								key={entry.recipeId}
								className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-gray-100"
							>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-gray-900 truncate">
										{recipe.name}
									</p>
									<p className="text-xs text-gray-500">
										{recipe.tags.join(", ")}
									</p>
								</div>
								<div className="flex items-center gap-1.5">
									<button
										type="button"
										className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
										onClick={() => handleServingsChange(entry.recipeId, -1)}
									>
										<Minus className="h-4 w-4" />
									</button>
									<span className="w-12 text-center text-sm font-medium">
										{entry.servings} srv
									</span>
									<button
										type="button"
										className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
										onClick={() => handleServingsChange(entry.recipeId, 1)}
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>
								<button
									type="button"
									className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
									onClick={() => handleRemove(entry.recipeId)}
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						);
					})}
				</div>
			)}

			{/* Recipe Picker Modal */}
			{showPicker && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
					<div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-4">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-bold">Add Recipe</h2>
							<button
								type="button"
								className="text-gray-400 hover:text-gray-600 text-sm"
								onClick={() => setShowPicker(false)}
							>
								Cancel
							</button>
						</div>
						{recipes.length === 0 ? (
							<p className="text-sm text-gray-500 py-8 text-center">
								No recipes yet. Create one in the Recipes tab first.
							</p>
						) : (
							<div className="space-y-2">
								{recipes.map((recipe) => {
									const alreadyAdded = activePlan?.entries.some(
										(e) => e.recipeId === recipe.id,
									);
									return (
										<button
											type="button"
											key={recipe.id}
											disabled={alreadyAdded}
											className={cn(
												"w-full text-left rounded-lg p-3 border transition-colors",
												alreadyAdded
													? "border-gray-200 bg-gray-50 text-gray-400"
													: "border-gray-200 hover:border-green-300 hover:bg-green-50",
											)}
											onClick={() => handleAddRecipe(recipe.id)}
										>
											<p className="font-medium">{recipe.name}</p>
											<p className="text-xs text-gray-500 mt-0.5">
												{recipe.servings} servings · {recipe.tags.join(", ")}
											</p>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
