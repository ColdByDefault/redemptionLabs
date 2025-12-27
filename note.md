- check timestamps updates after db reset
- ~~one btn to delete all notifications~~ ✅
- ~~rename middleware to proxy~~ ✅
- ~~include wishlist in trash and backup~~ ✅
- ~~Include userID for backups too, and check if the back up is for the same user that download it~~ ✅

---

## 🔴 Complex (But Valuable)

2. **Password Encryption**  
   Passwords are stored as plain strings. Encrypt them with `bcrypt` or use a secrets vault pattern.

3. **Search & Filtering**  
   Add global search across accounts/expenses with debounced input. Could use `nuqs` for URL-based state.

2
