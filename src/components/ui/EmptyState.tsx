import type { ReactNode } from "react";

export function EmptyState({
	icon,
	title,
	description,
	action,
}: {
	icon: ReactNode;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="mb-3 text-gray-400">{icon}</div>
			<h3 className="text-lg font-semibold text-gray-700">{title}</h3>
			<p className="mt-1 text-sm text-gray-500 max-w-xs">{description}</p>
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
