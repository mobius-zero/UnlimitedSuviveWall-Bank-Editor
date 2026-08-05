import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function resolveBasePath(): string {
  const repository = process.env.GITHUB_REPOSITORY;

  if (process.env.GITHUB_ACTIONS !== 'true' || !repository) {
    return '/';
  }

  const [owner, repo] = repository.split('/');
  if (!owner || !repo) {
    throw new Error('GITHUB_REPOSITORY 형식이 올바르지 않습니다.');
  }

  return repo === `${owner}.github.io` ? '/' : `/${repo}/`;
}

export default defineConfig({
  plugins: [react()],
  base: resolveBasePath(),
});
