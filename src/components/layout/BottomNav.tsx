import {
	BookOpen,
	CalendarDays,
	Package,
	Settings,
	ShoppingCart,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

const NAV_ITEMS = [
	{ to: "/", icon: CalendarDays, label: "Meals" },
	{ to: "/recipes", icon: BookOpen, label: "Recipes" },
	{ to: "/shopping", icon: ShoppingCart, label: "Shop" },
	{ to: "/pantry", icon: Package, label: "Pantry" },
	{ to: "/settings", icon: Settings, label: "Settings" },
] as const;

export function BottomNav() {
	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
			<div className="mx-auto flex max-w-lg items-center justify-around">
				{NAV_ITEMS.map(({ to, icon: Icon, label }) => (
					<NavLink
						key={to}
						to={to}
						end={to === "/"}
						className={({ isActive }) =>
							cn(
								"flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors",
								isActive
									? "text-green-600 font-semibold"
									: "text-gray-500 hover:text-gray-700",
							)
						}
					>
						<Icon className="h-5 w-5" />
						<span>{label}</span>
					</NavLink>
				))}
			</div>
		</nav>
	);
}
