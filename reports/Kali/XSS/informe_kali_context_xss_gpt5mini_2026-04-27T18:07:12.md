VULN_FOUND: false
VULN_EXPLOITED: false

# XSS Audit Report
Target: http://web.dev.local:8082

Links tested:
<form method="GET" action="

Findings:

Payloads used:

Commands executed:
curl -s -L 'http://web.dev.local:8082' -o home.html
Custom scripted injection checks for query params and User-Agent header.
