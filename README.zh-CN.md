# neat-admin-cli

一个基于 Node.js 的 CLI 工具，用于从 [ant-admin-template](https://github.com/leonwgc/ant-admin-template) 模板快速初始化 Ant Design 后台管理项目。

[English](./README.md)

## 安装

```bash
npm install -g neat-admin-cli
```

或通过 `npx` 直接使用（无需全局安装）：

```bash
npx neat-admin-cli init --dir my-admin-project
```

## 使用方法

```bash
neat-admin-cli init --dir <目录>
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `--dir <目录>` | 新项目的目标目录名称或路径（必填） |
| `-V, --version` | 输出版本号 |
| `-h, --help` | 显示帮助信息 |

### 示例

```bash
# 在当前目录下创建项目
neat-admin-cli init --dir my-admin-project

# 指定绝对路径创建项目
neat-admin-cli init --dir /path/to/my-admin-project
```

初始化完成后，工具会依次执行：

1. 使用 `git clone --depth 1` 克隆模板仓库
2. 删除原始 `.git`，重新初始化为全新 git 仓库
3. 使用 `npm install` 自动安装依赖

然后启动开发服务器：

```bash
cd my-admin-project
npm run dev
```

## 模板介绍

项目模板基于 [ant-admin-template](https://github.com/leonwgc/ant-admin-template)，包含以下技术栈：

- React + TypeScript
- Ant Design 组件库
- gdn-pack 构建工具
- 路由与布局结构

## License

MIT
