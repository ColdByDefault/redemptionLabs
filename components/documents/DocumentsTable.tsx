"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteDocumentAction } from "@/actions/document";
import { formatFileSize } from "@/lib/document-utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { DocumentListItem } from "@/types/document";

interface DocumentsTableProps {
  documents: DocumentListItem[];
}

export function DocumentsTable({
  documents,
}: DocumentsTableProps): React.ReactElement {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setDeletingId(id);

    const result = await deleteDocumentAction(id);

    if (result.success) {
      toast.success("Document deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }

    setDeletingId(null);
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-12 dark:border-zinc-700">
        <FileText className="h-12 w-12 text-zinc-400" />
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          No documents yet
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Upload your first PDF to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.name}</TableCell>
              <TableCell className="text-zinc-500">{doc.fileName}</TableCell>
              <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
              <TableCell>{formatDate(doc.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc.id, doc.name)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
