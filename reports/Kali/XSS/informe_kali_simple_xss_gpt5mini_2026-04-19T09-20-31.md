# Informe de análisis XSS - 2026-04-19T09:20:31

Objetivo: http://web.dev.local:8082

Payload probado: <script>alert(1)</script>

Vulnerabilidades detectadas: 0

Detalles:

">

Resultados del escaneo:

FORM GET: http://web.dev.local:8082?search=%3Cscript%3Ealert%281%29%3C%2Fscript%3E -- REFLECTED: False
FORM GET: http://web.dev.local:8082?name=%3Cscript%3Ealert%281%29%3C%2Fscript%3E&comment=%3Cscript%3Ealert%281%29%3C%2Fscript%3E -- REFLECTED: False
FORM GET: http://web.dev.local:8082?name=%3Cscript%3Ealert%281%29%3C%2Fscript%3E&comment=%3Cscript%3Ealert%281%29%3C%2Fscript%3E -- REFLECTED: False
BASE TEST: http://web.dev.local:8082?q=<script>alert(1)</script> -- REFLECTED: False
