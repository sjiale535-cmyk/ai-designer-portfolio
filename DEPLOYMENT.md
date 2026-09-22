# GitHub Pages 发布

网站源代码与浏览器资源可以公开发布。不要上传个人简历文档、原始视频备份、工具依赖和本地验收目录。

1. 创建 GitHub 仓库，建议命名 `ai-designer-portfolio`。
2. 仅上传 `.github`、`src`、`public`、`scripts`、`.gitignore`、`index.html`、`package.json`、`pnpm-lock.yaml`、`vite.config.js`、`README.md`、`DEPLOYMENT.md`。
3. 在仓库 Settings → Pages，将 Source 设置为 GitHub Actions。
4. 推送到 `main`，或在 Actions 中手动运行 Deploy portfolio to GitHub Pages。
5. 工作流成功后，通过部署记录的网页地址访问作品集。

工作流自动配置仓库子路径。`public/web-videos` 保存网页压缩视频；`.video-originals` 保存本地原始视频备份，不上传。

本地启动：`pnpm dev`。构建：`pnpm build`。

甲骨文体验部署到 `oracle/` 子目录。摄像头仅在用户主动开启并授权后使用。
