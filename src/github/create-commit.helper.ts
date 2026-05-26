import { Octokit } from "@octokit/rest";
import { CreateCommitInput } from "../schemas/index.schemas";

export async function createCommitWithFile(
    octokit: Octokit,
    input: CreateCommitInput
) {
    const { owner, repo, branch, path, content, message } = input;

    // PASO 1: Obtener la ref de  (HEAD de la rama)
    const refResp = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
    });
    const baseCommitSha = refResp.data.object.sha;

    // PASO 2: Obtener el commit base (para sacar el SHA del tree)
    const commitResp = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: baseCommitSha,
    });
    const baseTreeSha = commitResp.data.tree.sha;

    // PASO 3: Crear el blob con el contenido del archivo
    const blobResp = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(content, 'utf8').toString('base64'),
        encoding: 'base64',
    });
    const blobSha = blobResp.data.sha;

    // PASO 4: Crear el nuevo tree con el blob, basado en el tree anterior
    const treeResp = await octokit.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: [
            {
                path,
                mode: '100644',
                type: 'blob',
                sha: blobSha,
            },
        ],
    });
    const newTreeSha = treeResp.data.sha;

    // PASO 5: Crear el commit apuntando al nuevo tree
    const newCommitResp = await octokit.git.createCommit({
        owner,
        repo,
        message,
        tree: newTreeSha,
        parents: [baseCommitSha],
    });
    const newCommitSha = newCommitResp.data.sha;

    // PASO 6: Mover la ref de la rama al nuevo commit
    await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommitSha,
        force: false,
    });

    return {
        commitSha: newCommitSha,
        commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommitSha}`,
    };
}