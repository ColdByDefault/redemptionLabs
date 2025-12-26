import { getDeletedItems } from "@/actions/trash";
import { TrashTable } from "@/components/trash";

export default async function TrashPage(): Promise<React.ReactElement> {
  const deletedItems = await getDeletedItems();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trash</h1>
        <p className="text-muted-foreground mt-1">
          Deleted items can be restored or permanently removed
        </p>
      </div>

      <TrashTable data={deletedItems} />
    </div>
  );
}
