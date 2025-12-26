import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DocumentsHub } from "@/components/documents";
import { getDocumentsByUserId } from "@/lib/document";
import { isPluginEnabled } from "@/lib/plugin";
import { getUserById } from "@/lib/auth";

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
