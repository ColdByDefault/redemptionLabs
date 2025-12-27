import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { DocumentsTable } from "./DocumentsTable";
import type { DocumentListItem } from "@/types/document";

interface DocumentsHubProps {
  documents: DocumentListItem[];
}

export function DocumentsHub({
  documents,
}: DocumentsHubProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Documents Hub
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload and manage your PDF documents
          </p>
        </div>
        <DocumentUploadDialog />
      </div>

      <DocumentsTable documents={documents} />
    </div>
  );
}
