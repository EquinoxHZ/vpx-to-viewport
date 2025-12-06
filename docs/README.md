# VPX to VW Demo Page

这是 `postcss-vpx-to-vw` 插件的交互式演示页面。

## 🌐 在线演示

访问: [https://equinoxhz.github.io/vpx-to-viewport/](https://equinoxhz.github.io/vpx-to-viewport/)

## 📋 功能特性

- 🎛️ **实时调整参数**: 可以动态调整视口宽度、基准视口、测试值等参数
- 📊 **单位效果对比**: 直观展示 5 种单位（vpx, maxvpx, minvpx, cvpx, linear-vpx）的转换效果
- 📈 **响应式曲线图**: 可视化不同单位在不同视口宽度下的表现
- 💻 **代码示例**: 实时生成输入和输出的 CSS 代码
- 📖 **详细文档**: 每个单位的说明和使用场景

## 🚀 本地运行

1. 克隆仓库：
```bash
git clone https://github.com/EquinoxHZ/vpx-to-viewport.git
cd vpx-to-viewport
```

2. 在 `docs` 目录下启动本地服务器：
```bash
cd docs
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve

# 或使用 PHP
php -S localhost:8000
```

3. 在浏览器中访问 `http://localhost:8000`

## 📦 部署到 GitHub Pages

### 方法 1: 通过 GitHub 设置（推荐）

1. 将代码推送到 GitHub 仓库
2. 进入仓库的 Settings → Pages
3. 在 "Source" 部分选择：
   - Branch: `main` (或你的默认分支)
   - Folder: `/docs`
4. 点击 "Save"
5. 等待几分钟，GitHub 会自动部署

### 方法 2: 通过 GitHub Actions

如果你想使用 GitHub Actions 自动部署，可以创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 🛠️ 文件结构

```
docs/
├── index.html    # 主页面
├── styles.css    # 样式文件
├── script.js     # 交互逻辑
└── README.md     # 说明文档
```

## 🎨 自定义

你可以通过修改以下文件来自定义演示页面：

- **`styles.css`**: 修改颜色、布局、字体等样式
- **`script.js`**: 修改计算逻辑、图表绘制等功能
- **`index.html`**: 修改页面结构、内容等

## 📝 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件
