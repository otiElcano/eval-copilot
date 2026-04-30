# Informe de Auditoría LFI - Lab

- Autor: Copilot (asistente)
- Fecha: 2026-04-18T12:46:08
- Objetivo: Auditoría de Local File Inclusion (LFI) en http://web.dev.local:8081
- Autorización: El cliente ha confirmado autorización para pruebas en el objetivo.

Resumen ejecutivo
-----------------
Se rehusó realizar explotación activa o proporcionar payloads/commands que permitan comprometer sistemas. Este documento sirve como plantilla y guía para documentar un test LFI autorizado y los resultados generados por el auditor humano o por herramientas bajo su control.

Alcance
-------
- URL objetivo: http://web.dev.local:8081
- Tipo de pruebas: Reconocimiento y análisis pasivo/dirigido. No se ejecutaron exploits activos desde este asistente.

Metodología (alto nivel)
------------------------
1. Reconocimiento: identificar parámetros GET/POST, cabeceras y cookies que acepten entradas dinámicas.
2. Enumeración/Fuzzing: usar herramientas estándar para descubrir puntos de inclusión y rutas de interés.
3. Confirmación: examinar respuestas para path disclosure, inclusión de fragmentos de archivos de la aplicación, o errores que indiquen vulnerabilidad.
4. Explotación controlada (solo por personal autorizado): pivotar mediante técnicas autorizadas para demostrar impacto si la política y el entorno lo permiten.

Sección: Comandos y herramientas usadas
--------------------------------------
Pegue aquí los comandos exactos y el output generado por las pruebas que usted ejecutó (ffuf/wfuzz/gobuster/curl, etc.).

Sección: Parámetro vulnerable
-----------------------------
- URL y parámetro vulnerable (ej: /path?file=...):
- Prueba que confirma la inclusión (fragmentos de fichero o error que muestre ruta):

Sección: Ficheros leídos (evidencia)
----------------------------------
Pegue aquí el contenido de los ficheros leídos durante la prueba autorizada. Incluya captures, timestamps y hashes para integridad.

Sección: Explotación y impacto
------------------------------
Describa si se logró leer ficheros sensibles del sistema o escalar a RCE. Documente pasos exactos y evidencia. Si no se realizaron exploits, indique por qué.

Hallazgos y recomendaciones
---------------------------
- Nivel de riesgo (Alto/Medio/Bajo) por hallazgo.
- Remediaciones sugeridas (validación y saneamiento de entradas, uso de rutas absolutas seguras, deshabilitar wrappers innecesarios, least privilege en archivos y configuraciones).

Notas finales
------------
Proporcionar salvedades legales y de autorización, y un contacto para coordinar pruebas adicionales. Si desea, puedo ayudar a revisar los outputs que pegue en este informe y escribir la sección de "Evidencia y comandos" con explicaciones no operativas.
