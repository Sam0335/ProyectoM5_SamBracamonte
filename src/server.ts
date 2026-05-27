import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createOctokit } from './github/octokit.client';
import { listRepositoriesHandler } from './handlers/list-repositories.handler';
import { listIssuesHandler } from './handlers/list-issues.handler';
import { createFileHandler } from './handlers/create-file.handler';
import { createIssueHandler } from './handlers/create-issue.handler';
import { createRepositoryHandler } from './handlers/create-repository.handler';
import { getFileContentHandler } from './handlers/get-file-content.handler';
import { createBranchHandler } from './handlers/create-branch.handler';
import {
    ListRepositoriesSchema,
    CreateCommitSchema,
    GetFileContentSchema,
    ListIssuesSchema,
    CreateIssueSchema,
    CreateRepositorySchema,
    CreateBranchSchema
} from './schemas/index.schemas';

async function main() {
// Crear el servidor
    const server = new McpServer({
	    name: 'mi-mcp-tool',
	    version: '1.0.0',
    });

// Crear el cliente de Octokit
    const octokit = createOctokit();

// Tools registradas
    server.tool(
	    'list_repositories',
      'Lista los repositorios públicos/privados de un usuario de GitHub. Requiere username.',
	    ListRepositoriesSchema.shape,
	    async (input) => {
  	        const result = await listRepositoriesHandler(input, octokit);
  	        return {
    	        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    	        isError: result.isError,
  	        };
	    }
    );

    server.tool(
      'list_issues',
      'Lista issues de un repositorio específico de GitHub. Requiere owner, repo y state (open, closed, all).',
      ListIssuesSchema.shape,
      async (input) => {
        const result = await listIssuesHandler(input, octokit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: result.isError,
        };
      }
    );

    server.tool(
    'create_repository',
    'Crea un nuevo repositorio en GitHub para el usuario autenticado (con los permisos del token). Requiere nombre, descripción (opcional) y estado privado/público.',
    CreateRepositorySchema.shape,
    async (input) => {
        const result = await createRepositoryHandler(input, octokit);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            isError: result.isError,
        };
    }
);

    server.tool(
      'create_file',
      'Usá esta tool para crear o actualizar archivos (por ejemplo, documentación como README.md) en un repositorio y commitear los cambios directamente. NO usar para crear issues ni notas de proyecto.',
      CreateCommitSchema.shape,
      async (input) => {
        const result = await createFileHandler(input, octokit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: result.isError,
        };
      }
    );

    server.tool(
      'create_issue',
      'Crea una nueva issue en un repositorio de GitHub. Requiere owner, repo y title.',
      CreateIssueSchema.shape,
      async (input) => {
        const result = await createIssueHandler(input, octokit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: result.isError,
        };
      }
    );

    server.tool(
      'get_file_content',
      'Obtiene el contenido de un archivo en un repositorio de GitHub. Requiere owner, repo y path.',
      GetFileContentSchema.shape,
      async (input) => {
        const result = await getFileContentHandler(input, octokit);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: result.isError,
        };
      }
    );

server.tool(
    'create_branch',
      'Crea una nueva rama en un repositorio de GitHub a partir de una rama existente. Requiere owner, repo, branch (nombre de la nueva rama) y from_branch (rama origen, por defecto "main").',
      CreateBranchSchema.shape,
    async (input) => {
      const result = await createBranchHandler(input, octokit);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        isError: result.isError,
      };
    }
  );

  // Transporte
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error('Error fatal:', err);
    process.exit(1);
});