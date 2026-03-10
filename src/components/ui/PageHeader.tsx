import type { ReactNode } from "react";

export function PageHeader({
	title,
	actions,
}: { title: string; actions?: ReactNode }) {
	return (
		<div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
			<h1 className="text-lg font-bold text-gray-900">{title}</h1>
			{actions && <div className="flex gap-2">{actions}</div>}
		</div>
	);
}
