# MCP GitHub Tool Server

Este es un servidor compatible con el protocolo Model Context Protocol (MCP) que expone un conjunto de herramientas para interactuar con la API de GitHub utilizando Node.js, TypeScript y @octokit/rest.

---

## Quickstart

Sigue estos pasos mínimos para instalar y correr el proyecto en modo desarrollo:

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto (ver la sección de Variables de entorno abajo).
3. Ejecutar el servidor:
   Para iniciarlo en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Ejecutar el inspector de MCP (Opcional - Depuración):
   Para probar el servidor visualmente mediante el inspector oficial:
   ```bash
   npx @modelcontextprotocol/inspector npm run dev
   ```
5. Ejecutar los tests:
   Para validar que todo funciona correctamente:
   ```bash
   npm run test
   ```

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en el archivo `.example.env`:

```env
GITHUB_TOKEN=tu_personal_access_token_de_github
```

---

## Catálogo de Tools

El servidor expone las siguientes herramientas compatibles con el cliente MCP:

### 1. list_repositories
Lista los repositorios públicos o privados de un usuario en GitHub.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `username` | string | sí | Nombre de usuario de GitHub |
| `type` | string | no | Tipo de repositorio: `'all'`, `'owner'`, `'member'` (por defecto `'owner'`) |
| `direction`| string | no | Dirección de ordenamiento: `'asc'`, `'desc'` (por defecto `'desc'`) |
| `page` | number | no | Número de página (por defecto `1`) |
| `per_page` | number | no | Cantidad de resultados por página (por defecto `10`) |

* Prompt de ejemplo:
  "Listá los repositorios públicos de samuelbracamonte"
* Outputs: Un array JSON de DTOs limpios con campos esenciales: `full_name`, `description`, `html_url`, `stars`, `open_issues_count`, `language` y `default_branch`.

---

### 2. list_issues
Lista issues de un repositorio específico de GitHub.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `owner` | string | sí | Propietario del repositorio |
| `repo` | string | sí | Nombre del repositorio |
| `state` | string | no | Estado de los issues: `'open'`, `'closed'`, `'all'` (por defecto `'all'`) |
| `direction`| string | no | Dirección de ordenamiento: `'asc'`, `'desc'` (por defecto `'desc'`) |
| `page` | number | no | Número de página (por defecto `1`) |
| `per_page` | number | no | Cantidad de resultados por página (por defecto `5`) |

* Prompt de ejemplo:
  "Mostrame los issues abiertos en el repositorio facebook/react"
* Outputs: Array JSON conteniendo los datos de los issues: `number`, `title`, `description` (cuerpo del issue), `state` y `repository` (URL del issue).

---

### 3. create_repository
Crea un nuevo repositorio en GitHub para el usuario autenticado.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `name` | string | sí | Nombre del nuevo repositorio |
| `description`| string| no | Descripción opcional del repositorio |
| `private` | boolean| no | Indica si el repositorio es privado (por defecto `false`) |

* Prompt de ejemplo:
  "Creá un nuevo repositorio privado llamado mi-proyecto-mcp"
* Outputs: Objeto con los datos del repositorio creado: `name`, `description`, `private` y `url`.

---

### 4. create_file
Crea o actualiza un archivo en una rama específica del repositorio realizando el flujo de commits de Git (Blob -> Tree -> Commit -> Ref Update).

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `owner` | string | sí | Propietario del repositorio |
| `repo` | string | sí | Nombre del repositorio |
| `branch` | string | sí | Nombre de la rama donde commitear |
| `path` | string | sí | Ruta del archivo a crear/modificar (ej. `README.md`) |
| `content` | string | sí | Contenido de texto del archivo |
| `message` | string | sí | Mensaje descriptivo para el commit |

* Prompt de ejemplo:
  "Creá un archivo llamado notas.txt con el contenido 'Hola Mundo' en la rama main del repositorio mi-usuario/mi-repo con el mensaje 'primer commit'"
* Outputs: Objeto con el `commitSha` y la `commitUrl`.

---

### 5. create_issue
Crea una nueva issue en un repositorio de GitHub.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `owner` | string | sí | Propietario del repositorio |
| `repo` | string | sí | Nombre del repositorio |
| `title` | string | sí | Título del issue |
| `body` | string | no | Descripción detallada del issue |
| `assignees`| array | no | Array de nombres de usuarios asignados al issue |
| `labels` | array | no | Array de nombres de etiquetas para aplicar al issue |

