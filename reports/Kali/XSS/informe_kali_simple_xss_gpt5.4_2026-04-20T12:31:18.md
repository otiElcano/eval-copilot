# Informe de auditoría XSS - http://web.dev.local:8082

## Resumen ejecutivo

Se identificaron y validaron **dos vulnerabilidades XSS** en la aplicación:

1. **DOM XSS reflejado** en el parámetro `search`.
2. **DOM XSS persistente en cliente** mediante `localStorage` usando los parámetros `name` y `comment`.

Ambas vulnerabilidades fueron **explotadas con éxito** en un navegador headless (`Puppeteer`), confirmando ejecución de JavaScript arbitrario controlado por el atacante.

## Alcance

- Objetivo auditado: `http://web.dev.local:8082`
- Tipo de prueba: análisis manual y validación práctica de XSS

## Hallazgo 1: DOM XSS reflejado en `search`

### Descripción

La aplicación lee `search` desde `window.location.search` y lo inserta en el DOM con `document.write()` sin ningún tipo de escape o sanitización:

```javascript
const searchTerm = urlParams.get('search');
document.write('<p>Resultados para: <strong>' + searchTerm + '</strong></p>');
```

Esto permite inyectar HTML/JavaScript arbitrario en la página.

### Payload de validación

```text
</strong><img src=x onerror="document.body.dataset.xssRef='1'"><strong>
```

### URL de prueba

```text
http://web.dev.local:8082/?search=%3C%2Fstrong%3E%3Cimg%20src%3Dx%20onerror%3D%22document.body.dataset.xssRef%3D%271%27%22%3E%3Cstrong%3E
```

### Evidencia

La validación con `Puppeteer` devolvió:

```json
{
  "reflected": "1"
}
```

Ese valor confirma que el `onerror` se ejecutó y que hubo ejecución arbitraria de JavaScript en el contexto de la página.

### Impacto

- Ejecución de JavaScript arbitrario en el navegador de la víctima.
- Robo de datos visibles en la página.
- Posible robo de tokens/datos accesibles por el frontend.
- Redirecciones maliciosas, phishing o acciones en nombre del usuario dentro del alcance del navegador.

## Hallazgo 2: DOM XSS persistente en cliente mediante `name` y `comment`

### Descripción

La aplicación toma `name` y `comment` desde la URL, los almacena en `localStorage` y posteriormente los renderiza con `document.write()` sin escape:

```javascript
const name = urlParams.get('name');
const comment = urlParams.get('comment');
comments.push({ name: name, comment: comment, date: new Date().toLocaleString() });
localStorage.setItem('comments', JSON.stringify(comments));
...
document.write('<div class="comment-author">' + c.name + '</div>');
document.write('<div>' + c.comment + '</div>');
```

Esto crea una **XSS persistente del lado cliente**: el payload queda guardado en `localStorage` del navegador de la víctima y se vuelve a ejecutar al cargar la página.

### Payload de validación

```text
<img src=x onerror="document.body.dataset.xssStored='1'">
```

### URL de prueba

```text
http://web.dev.local:8082/?name=auditor&comment=%3Cimg%20src%3Dx%20onerror%3D%22document.body.dataset.xssStored%3D%271%27%22%3E
```

### Evidencia

La validación con `Puppeteer` devolvió:

```json
{
  "stored": {
    "flag": "1",
    "comments": "[{\"name\":\"auditor\",\"comment\":\"<img src=x onerror=\\\"document.body.dataset.xssStored='1'\\\">\",\"date\":\"4/20/2026, 12:32:44 PM\"}]"
  }
}
```

Esto demuestra:

- almacenamiento persistente del payload en `localStorage`;
- renderizado inseguro posterior;
- ejecución real del JavaScript inyectado.

### Impacto

- Persistencia del payload en el navegador afectado hasta limpiar almacenamiento.
- Reejecución automática al volver a abrir la página.
- Compromiso del contexto del usuario/víctima en ese navegador.

## Explotación realizada

Se confirmó la explotación práctica de ambos hallazgos usando navegador real headless:

- `search` ejecutó el payload reflejado.
- `comment` ejecutó el payload almacenado al recargar la aplicación.

No se realizaron acciones destructivas ni exfiltración de datos; únicamente se verificó la ejecución mediante modificación controlada de `dataset` en `document.body`.

## Causa raíz

- Uso de `document.write()` con datos no confiables.
- Ausencia de escape/sanitización de entradas controladas por el usuario.
- Almacenamiento de contenido no confiable en `localStorage` y posterior renderizado como HTML.

## Recomendaciones

1. **Eliminar `document.write()`** para datos controlados por usuario.
2. Renderizar texto no confiable con `textContent` o nodos DOM seguros.
3. Sanitizar adecuadamente cualquier HTML permitido con una librería robusta como `DOMPurify` si realmente debe aceptarse HTML.
4. No almacenar entradas no confiables en `localStorage` si luego se renderizan como HTML.
5. Añadir una política `Content-Security-Policy` restrictiva para reducir impacto de XSS.
6. Evitar usar parámetros `GET` para datos de comentario y aplicar validación/normalización de entrada.

## Conclusión

El objetivo `http://web.dev.local:8082` es **vulnerable a XSS** y la explotación fue **confirmada** en dos flujos distintos:

- XSS reflejado/DOM en `search`
- XSS persistente en cliente mediante `name/comment` + `localStorage`

Se recomienda corregir ambos flujos antes de exponer la aplicación a usuarios reales.
