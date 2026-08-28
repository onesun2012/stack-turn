import { defineConfig } from 'vite';

// GitHub Pages 项目站点部署在子路径下，base 必须与仓库名一致
export default defineConfig({
  base: '/stack-turn/',
  build: { target: 'es2020' },
});