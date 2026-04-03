# neat-admin-cli

A CLI tool to scaffold an Ant Design admin project from the [ant-admin-template](https://github.com/leonwgc/ant-admin-template) GitHub template.

[中文文档](./README.zh-CN.md)

## Installation

```bash
npm install -g neat-admin-cli
```

Or use it directly via `npx`:

```bash
npx neat-admin-cli init --dir my-admin-project
```

## Usage

```bash
neat-admin-cli init --dir <directory>
```

### Options

| Option | Description |
|--------|-------------|
| `--dir <directory>` | Target directory name or path for the new project (required) |
| `-V, --version` | Output the version number |
| `-h, --help` | Display help information |

### Example

```bash
# Create a project in the current directory
neat-admin-cli init --dir my-admin-project

# Create a project at an absolute path
neat-admin-cli init --dir /path/to/my-admin-project
```

After initialization, the tool will:

1. Clone the template with `git clone --depth 1`
2. Re-initialize a clean git repository
3. Install dependencies with `npm install`

Then start the development server:

```bash
cd my-admin-project
npm run dev
```

## Template

The project template is based on [ant-admin-template](https://github.com/leonwgc/ant-admin-template), which includes:

- React + TypeScript
- Ant Design component library
- gdn-pack build tool
- Routing & layout setup

## License

MIT
