import 'dotenv/config';
import { Octokit } from '@octokit/rest';

export function createOctokit(): Octokit {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        throw new Error('GITHUB_TOKEN no está configurado en el archivo .env');
    }

    return new Octokit({
        auth: token,
        userAgent: 'mcp-course/1.0',
    });
} 