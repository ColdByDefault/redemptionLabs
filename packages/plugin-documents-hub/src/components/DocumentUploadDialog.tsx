"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadDocumentAction } from "@/actions/document";
import { toast } from "sonner";

export function DocumentUploadDialog(): React.ReactElement {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setSelectedFile(file);
      // Auto-fill name from filename if empty
      if (!name) {
        setName(file.name.replace(".pdf", ""));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", name);

    const result = await uploadDocumentAction(formData);

    if (result.success) {
      toast.success("Document uploaded successfully");
      setIsOpen(false);
      setName("");
      setSelectedFile(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }

    setIsLoading(false);
  }

  function handleReset() {
    setName("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              placeholder="My Document"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-5 w-5 text-zinc-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {selectedFile.name}
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-zinc-400" />
                  <p className="mt-2 text-sm text-zinc-500">
                    Click to select a PDF file
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
