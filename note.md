- check timestamps updates after db reset
- one btn to delete all notifications
- change middleware to proxy
- include wishlist in trash and backup
- filterId user for backups too
- fix error 
``` bash
PS N:\PRIVATE\Almighty_Proj\redemption> npx prisma generate
[dotenv@17.2.3] injecting env (2) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
Loaded Prisma config from prisma.config.ts.
```

---

## 🔴 Complex (But Valuable)

2. **Password Encryption**  
   Passwords are stored as plain strings. Encrypt them with `bcrypt` or use a secrets vault pattern.

4. **Search & Filtering**  
   Add global search across accounts/expenses with debounced input. Could use `nuqs` for URL-based state.


