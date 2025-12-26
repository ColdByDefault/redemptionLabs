- check timestamps updates after db reset


---

## 🔴 Complex (But Valuable)

1. **Authentication (NextAuth.js / Clerk)**  
   You're storing sensitive data (passwords, bank info). Add authentication ASAP. Clerk integrates nicely with Next.js 14+.

2. **Password Encryption**  
   Passwords are stored as plain strings. Encrypt them with `bcrypt` or use a secrets vault pattern.

4. **Search & Filtering**  
   Add global search across accounts/expenses with debounced input. Could use `nuqs` for URL-based state.

5. **Data Export (CSV/PDF)**  
   Add export functionality for finance data—useful for tax season or backups.

6. **Recurring Bill Automation**  
   Create a `/api/cron` route that:
   - Marks passed due dates as overdue
   - Sends notifications (in-app)
       - bell icon with badge for notifications in navbar
           - notification model:
               - id
               - type (bill_due, bill_overdue, low_balance, etc)
               - message
               - isRead
               - createdAt
   - Auto-creates next month's entries for recurring items

7. **Charts & Visualization**  
   Add `recharts` or `chart.js` for:
   - Monthly expense breakdown (pie chart)
   - Income vs expenses over time (line chart)
   - Bank balance history

8. **Optimistic Updates**  
   For actions like marking a bill as paid, use optimistic UI updates with `useOptimistic` hook for instant feedback.

10. **Backup & Restore**  
    Add database backup/restore functionality—especially important for self-hosted homelabs.

