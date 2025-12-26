import { getEmailsWithAccounts, getAccountsWithEmail } from "@/actions/account";
import { getBanks, getSectionTimestamps } from "@/actions/finance";
import { EmailsBoard, SubsBoard } from "@/components/accounts";
import { SectionCard } from "@/components/ui/section-card";

export default async function AccountsPage(): Promise<React.ReactElement> {
  const [emails, accounts, banks, timestamps] = await Promise.all([
    getEmailsWithAccounts(),
    getAccountsWithEmail(),
    getBanks(),
    getSectionTimestamps(),
  ]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounts</h1>
      </div>

      <SectionCard>
        <EmailsBoard emails={emails} updatedAt={timestamps.emails} />
      </SectionCard>

      <SectionCard>
        <SubsBoard
          accounts={accounts}
          emails={emails}
          banks={banks}
          updatedAt={timestamps.accounts}
        />
      </SectionCard>
    </div>
  );
}
