import { Subscriptions } from "@/components/subs";
import { Accounts } from "@/components/accounts";
import { Finance } from "@/components/finance";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto space-y-12 px-4 py-8">
        <section>
          <Finance />
        </section>
        <section>
          <Subscriptions />
        </section>
        <section>
          <Accounts />
        </section>
      </main>
    </div>
  );
}
