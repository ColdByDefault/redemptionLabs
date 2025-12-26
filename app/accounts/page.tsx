import { getEmailsWithAccounts, getAccountsWithEmail } from "@/actions/account";
import { getBanks, getSectionTimestamps } from "@/actions/finance";
import { EmailsBoard, SubsBoard } from "@/components/accounts";

export default async function AccountsPage(): Promise<React.ReactElement> {
  const [emails, accounts, banks, timestamps] = await Promise.all([
    getEmailsWithAccounts(),
    getAccountsWithEmail(),
    getBanks(),
    getSectionTimestamps(),
  ]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Accounts</h1>
        <p className="text-muted-foreground">
          Manage your emails and linked accounts
        </p>
      </div>
      <EmailsBoard emails={emails} updatedAt={timestamps.emails} />

      <hr className="border-border" />

      <SubsBoard
        accounts={accounts}
        emails={emails}
        banks={banks}
        updatedAt={timestamps.accounts}
      />
    </div>
  );
}
