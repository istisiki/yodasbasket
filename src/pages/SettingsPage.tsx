import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { downloadJson, exportAllData, importData } from "../lib/export-import";
import { useUIStore } from "../stores/ui-store";

export function SettingsPage() {
	const { unitSystem, setUnitSystem } = useUIStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [importStatus, setImportStatus] = useState("");

	async function handleExport() {
		const data = await exportAllData();
		downloadJson(data);
	}

	async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const result = await importData(file);
			setImportStatus(`Imported ${result.imported} items successfully.`);
		} catch (err) {
			setImportStatus(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`);
		}
		// Reset input so the same file can be selected again
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	return (
		<div>
			<PageHeader title="Settings" />
			<div className="p-4 space-y-6">
				{/* Unit System */}
				<section>
					<h3 className="text-sm font-semibold text-gray-700 mb-2">
						Default Unit System
					</h3>
					<div className="flex gap-2">
						<Button
							variant={unitSystem === "metric" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setUnitSystem("metric")}
						>
							Metric (g, ml)
						</Button>
						<Button
							variant={unitSystem === "us" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setUnitSystem("us")}
						>
							US (oz, cups)
						</Button>
					</div>
				</section>

				{/* Export / Import */}
				<section>
					<h3 className="text-sm font-semibold text-gray-700 mb-2">
						Data Backup
					</h3>
					<p className="text-xs text-gray-500 mb-3">
						Your data is stored only in this browser. Export to back it up or move it to another browser.
					</p>
					<div className="flex gap-2">
						<Button variant="secondary" size="sm" onClick={handleExport}>
							<Download className="h-4 w-4" />
							Export Data
						</Button>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
						>
							<Upload className="h-4 w-4" />
							Import Data
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							className="hidden"
							onChange={handleImport}
						/>
					</div>
					{importStatus && (
						<p className="mt-2 text-xs text-gray-600">{importStatus}</p>
					)}
				</section>

				{/* About */}
				<section>
					<h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
					<p className="text-xs text-gray-500">
						YodasBasket — Offline-first meal planning app.
					</p>
					<p className="text-xs text-gray-400 mt-1">
						All data stays in your browser. No accounts, no cloud.
					</p>
				</section>
			</div>
		</div>
	);
}
