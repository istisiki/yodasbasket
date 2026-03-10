import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md";
}

export function Button({
	variant = "primary",
	size = "md",
	className,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50",
				{
					"bg-green-600 text-white hover:bg-green-700 active:bg-green-800":
						variant === "primary",
					"border border-gray-300 bg-white text-gray-700 hover:bg-gray-50":
						variant === "secondary",
					"text-gray-600 hover:text-gray-900 hover:bg-gray-100":
						variant === "ghost",
					"bg-red-600 text-white hover:bg-red-700":
						variant === "danger",
				},
				size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm",
				className,
			)}
			{...props}
		/>
	);
}
