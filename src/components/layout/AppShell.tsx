import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppShell() {
	return (
		<div className="flex h-full flex-col bg-gray-50">
			<main className="flex-1 overflow-y-auto pb-20">
				<Outlet />
			</main>
			<BottomNav />
		</div>
	);
}
