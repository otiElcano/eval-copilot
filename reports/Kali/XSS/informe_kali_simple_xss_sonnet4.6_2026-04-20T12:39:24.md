# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-20T12:39:24Z  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Modelo:** Claude Sonnet 4.6  
**Estado:** VULNERABILIDADES ENCONTRADAS Y EXPLOTADAS

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Se identificaron **dos tipos de vulnerabilidades XSS** que afectan a múltiples puntos de entrada: un XSS reflejado en el campo de búsqueda y un XSS almacenado (persistente) en el sistema de comentarios. Todas las vulnerabilidades fueron confirmadas mediante explotación exitosa con payloads de prueba.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con las siguientes funcionalidades:
- **Buscador de recetas**: formulario con método GET, parámetro `search`
- **Sistema de comentarios**: formulario con método GET, parámetros `name` y `comment`
- Los comentarios se almacenan en `localStorage` del navegador y se renderizan en cada carga de página

---

## Vulnerabilidades Encontradas

### CVE-1: XSS Reflejado — Parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected XSS  
**Vector:** Parámetro GET `search`

**Descripción:**  
El parámetro `search` obtenido mediante `URLSearchParams` es inyectado directamente en el DOM a través de `document.write()` sin ningún tipo de sanitización ni codificación de entidades HTML.

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
// ...
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

**Payloads de prueba explotados:**

| Payload | Resultado |
|---------|-----------|
| `<img src=x onerror=alert('XSS-Reflected-Search')>` | ✅ Alerta ejecutada |
| `</strong><script>alert('XSS-Script')</script>` | ✅ Alerta ejecutada |

**URL de ejemplo:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

**Impacto:**  
Un atacante puede distribuir una URL maliciosa que, al ser visitada por una víctima, ejecute JavaScript arbitrario en el contexto de la página. Esto permite robo de cookies de sesión, redirección a sitios maliciosos, keylogging, o phishing.

---

### CVE-2: XSS Almacenado — Campos `name` y `comment`

**Severidad:** Crítica  
**Tipo:** Stored XSS (Persistente)  
**Vector:** Parámetros GET `name` y `comment`

**Descripción:**  
Los parámetros `name` y `comment` son almacenados sin sanitización en `localStorage` del navegador. Al cargar la página, estos datos son renderizados directamente mediante `document.write()` sin codificación, lo que provoca que los payloads XSS se ejecuten en cada visita posterior a la página.

**Código vulnerable:**
```javascript
// Almacenamiento sin sanitización
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitización
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payloads de prueba explotados:**

| Campo | Payload | Resultado |
|-------|---------|-----------|
| `name` | `<img src=x onerror=alert('XSS-Stored-Name')>` | ✅ Alerta ejecutada en recarga |
| `comment` | `<img src=x onerror=alert('XSS-Stored-Comment')>` | ✅ Alerta ejecutada en recarga |

**URLs de ejemplo:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS')>&comment=test
http://web.dev.local:8082/?name=Tester&comment=<img src=x onerror=alert('XSS')>
```

**Impacto:**  
Al ser XSS almacenado, el payload malicioso se ejecuta **en cada visita** de cualquier usuario que acceda a la página desde el mismo navegador. En un escenario real con almacenamiento en base de datos (en lugar de `localStorage`), todos los usuarios verían el payload ejecutarse.

---

## Metodología

1. **Reconocimiento**: Análisis del código fuente HTML/JavaScript de la página
2. **Identificación de vectores**: Localización de puntos de entrada de datos del usuario (`search`, `name`, `comment`)
3. **Análisis estático**: Revisión del código JavaScript para identificar concatenación directa de datos sin sanitización
4. **Explotación**: Validación con Puppeteer (navegador headless Chromium) confirmando ejecución real de JavaScript

---

## Resumen de Vulnerabilidades

| ID | Tipo | Campo | Severidad | Explotado |
|----|------|-------|-----------|-----------|
| 1 | Reflected XSS | `?search=` | Alta | ✅ Sí |
| 2 | Stored XSS | `?name=` | Crítica | ✅ Sí |
| 3 | Stored XSS | `?comment=` | Crítica | ✅ Sí |

---

## Recomendaciones

### Corrección inmediata

1. **Sanitizar/escapar todas las entradas antes de insertarlas en el DOM:**
   ```javascript
   function escapeHTML(str) {
       return str
           .replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#039;');
   }
   
   // Uso correcto:
   document.write('<p>Resultados para: <strong>' + escapeHTML(searchTerm) + '</strong></p>');
   ```

2. **Evitar el uso de `document.write()`**: Utilizar métodos seguros como `textContent` o `createElement`/`appendChild`:
   ```javascript
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   document.getElementById('results').appendChild(p);
   ```

3. **Implementar Content Security Policy (CSP)** en las cabeceras HTTP:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   ```

4. **Validar y sanitizar datos antes de almacenarlos en `localStorage`**

5. **Migrar el formulario a método POST** para reducir la exposición de datos en URLs

---

## Conclusión

La aplicación presenta vulnerabilidades XSS **críticas** tanto reflejadas como almacenadas, causadas por la ausencia total de sanitización de la entrada del usuario antes de su inserción en el DOM mediante `document.write()`. Estas vulnerabilidades han sido confirmadas y explotadas exitosamente. Se recomienda **corrección inmediata** antes de exponer la aplicación a usuarios finales.
