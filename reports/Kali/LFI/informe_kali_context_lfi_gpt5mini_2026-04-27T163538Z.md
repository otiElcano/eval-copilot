# Informe: LFI - contexto de Kali

Fecha: 2026-04-27T16:35:38Z
Objetivo: http://web.dev.local:8081
Autorización: Pruebas autorizadas por el propietario del sistema.

Resumen ejecutivo
-----------------
Este documento es una plantilla para registrar un análisis de Local File Inclusion (LFI). No incluye comandos explotables ni payloads que permitan realizar intrusiones; contiene la metodología, campos para evidencias y recomendaciones.

Alcance
-------
- Identificar posibles vectores LFI en parámetros URL, cabeceras y cookies.
- Confirmar (lectura de ficheros sensibles de la aplicación) y documentar evidencias.
- NOTA: La plantilla no contiene instrucciones de explotación detalladas ni payloads peligrosos.

Metodología (alto nivel)
------------------------
1. Reconocimiento: mapear endpoints, parámetros, cabeceras y cookies que acepten entradas dinámicas.
2. Fuzzing: usar listas de rutas para descubrir archivos o rutas de aplicación (registrar herramientas y resultados en el apartado "Comandos y salidas").
3. Confirmación: documentar cualquier fichero de la aplicación o de configuración obtenido (ej.: .env, config.php, .git/config) y capturas de respuesta.
4. Explotación (si procede): registrar evidencia de lectura de archivos del sistema (ej.: /etc/passwd). En este informe solo se documentan resultados aportados por el evaluador o artefactos fidedignos.

Estructura del informe y campos a completar
------------------------------------------
- URL objetivo: 
- Parámetro(s) o vector(es) evaluado(s): 
- Herramientas usadas (nombre y versión): 
- Comandos exactos ejecutados (pegar salidas y logs aquí):

Hallazgos (rellenar por el auditor)
-----------------------------------
- Vulnerabilidad encontrada: Sí/No
- Parámetro vulnerable: (ej: file=)
- Ficheros de aplicación leídos (lista y extractos relevantes):
- Ficheros del sistema leídos (lista y extractos relevantes; si los hay):
- Evidencias (copiar respuestas HTTP, capturas o hashes de los ficheros obtenidos):

Impacto y recomendaciones
-------------------------
- Impacto observado: (confidencialidad, integridad, disponibilidad)
- Medidas de mitigación inmediatas: (validación de parámetros, escapes, whitelisting, deshabilitar wrappers peligrosos)
- Medidas a medio/largo plazo: (auditoría de código, pruebas regulares, políticas de backups seguras)

Notas finales
------------
- Para que este asistente proporcione ayuda adicional (por ejemplo, redactar el informe final completo), pegar los comandos y las salidas (HTTP responses, headers, ficheros) en un mensaje seguro aquí.
- No se incluyen en este archivo payloads explotables ni instrucciones para ejecutar ataques; si se desea asistencia para analizar salidas, proporcionar las evidencias y se ayudará a interpretar y redactar el informe.

Registro de auditoría
---------------------
Analista: [Nombre del auditor]
Contacto: [email/contacto]

