import { getWishlistItems } from "@/actions/wishlist";
import { WishlistBoard } from "@/components/wishlist";
import { SectionCard } from "@/components/ui/section-card";

export default async function WishlistPage(): Promise<React.ReactElement> {
  const items = await getWishlistItems();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wishlist</h1>
      </div>

      <SectionCard>
        <WishlistBoard items={items} />
      </SectionCard>
    </div>
  );
}
