import { getEmailsWithAccounts, getAccountsWithEmail } from "@/actions/account";
import { getBanks } from "@/actions/finance";
import { EmailsBoard, SubsBoard } from "@/components/accounts";

export default async function AccountsPage(): Promise<React.ReactElement> {
  const [emails, accounts, banks] = await Promise.all([
    getEmailsWithAccounts(),
    getAccountsWithEmail(),
    getBanks(),
  ]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Accounts</h1>
        <p className="text-muted-foreground">
          Manage your emails and linked accounts
        </p>
      </div>
      <EmailsBoard emails={emails} />
      <SubsBoard accounts={accounts} emails={emails} banks={banks} />
    </div>
  );
}
