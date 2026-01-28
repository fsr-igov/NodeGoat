# NodeGoat Security Audit - Screenshot Guide

## Prerequisites

### 1. Clone and Setup Repository

```bash
# On Kali VM, open terminal
cd ~/Desktop
git clone https://github.com/OWASP/NodeGoat.git
cd NodeGoat

# Fetch all fix branches
git fetch --all
```

### 2. Start MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name nodegoat-mongo mongo:6
```

### 3. Install Dependencies and Seed Database

```bash
npm install
npm run db:seed
```

### 4. Start Application

```bash
npm start
# Application runs on http://localhost:4000
```

---

## Folder Structure for Images

Create this folder structure:

```
docs/images/
├── owasp-logo.png
├── a1-tutorial-baseline.png
├── a1-eval-code-baseline.png
├── a1-nosql-code-baseline.png
├── a1-eval-code-after.png
├── a1-nosql-code-after.png
├── a1-log-sanitized-after.png
├── a2-tutorial-baseline.png
├── a2-plaintext-password-baseline.png
├── a2-cookie-devtools-baseline.png
├── a2-bcrypt-code-after.png
├── a2-session-regenerate-after.png
├── a2-cookie-devtools-after.png
├── a3-tutorial-baseline.png
├── a3-memos-xss-baseline.png
├── a3-autoescape-baseline.png
├── a3-dompurify-code-after.png
├── a3-xss-blocked-after.png
├── a4-tutorial-baseline.png
├── a4-allocations-code-baseline.png
├── a4-idor-exploit-baseline.png
├── a4-allocations-code-after.png
├── a4-idor-blocked-after.png
├── a5-tutorial-baseline.png
├── a5-helmet-disabled-baseline.png
├── a5-headers-devtools-baseline.png
├── a5-helmet-enabled-after.png
├── a5-headers-devtools-after.png
├── a5-env-vars-after.png
├── a6-tutorial-baseline.png
├── a6-plaintext-dao-baseline.png
├── a6-mongodb-plaintext-baseline.png
├── a6-encryption-code-after.png
├── a6-mongodb-encrypted-after.png
├── a7-tutorial-baseline.png
├── a7-routes-baseline.png
├── a7-benefits-access-baseline.png
├── a7-routes-after.png
├── a7-benefits-denied-after.png
├── a8-tutorial-baseline.png
├── a8-csrf-disabled-baseline.png
├── a8-form-no-token-baseline.png
├── a8-csrf-enabled-after.png
├── a8-form-with-token-after.png
├── a8-csrf-rejected-after.png
├── a9-tutorial-baseline.png
├── a9-package-json-baseline.png
├── a9-npm-audit-baseline.png
├── a9-package-json-after.png
├── a9-npm-audit-after.png
├── a9-lockfile-after.png
├── a10-tutorial-baseline.png
├── a10-redirect-code-baseline.png
├── a10-redirect-exploit-baseline.png
├── a10-redirect-code-after.png
└── a10-redirect-blocked-after.png
```

---

## Screenshot Instructions by Category

### A1 - Injection

#### Baseline (master branch)

```bash
git checkout master
npm install
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a1` -> Full page screenshot | `a1-tutorial-baseline.png` |
| eval() code | VS Code -> Open `app/routes/contributions.js` -> Lines 28-42 -> Screenshot | `a1-eval-code-baseline.png` |
| $where code | VS Code -> Open `app/data/allocations-dao.js` -> Lines 57-84 -> Screenshot | `a1-nosql-code-baseline.png` |

#### After Fix

```bash
git checkout fix/a1-injection-prevention
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Fixed eval() | VS Code -> `app/routes/contributions.js` -> Lines 28-38 | `a1-eval-code-after.png` |
| Fixed NoSQL | VS Code -> `app/data/allocations-dao.js` -> Lines 57-75 | `a1-nosql-code-after.png` |
| Sanitized log | Terminal -> Try login with `user\r\nFAKE:` -> Show sanitized output | `a1-log-sanitized-after.png` |

---

