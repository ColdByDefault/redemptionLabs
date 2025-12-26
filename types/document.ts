export interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentUpload {
  name: string;
  file: File;
}

export interface DocumentListItem {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}
