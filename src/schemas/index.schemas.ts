import { z } from 'zod';

//Buscar usuarios y repositorios first
export const GetUserSchema = z.object({
    username: z.string().min(1, 'El nombre de usuario es requerido'),
});

export type GetUserInput = z.infer<typeof GetUserSchema>;

export const GetRepositorySchema = z.object({
    owner: z.string().min(1, 'El propietario del repositorio es requerido'),
    repo: z.string().min(1, 'El nombre del repositorio es requerido'),
});

export type GetRepositoryInput = z.infer<typeof GetRepositorySchema>;

export const GetFileContentSchema = z.object({
    owner: z.string().min(1, 'El propietario del repositorio es requerido'),
    repo: z.string().min(1, 'El nombre del repositorio es requerido'),
    path: z.string().min(1, 'El camino al archivo es requerido'),
});

export type GetFileContentInput = z.infer<typeof GetFileContentSchema>;

//Listar repositorios e issues
export const ListRepositoriesSchema = z.object({
    username: z.string().min(1, 'El nombre de usuario es requerido'),
    type: z.enum(['all', 'public', 'private']).default('all'),
    direction: z.enum(['asc', 'desc']).default('desc'),
    page: z.number().int().min(1).default(1),
    per_page: z.number().int().min(1).max(100).default(10),
});

export type ListRepositoriesInput = z.infer<typeof ListRepositoriesSchema>;

export const ListIssuesSchema = z.object({
    owner: z.string().min(1, 'El nombre de usuario es requerido'),
    repo: z.string().min(1, 'El nombre del repositorio es requerido'),
    state: z.enum(['open', 'closed', 'all']).default('all'),
    direction: z.enum(['asc', 'desc']).default('desc'),
    page: z.number().int().min(1).default(1),
    per_page: z.number().int().min(1).max(100).default(5),
});

export type ListIssuesInput = z.infer<typeof ListIssuesSchema>;

//Crear repositorios, issues y commits
export const CreateRepositorySchema = z.object({
    owner: z.string().min(1, 'El nombre de usuario es requerido'),
    name: z.string().min(1, 'El nombre del repositorio es requerido'),
    description: z.string().optional(),
    private: z.boolean().default(false),
});

export type CreateRepositoryInput = z.infer<typeof CreateRepositorySchema>;

export const CreateIssueSchema = z.object({
    owner: z.string().min(1, 'El propietario del repositorio es requerido'),
    repo: z.string().min(1, 'El nombre del repositorio es requerido'),
    title: z.string().min(1, 'El título de la issue es requerido'),
    body: z.string().optional(),
    assignees: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
});

export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;

export const CreateCommitSchema = z.object({
    owner: z.string().min(1, 'owner es requerido'),
    repo: z.string().min(1, 'repo es requerido'),
    branch: z.string().min(1, 'branch es requerido'),
    path: z.string().min(1, 'path es requerido'),
    content: z.string(),
    message: z.string().min(1, 'commit message es requerido'),
});

export type CreateCommitInput = z.infer<typeof CreateCommitSchema>;