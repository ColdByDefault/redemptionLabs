import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDocumentsByUserId } from "@/lib/document";
import { isPluginEnabled, isPluginInstalled } from "@/lib/plugin";
import { getUserById } from "@/lib/auth";

// Try to import from plugin package, fallback to local components
let DocumentsHub: React.ComponentType<{ documents: unknown[] }>;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const plugin = require("@coldbydefault/plugin-documents-hub");
  DocumentsHub = plugin.DocumentsHub;
} catch {
  // Fallback to local components during development
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DocumentsHub = require("@/components/documents").DocumentsHub;
}

export default async function DocumentsPage(): Promise<React.ReactElement> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch fresh plugin data from database
  const user = await getUserById(session.user.id);
  if (!user) {
    redirect("/login");
  }

  // Check if plugin is installed
  if (!isPluginInstalled("documents-hub")) {
    redirect("/marketplace?install=documents-hub");
  }

  // Check if user has this plugin enabled
  if (!isPluginEnabled("documents-hub", user.enabledPlugins)) {
    redirect("/marketplace");
  }

  const documents = await getDocumentsByUserId(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentsHub documents={documents} />
    </div>
  );
}