### A2 - Broken Authentication

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a2` | `a2-tutorial-baseline.png` |
| Plaintext password | VS Code -> `app/data/user-dao.js` -> Lines 17-31 | `a2-plaintext-password-baseline.png` |
| Cookie in DevTools | Firefox -> F12 -> Storage -> Cookies -> Screenshot session cookie | `a2-cookie-devtools-baseline.png` |

#### After Fix

```bash
git checkout fix/a2-authentication-session
npm install
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| bcrypt code | VS Code -> `app/data/user-dao.js` -> Show bcrypt.hashSync | `a2-bcrypt-code-after.png` |
| Session regenerate | VS Code -> `app/routes/session.js` -> Show req.session.regenerate | `a2-session-regenerate-after.png` |
| Hardened cookie | Firefox -> F12 -> Storage -> Cookies -> Show HttpOnly, SameSite | `a2-cookie-devtools-after.png` |

---

### A3 - XSS

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a3` | `a3-tutorial-baseline.png` |
| Memos template | VS Code -> `app/views/memos.html` -> Lines 28-34 | `a3-memos-xss-baseline.png` |
| Autoescape config | VS Code -> `server.js` -> Lines 134-142 | `a3-autoescape-baseline.png` |

#### After Fix

```bash
git checkout fix/a3-xss-prevention
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Sanitize code | VS Code -> `server.js` -> Show sanitizeMarkdown function | `a3-dompurify-code-after.png` |
| XSS blocked | Firefox -> Login -> Memos -> Add `<script>alert(1)</script>` -> Show rendered as text | `a3-xss-blocked-after.png` |

---

### A4 - IDOR

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a4` | `a4-tutorial-baseline.png` |
| Allocations code | VS Code -> `app/routes/allocations.js` -> Lines 11-31 | `a4-allocations-code-baseline.png` |
| IDOR exploit | Login as user1 -> Navigate to `/allocations/2` -> Show user2's data | `a4-idor-exploit-baseline.png` |

#### After Fix

```bash
git checkout fix/a4-idor-access-control
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Fixed code | VS Code -> `app/routes/allocations.js` -> Show session userId check | `a4-allocations-code-after.png` |
| Access denied | Login as user1 -> Navigate to `/allocations/2` -> Show 403 | `a4-idor-blocked-after.png` |

---

### A5 - Security Misconfiguration

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a5` | `a5-tutorial-baseline.png` |
| Helmet disabled | VS Code -> `server.js` -> Lines 38-65 (commented) | `a5-helmet-disabled-baseline.png` |
| Missing headers | Firefox -> F12 -> Network -> Select request -> Headers tab | `a5-headers-devtools-baseline.png` |

#### After Fix

```bash
git checkout fix/a5-security-misconfiguration
npm install
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Helmet enabled | VS Code -> `server.js` -> Show helmet configuration | `a5-helmet-enabled-after.png` |
| Security headers | Firefox -> F12 -> Network -> Headers -> Show CSP, X-Frame-Options | `a5-headers-devtools-after.png` |
| Env vars config | VS Code -> `config/env/all.js` -> Show process.env usage | `a5-env-vars-after.png` |

---

### A6 - Sensitive Data Exposure

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a6` | `a6-tutorial-baseline.png` |
| Plaintext DAO | VS Code -> `app/data/profile-dao.js` -> Lines 42-76 | `a6-plaintext-dao-baseline.png` |
| MongoDB data | Terminal -> `mongosh nodegoat` -> `db.users.findOne()` -> Show SSN in plaintext | `a6-mongodb-plaintext-baseline.png` |

#### After Fix

```bash
git checkout fix/a6-sensitive-data
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Encryption code | VS Code -> `app/data/profile-dao.js` -> Show encrypt/decrypt functions | `a6-encryption-code-after.png` |
| Encrypted MongoDB | Terminal -> `mongosh nodegoat` -> `db.users.findOne()` -> Show encrypted SSN | `a6-mongodb-encrypted-after.png` |

---

### A7 - Missing Access Control

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a7` | `a7-tutorial-baseline.png` |
| Routes code | VS Code -> `app/routes/index.js` -> Lines 54-60 | `a7-routes-baseline.png` |
| Benefits access | Login as user1 (not admin) -> Navigate to `/benefits` -> Show access granted | `a7-benefits-access-baseline.png` |

#### After Fix

```bash
git checkout fix/a7-access-control
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Fixed routes | VS Code -> `app/routes/index.js` -> Show isAdmin middleware | `a7-routes-after.png` |
| Access denied | Login as user1 -> Navigate to `/benefits` -> Show 403 Forbidden | `a7-benefits-denied-after.png` |