* Prompt de ejemplo:
  "Creá un issue en octocat/Hello-World con título Bug X"
* Outputs: Objeto DTO del issue creado: `number`, `title`, `description`, `state` y `repository`.

---

### 6. get_file_content
Obtiene y decodifica el contenido en texto plano de un archivo en el repositorio.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `owner` | string | sí | Propietario del repositorio |
| `repo` | string | sí | Nombre del repositorio |
| `path` | string | sí | Ruta del archivo a leer |

* Prompt de ejemplo:
  "Leé el contenido del archivo package.json de octocat/Hello-World"
* Outputs: Objeto conteniendo el `content` (texto decodificado) y el `sha` del archivo.

---

### 7. create_branch
Crea una nueva rama en un repositorio de GitHub a partir de una rama origen existente.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `owner` | string | sí | Propietario del repositorio |
| `repo` | string | sí | Nombre del repositorio |
| `branch` | string | sí | Nombre de la nueva rama a crear |
| `from_branch`| string| no | Rama origen desde donde crearla (por defecto `'main'`) |

* Prompt de ejemplo:
  "Creá la rama feature/login a partir de main en octocat/Hello-World"
* Outputs: Objeto con la información de la rama creada: `branch`, `sha` y `url` de la rama en GitHub.

---

## Troubleshooting

Aquí tienes los errores más comunes, sus causas y las acciones recomendadas:

| Error Code | Mensaje / Causa Probable | Acción Sugerida |
| :--- | :--- | :--- |
| `AUTH_ERROR` | GITHUB_TOKEN no está configurado en tu `.env` o el token proporcionado ha expirado o no es válido. | Crea o edita el archivo `.env` en la raíz del servidor agregando un token de acceso clásico de GitHub activo con los permisos necesarios (`repo`, `user`). |
| `VALIDATION_ERROR` | El LLM envió parámetros faltantes (ej. omitió el `title` al crear un issue) o valores inválidos. | Corrige los parámetros requeridos según el Catálogo de Tools e intenta llamar a la herramienta nuevamente. |
| `GITHUB_API_ERROR` (404) | El repositorio o recurso indicado no existe, o tu token no tiene permisos de lectura sobre ese repositorio. | Verifica que el nombre del propietario (`owner`), el repositorio (`repo`) y las rutas estén correctamente escritos y que el repositorio sea accesible. |
| `GITHUB_API_ERROR` (403 - Rate Limit) | Se ha excedido la cantidad de llamadas a la API permitidas por GitHub para tu dirección IP/Token en un período de tiempo. | El servidor MCP implementa reintentos automáticos con exponencial backoff para mitigar esto. Si persiste, espera unos minutos o usa un token con más cuota. |
| `NETWORK_ERROR` | Problemas de conectividad locales o caída temporal en los servidores de GitHub. | Verifica tu conexión a internet e inténtalo de nuevo pasados unos segundos. |

---

## Configuración para el servidor de MCP de GitHub para Antigravity

Para registrar este servidor de herramientas en Antigravity, debes editar tu archivo de configuración global `mcp_config.json` que puedes encontrar en la ventana de agente de Antigravity (Ctrl+Alt+B), haciendo clic en `...` y seleccionando `MCP Servers`. Dentro de esta sección, instalar el server de GitHub con tu token (puede pedirte instalar docker). Volver al MCP Store y seleccionar `Manage MCP Servers`.

### Estructura de Configuración

Dentro de `Manage MCP Servers`, reemplaza la estructura predeterminada de GitHub con la siguiente:

```json
{
  "mcpServers": {
    "github-tools": {
      "command": "npx",
      "args": [
        "tsx",
        "Ubicación del servidor.ts en local"
      ],
      "env": {
        "GITHUB_TOKEN": "tu_token_de_github_aqui"
      }
    }
  }
}
```

*Nota: Reemplaza `"tu_token_de_github_aqui"` con tu token de acceso personal de GitHub y "Ubicación del servidor.ts en local" con la ruta absoluta hacia `src/server.ts`.

Ejemplo: C:/Users/Documentos/ProyectoM5_SamBracamonte/src/server.ts