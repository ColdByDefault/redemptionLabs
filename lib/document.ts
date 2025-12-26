import { prisma } from "@/lib/prisma";
import type { DocumentListItem } from "@/types/document";

/**
 * Get all documents for a user
 */
export async function getDocumentsByUserId(
  userId: string
): Promise<DocumentListItem[]> {
  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      fileName: true,
      fileSize: true,
      createdAt: true,
    },
  });

  return documents;
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(id: string, userId: string) {
  return prisma.document.findFirst({
    where: { id, userId },
  });
}

/**
 * Create a new document record
 */
export async function createDocument(data: {
  name: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  userId: string;
}) {
  return prisma.document.create({
    data,
  });
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(id: string, userId: string) {
  return prisma.document.delete({
    where: { id, userId },
  });
}

// Re-export utilities for backward compatibility in server code
export {
  formatFileSize,
  isValidPdf,
  isValidFileSize,
  MAX_FILE_SIZE,
} from "@/lib/document-utils";
