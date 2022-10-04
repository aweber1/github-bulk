import prompts from 'prompts';
import { Octokit } from 'octokit';
import { config } from 'dotenv';

config();

const octokit = new Octokit({ auth: process.env.BULK_GH_TOKEN });

start();

async function start() {
  const repos = await getRepos();

  const response = await prompts({
    type: 'multiselect',
    name: 'Repos to delete',
    message: 'Select repos to delete',
    choices: repos.data.map((repo) => {
      return {
        title: repo.name,
        description: repo.url,
        value: {
          name: repo.name,
          owner: repo.owner.login,
        },
      };
    }),
    hint: 'Space to select, Return to submit',
  });

  const deleteOps = response['Repos to delete'].map((repo: RepoInfo) => {
    console.log('deleting repo', repo);
    return deleteRepo(repo);
  });
  await Promise.all(deleteOps);

  console.log('success!');
}

interface RepoInfo {
  name: string;
  owner: string;
}

async function getRepos() {
  const repos = await octokit.rest.repos.listForAuthenticatedUser({ per_page: 100 });
  return repos;
}

async function deleteRepo(repo: RepoInfo) {
  return await octokit.rest.repos.delete({
    owner: repo.owner,
    repo: repo.name,
  });
}
