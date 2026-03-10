import { useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { seedIfNeeded } from "./db/seed";
import { MealPlanPage } from "./pages/MealPlanPage";
import { PantryPage } from "./pages/PantryPage";
import { RecipesPage } from "./pages/RecipesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShoppingPage } from "./pages/ShoppingPage";

export default function App() {
	useEffect(() => {
		seedIfNeeded();
	}, []);

	return (
		<HashRouter>
			<Routes>
				<Route element={<AppShell />}>
					<Route index element={<MealPlanPage />} />
					<Route path="recipes" element={<RecipesPage />} />
					<Route path="shopping" element={<ShoppingPage />} />
					<Route path="pantry" element={<PantryPage />} />
					<Route path="settings" element={<SettingsPage />} />
				</Route>
			</Routes>
		</HashRouter>
	);
}
