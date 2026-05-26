import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createOctokit } from './github/octokit.client';
import { listRepositoriesHandler } from './handlers/list-repositories';
import { listIssuesHandler } from './handlers/list-issues';
import { createFileHandler } from './handlers/create-file.handler';
import { getFileContentHandler } from './handlers/get-file-content.handler';
import { CreateBranchSchema } from './schemas/create-branch.schema';
import { createBranchHandler } from './handlers/create-branch.handler';
import { createIssueHandler } from './handlers/create-issue';
import { createRepositoryHandler } from './handlers/create-repository.handler';
import {
    ListRepositoriesSchema,
    CreateCommitSchema,
    GetFileContentSchema,
    ListIssuesSchema,
    CreateIssueSchema,
    CreateRepositorySchema
} from './schemas/index.schemas';

async function main() {
  // PASO 1: Crear el servidor
    const server = new McpServer({
	    name: 'mi-mcp-tool',
	    version: '1.0.0',
    });

  // PASO 2: Crear el cliente de Octokit
    const octokit = createOctokit();

  // PASO 3: Registrar la tool
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
      'Lista issues de un repositorio de GitHub. Requiere owner, repo y state.',
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
    'Crea un nuevo repositorio en GitHub para el usuario autenticado. Requiere nombre, descripción (opcional) y estado privado/público.',
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

server.registerTool(
    'create_branch',
    {
      description: 'Crea una nueva rama en un repositorio de GitHub a partir de una rama existente. Requiere owner, repo, branch (nombre de la nueva rama) y from_branch (rama origen, por defecto "main").',
      inputSchema: CreateBranchSchema.shape,
    },
    async (input) => {
      const result = await createBranchHandler(input, octokit);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        isError: result.isError,
      };
    }
  );

    console.error('Server MCP iniciado con tool: list_repositories');

  // PASO 4: Conectar transporte
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((err) => {
    console.error('Error fatal:', err);
    process.exit(1);
});
