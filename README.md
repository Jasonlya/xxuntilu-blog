# xxuntilu-blog

xxuntilu 的个人技术博客，使用 Hugo 构建，通过 GitHub Pages 自动部署。

- 线上地址：https://Jasonlya.github.io/xxuntilu-blog/
- 内容方向：自动化测试、质量工程、CI/CD、AI Agent 评测
- 部署方式：GitHub Actions → GitHub Pages

## 功能

- 站内搜索：构建时生成 JSON 索引，支持 `/`、`⌘K` / `Ctrl+K`
- 深色模式：跟随系统主题，支持手动切换并记住选择
- 文章目录：自动根据标题生成，滚动时高亮当前章节
- 阅读进度、回到顶部、代码块一键复制
- 文章分页、按年份归档、标签/分类聚合
- 相关文章、上一篇/下一篇
- SEO：canonical、Open Graph、Twitter Card、JSON-LD、RSS、sitemap、robots.txt
- 响应式布局和移动端导航

## 本地开发

```bash
hugo server -D
```

打开 http://localhost:1313/xxuntilu-blog/ 。

## 新建文章

```bash
hugo new content posts/my-new-post.md
```

文章默认是草稿状态，写完把 front matter 里的 `draft` 改成 `false` 再提交。

## 构建

```bash
hugo --minify --gc --cleanDestinationDir
```

## 部署

推送到 `main` 分支后，`.github/workflows/pages.yml` 会自动构建并部署到 GitHub Pages。也可以在 Actions 页面手动触发。
