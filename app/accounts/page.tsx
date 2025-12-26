import { getEmailsWithAccounts, getAccountsWithEmail } from "@/actions/account";
import { EmailsBoard, SubsBoard } from "@/components/accounts";

export default async function AccountsPage(): Promise<React.ReactElement> {
  const [emails, accounts] = await Promise.all([
    getEmailsWithAccounts(),
    getAccountsWithEmail(),
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
      <SubsBoard accounts={accounts} emails={emails} />
    </div>
  );
}
