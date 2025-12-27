"use client";

import { useState, useRef } from "react";
import {
  Download,
  Upload,
  Database,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
} from "lucide-react";
import { queuedToast } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createBackup,
  getBackupStats,
  restoreBackup,
  validateBackupFile,
} from "@/actions/backup";
import {
  formatBackupFilename,
  formatFileSize,
  getStatsSummary,
} from "@/lib/backup";
import type { BackupStats, RestoreMode } from "@/types/backup";

// ============================================================
// TYPES
// ============================================================

type DialogView = "main" | "backup" | "restore" | "confirm-restore";

interface BackupDialogProps {
  trigger: React.ReactNode;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function BackupDialog({
  trigger,
}: BackupDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<DialogView>("main");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BackupStats | null>(null);

  // Restore state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileStats, setFileStats] = useState<BackupStats | null>(null);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>("merge");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async (): Promise<void> => {
    setLoading(true);
    try {
      const backupStats = await getBackupStats();
      setStats(backupStats);
    } catch {
      queuedToast.error("Failed to load database stats");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean): void => {
    setOpen(isOpen);
    if (isOpen) {
      setView("main");
      loadStats();
      resetRestoreState();
    }
  };

  const resetRestoreState = (): void => {
    setSelectedFile(null);
    setFileContent("");
    setFileStats(null);
    setRestoreMode("merge");
    setValidationMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBackup = async (): Promise<void> => {
    setLoading(true);
    try {
      const backup = await createBackup();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = formatBackupFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      queuedToast.success(
        `Backup created with ${backup.metadata.totalRecords} records`
      );
      setOpen(false);
    } catch {
      queuedToast.error("Failed to create backup");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    try {
      const content = await file.text();
      setFileContent(content);

      const validation = await validateBackupFile(content);
      setValidationMessage(validation.message);

      if (validation.valid && validation.stats) {
        setFileStats(validation.stats);
      } else {
        setFileStats(null);
      }
    } catch {
      setValidationMessage("Failed to read file");
      setFileStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (): Promise<void> => {
    if (!fileContent) return;

    setLoading(true);
    try {
      const result = await restoreBackup(fileContent, restoreMode);

      if (result.success) {
        queuedToast.success(result.message);
        setOpen(false);
        // Reload page to reflect changes
        window.location.reload();
      } else {
        queuedToast.error(result.message);
      }
    } catch {
      queuedToast.error("Failed to restore backup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {view === "main" && (
          <MainView
            stats={stats}
            loading={loading}
            onBackup={() => setView("backup")}
            onRestore={() => setView("restore")}
          />
        )}
        {view === "backup" && (
          <BackupView
            stats={stats}
            loading={loading}
            onBack={() => setView("main")}
            onConfirm={handleBackup}
          />
        )}
        {view === "restore" && (
          <RestoreView
            selectedFile={selectedFile}
            fileStats={fileStats}
            restoreMode={restoreMode}
            validationMessage={validationMessage}
            loading={loading}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onModeChange={setRestoreMode}
            onBack={() => {
              setView("main");
              resetRestoreState();
            }}
            onNext={() => setView("confirm-restore")}
          />
        )}
        {view === "confirm-restore" && (
          <ConfirmRestoreView
            fileStats={fileStats}
            restoreMode={restoreMode}
            loading={loading}
            onBack={() => setView("restore")}
            onConfirm={handleRestore}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// MAIN VIEW
// ============================================================

interface MainViewProps {
  stats: BackupStats | null;
  loading: boolean;
  onBackup: () => void;
  onRestore: () => void;
}

function MainView({
  stats,
  loading,
  onBackup,
  onRestore,
}: MainViewProps): React.ReactElement {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backup & Restore
        </DialogTitle>
        <DialogDescription>
          Manage your database backups for your homelab
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {stats && !loading && (
          <div className="rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              Current Database
            </div>
            <p className="mt-1 text-2xl font-bold">{stats.totalRecords}</p>
            <p className="text-xs text-zinc-500">total records</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {getStatsSummary(stats).map((item) => (
                <span
                  key={item}
                  className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3">
          <Button
            variant="outline"
            className="h-auto justify-start gap-3 p-4"
            onClick={onBackup}
            disabled={loading}
          >
            <Download className="h-5 w-5 text-green-600" />
            <div className="text-left">
              <div className="font-medium">Create Backup</div>
              <div className="text-xs text-zinc-500">
                Export all data to a JSON file
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto justify-start gap-3 p-4"
            onClick={onRestore}
            disabled={loading}
          >
            <Upload className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Restore Backup</div>
              <div className="text-xs text-zinc-500">
                Import data from a backup file
              </div>
            </div>
          </Button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// BACKUP VIEW
// ============================================================

interface BackupViewProps {
  stats: BackupStats | null;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

function BackupView({
  stats,
  loading,
  onBack,
  onConfirm,
}: BackupViewProps): React.ReactElement {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-green-600" />
          Create Backup
        </DialogTitle>
        <DialogDescription>
          Download a complete backup of your database
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {stats && (
          <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/30">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Ready to backup
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-500">
              Your backup will include {stats.totalRecords} records:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {getStatsSummary(stats).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          {loading ? "Creating..." : "Download Backup"}
        </Button>
      </DialogFooter>
    </>
  );
}

// ============================================================
// RESTORE VIEW
// ============================================================

interface RestoreViewProps {
  selectedFile: File | null;
  fileStats: BackupStats | null;
  restoreMode: RestoreMode;
  validationMessage: string;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (mode: RestoreMode) => void;
  onBack: () => void;
  onNext: () => void;
}

function RestoreView({
  selectedFile,
  fileStats,
  restoreMode,
  validationMessage,
  loading,
  fileInputRef,
  onFileSelect,
  onModeChange,
  onBack,
  onNext,
}: RestoreViewProps): React.ReactElement {
  const isValid = fileStats !== null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Restore Backup
        </DialogTitle>
        <DialogDescription>
          Select a backup file and restore mode
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* File selection */}
        <div className="space-y-2">
          <Label>Backup File</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onFileSelect}
            className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:hover:file:bg-zinc-700"
          />
        </div>

        {/* File info */}
        {selectedFile && (
          <div
            className={`rounded-lg border p-4 ${
              isValid
                ? "bg-green-50 dark:bg-green-950/30"
                : "bg-red-50 dark:bg-red-950/30"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className={isValid ? "text-green-700" : "text-red-700"}>
                {selectedFile.name}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {formatFileSize(selectedFile.size)} • {validationMessage}
            </p>
            {fileStats && (
              <div className="mt-2 flex flex-wrap gap-1">
                {getStatsSummary(fileStats).map((item) => (
                  <span
                    key={item}
                    className="rounded bg-green-200 px-1.5 py-0.5 text-xs dark:bg-green-900"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Restore mode */}
        {isValid && (
          <div className="space-y-3">
            <Label>Restore Mode</Label>
            <div className="grid gap-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-blue-500 has-checked:bg-blue-50 dark:has-checked:bg-blue-950/30">
                <input
                  type="radio"
                  name="restoreMode"
                  value="merge"
                  checked={restoreMode === "merge"}
                  onChange={() => onModeChange("merge")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Merge</div>
                  <div className="text-xs text-zinc-500">
                    Add new records and update existing ones. Safe option.
                  </div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-red-500 has-checked:bg-red-50 dark:has-checked:bg-red-950/30">
                <input
                  type="radio"
                  name="restoreMode"
                  value="replace"
                  checked={restoreMode === "replace"}
                  onChange={() => onModeChange("replace")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-red-700 dark:text-red-400">
                    Replace All
                  </div>
                  <div className="text-xs text-zinc-500">
                    Delete all existing data before restoring. Destructive.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid || loading}>
          Continue
        </Button>
      </DialogFooter>
    </>
  );
}

// ============================================================
// CONFIRM RESTORE VIEW
// ============================================================

interface ConfirmRestoreViewProps {
  fileStats: BackupStats | null;
  restoreMode: RestoreMode;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

function ConfirmRestoreView({
  fileStats,
  restoreMode,
  loading,
  onBack,
  onConfirm,
}: ConfirmRestoreViewProps): React.ReactElement {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Confirm Restore
        </DialogTitle>
        <DialogDescription>Please review before proceeding</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div
          className={`rounded-lg border p-4 ${
            restoreMode === "replace"
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
          }`}
        >
          {restoreMode === "replace" ? (
            <>
              <div className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Warning: Destructive Action
              </div>
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                This will permanently delete ALL existing data and replace it
                with the backup data. This action cannot be undone.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Merge Mode
              </div>
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                Existing records with matching IDs will be updated. New records
                will be added.
              </p>
            </>
          )}
        </div>

        {fileStats && (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium">Records to restore:</p>
            <ul className="mt-1 space-y-0.5">
              {getStatsSummary(fileStats).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="mt-2 font-medium">
              Total: {fileStats.totalRecords} records
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant={restoreMode === "replace" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading
            ? "Restoring..."
            : restoreMode === "replace"
            ? "Delete & Restore"
            : "Merge & Restore"}
        </Button>
      </DialogFooter>
    </>
  );
}