---

### A8 - CSRF

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a8` | `a8-tutorial-baseline.png` |
| CSRF disabled | VS Code -> `server.js` -> Lines 104-113 (commented) | `a8-csrf-disabled-baseline.png` |
| Form no token | Firefox -> F12 -> Inspector -> View profile form HTML -> No _csrf field | `a8-form-no-token-baseline.png` |

#### After Fix

```bash
git checkout fix/a8-csrf-protection
npm install
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| CSRF enabled | VS Code -> `server.js` -> Show csrf middleware | `a8-csrf-enabled-after.png` |
| Form with token | Firefox -> F12 -> Inspector -> View form -> Show _csrf hidden field | `a8-form-with-token-after.png` |
| CSRF rejected | Use curl without token -> Show 403 response | `a8-csrf-rejected-after.png` |

**Curl command for CSRF test:**
```bash
curl -X POST http://localhost:4000/profile \
  -H "Cookie: sessionId=<your-session-id>" \
  -d "firstName=Hacked" \
  -v
# Should return 403
```

---

### A9 - Vulnerable Components

#### Baseline (master branch)

```bash
git checkout master
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a9` | `a9-tutorial-baseline.png` |
| Package.json | VS Code -> `package.json` -> Dependencies section | `a9-package-json-baseline.png` |
| npm audit | Terminal -> `npm audit` -> Screenshot output | `a9-npm-audit-baseline.png` |

#### After Fix

```bash
git checkout fix/a9-vulnerable-components
npm install
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Updated package | VS Code -> `package.json` -> Show new versions | `a9-package-json-after.png` |
| Clean audit | Terminal -> `npm audit` -> Show reduced vulnerabilities | `a9-npm-audit-after.png` |
| Lockfile diff | Terminal -> `git diff package.json` | `a9-lockfile-after.png` |

---

### A10 - Unvalidated Redirects

#### Baseline (master branch)

```bash
git checkout master
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Tutorial page | Firefox -> `http://localhost:4000/tutorial/a10` | `a10-tutorial-baseline.png` |
| Redirect code | VS Code -> `app/routes/index.js` -> Lines 69-73 | `a10-redirect-code-baseline.png` |
| Redirect exploit | Firefox -> `http://localhost:4000/learn?url=https://evil.com` -> Show redirect | `a10-redirect-exploit-baseline.png` |

#### After Fix

```bash
git checkout fix/a10-redirect-validation
npm start
```

| Screenshot | How to Capture | Filename |
|------------|----------------|----------|
| Fixed code | VS Code -> `app/routes/index.js` -> Show whitelist validation | `a10-redirect-code-after.png` |
| Redirect blocked | Firefox -> `http://localhost:4000/learn?url=https://evil.com` -> Show error | `a10-redirect-blocked-after.png` |

---

## Test Credentials

```
Admin:  admin / Admin_123
User1:  user1 / User1_123
User2:  user2 / User2_123
```

---

## Git Commands Summary

### List All Branches

```bash
git branch -a
```

### Switch Between Branches

```bash
# Baseline screenshots
git checkout master
npm install
npm start

# After-fix screenshots for specific category
git checkout fix/a5-security-misconfiguration
npm install
npm start
```

### View Commit Differences

```bash
# See what changed in a fix
git log --oneline fix/a1-injection-prevention
git show fix/a1-injection-prevention
```

---

## Firefox Screenshot Tips

1. **Full page screenshot**: F12 -> Click camera icon -> "Save full page"
2. **Element screenshot**: F12 -> Inspector -> Right-click element -> "Screenshot Node"
3. **DevTools screenshot**: `Ctrl+Shift+S` while DevTools focused

## VS Code Screenshot Tips

1. Select code region
2. Use Polacode extension or similar for beautiful code screenshots
3. Or simply use system screenshot tool (`Shift+PrtSc` on Linux)

---

## Checklist Before Submission

- [ ] All 50+ screenshots captured
- [ ] Images named exactly as in LaTeX `\includegraphics{}` commands
- [ ] Images placed in `docs/images/` folder
- [ ] LaTeX compiles without missing figure warnings
- [ ] All acceptance criteria have corresponding proof screenshots
- [ ] PDF generated and verified
