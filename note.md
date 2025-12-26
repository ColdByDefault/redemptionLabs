- check timestamps updates after db reset


---

## 🔴 Complex (But Valuable)

1. **Authentication (NextAuth.js / Clerk)**  
   You're storing sensitive data (passwords, bank info). Add authentication ASAP. Clerk integrates nicely with Next.js 14+.

2. **Password Encryption**  
   Passwords are stored as plain strings. Encrypt them with `bcrypt` or use a secrets vault pattern.

4. **Search & Filtering**  
   Add global search across accounts/expenses with debounced input. Could use `nuqs` for URL-based state.


