# xxuntilu-blog

xxuntilu 的个人技术博客，使用 Hugo 构建，通过 GitHub Actions 自动部署到 GitHub Pages。

- 线上地址：https://jasonlya.github.io/xxuntilu-blog/
- 内容方向：自动化测试、质量工程、CI/CD、AI Agent 评测
- 部署方式：GitHub Actions → GitHub Pages

## 功能

- 编辑型博客首页：最新文章、文章流、作者侧栏、主题和归档
- 站内搜索：构建时生成 JSON 索引，支持 `/`、`⌘K` / `Ctrl+K`
- 深色模式、阅读进度、回到顶部、代码块复制
- 文章目录、相关文章、上一篇/下一篇
- 文章分页、按年份归档、标签/分类聚合
- Web 写作后台：Pages CMS 可视化新增、编辑、删除和发布文章
- SEO：canonical、Open Graph、Twitter Card、JSON-LD、RSS、sitemap、robots.txt

## 在浏览器里写文章

仓库根目录的 `.pages.yml` 是 [Pages CMS](https://app.pagescms.org) 配置。首次使用时：

1. 打开 https://app.pagescms.org 并用 GitHub 登录。
2. 安装 Pages CMS GitHub App，授权 `Jasonlya/xxuntilu-blog` 仓库。
3. 选择仓库，进入“文章”集合，即可新增、编辑、删除文章。
4. 新文章默认是草稿；把“草稿”关掉并保存后，GitHub Actions 会自动构建发布。

在后台里可以直接设置标题、发布日期、摘要、分类、标签、封面图和正文，不需要手改 Markdown。每次保存都会向 GitHub 提交一次 commit，随后 Pages 自动重新部署。

## 本地开发

```bash
hugo server -D
```

打开 http://localhost:1313/xxuntilu-blog/ 。

## 手动新建文章

```bash
hugo new content posts/my-new-post.md
```

文章默认是草稿。常用 front matter：

```yaml
---
title: "文章标题"
date: 2026-10-20T09:00:00+08:00
draft: false
featured: false
categories:
  - 自动化测试
tags:
  - pytest
description: "显示在列表和搜索结果里的摘要。"
cover: ""
---
```

`featured: true` 会让文章优先成为首页推荐；`cover` 可选，图片放在 `static/images/`，填写 `/images/your-image.jpg`。

## 构建与部署

```bash
hugo --minify --gc --cleanDestinationDir
```

推送到 `main` 分支后，`.github/workflows/pages.yml` 会自动构建并部署。也可以在 GitHub Actions 页面手动触发。

如果线上根路径显示 RSS，而不是首页，检查：

1. GitHub Actions 是否成功。
2. 仓库 Settings → Pages 的 Source 是否为 **GitHub Actions**。
3. 最近一次部署是否包含 `public/index.html`。
