"use server";

import { auth } from "@/auth";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocumentsByUserId,
  isValidPdf,
  isValidFileSize,
  MAX_FILE_SIZE,
} from "@/lib/document";
import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "uploads/documents";

export async function getDocumentsAction() {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const documents = await getDocumentsByUserId(session.user.id);
    return { documents };
  });
}

export async function uploadDocumentAction(formData: FormData) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file) {
      throw new Error("No file provided");
    }

    if (!name || name.trim().length === 0) {
      throw new Error("Document name is required");
    }

    // Validate file type
    if (!isValidPdf(file)) {
      throw new Error("Only PDF files are allowed");
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      throw new Error(
        `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Create upload directory if it doesn't exist
    const uploadPath = path.join(
      process.cwd(),
      "public",
      UPLOAD_DIR,
      session.user.id
    );
    await mkdir(uploadPath, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}-${safeFileName}`;
    const filePath = path.join(uploadPath, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    const document = await createDocument({
      name: name.trim(),
      fileName: file.name,
      fileSize: file.size,
      filePath: `/${UPLOAD_DIR}/${session.user.id}/${fileName}`,
      mimeType: file.type,
      userId: session.user.id,
    });

    revalidatePath("/documents");

    return { document };
  });
}

export async function deleteDocumentAction(documentId: string) {
  return safeAction(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Not authenticated");
    }

    // Get document to find file path
    const document = await getDocumentById(documentId, session.user.id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), "public", document.filePath);
      await unlink(filePath);
    } catch {
      // File might not exist, continue with database deletion
      console.warn("Could not delete file from disk:", document.filePath);
    }

    // Delete from database
    await deleteDocument(documentId, session.user.id);

    revalidatePath("/documents");

    return { success: true };
  });
}
