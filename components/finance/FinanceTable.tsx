import type { Transaction } from "@/types/finance";
import {
  formatCurrency,
  getMonthlyAmount,
  getTypeVariant,
  getFrequencyVariant,
} from "@/lib/finance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FinanceTableProps {
  transactions: Transaction[];
}

export function FinanceTable({ transactions }: FinanceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Monthly</TableHead>
          <TableHead>Due Day</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.name}</TableCell>
            <TableCell>
              <Badge variant={getTypeVariant(transaction.type)}>
                {transaction.type}
              </Badge>
            </TableCell>
            <TableCell className="capitalize">{transaction.category}</TableCell>
            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
            <TableCell>
              <Badge variant={getFrequencyVariant(transaction.frequency)}>
                {transaction.frequency}
              </Badge>
            </TableCell>
            <TableCell>
              {formatCurrency(
                getMonthlyAmount(transaction.amount, transaction.frequency)
              )}
            </TableCell>
            <TableCell>{transaction.dueDay}</TableCell>
            <TableCell className="max-w-50 truncate">
              {transaction.notes}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
