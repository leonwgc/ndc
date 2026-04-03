#!/usr/bin/env node

import { Command } from 'commander';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';

const TEMPLATE_URL = 'https://github.com/leonwgc/neat-admin-template.git';

function run(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(chalk.red(`Command failed: ${command} (exit code: ${code})`)));
      }
    });

    child.on('error', (err) => {
      reject(new Error(chalk.red(`Failed to start command: ${command}\n${err.message}`)));
    });
  });
}

async function init(dir: string): Promise<void> {
  const targetDir = path.resolve(process.cwd(), dir);

  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`Error: Directory already exists: ${targetDir}`));
    process.exit(1);
  }

  const parentDir = path.dirname(targetDir);
  const projectName = path.basename(targetDir);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  console.log(chalk.cyan(`\nCloning codes into ${chalk.bold(targetDir)} ...\n`));
  try {
    await run(
      `git clone --depth 1 ${TEMPLATE_URL} ${projectName}`,
      parentDir
    );
  } catch (err) {
    console.error(chalk.red('Clone failed:'), (err as Error).message);
    process.exit(1);
  }

  // Remove .git and re-initialize
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
  await run('git init', targetDir);

  // Remove docs directory if present
  const docsDir = path.join(targetDir, 'docs');
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
    console.log(chalk.gray('Removed docs directory.'));
  }

  // Update package.json name and description
  const pkgPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;
    pkg.description = projectName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  }

  // Replace HashRouter with BrowserRouter in index.tsx
  const indexTsxPath = path.join(targetDir, 'src', 'index.tsx');
  if (fs.existsSync(indexTsxPath)) {
    let content = fs.readFileSync(indexTsxPath, 'utf-8');
    if (content.includes('HashRouter')) {
      content = content.replace(/HashRouter/g, 'BrowserRouter');
      fs.writeFileSync(indexTsxPath, content, 'utf-8');
    }
  }

  const pm = 'npm';
  console.log(chalk.cyan(`\nInstalling dependencies...\n`));
  try {
    await run(`${pm} install`, targetDir);
  } catch (err) {
    console.error(chalk.red('Install failed:'), (err as Error).message);
    process.exit(1);
  }

  console.log(chalk.green(`\n✅ Project initialized successfully!\n`));
  console.log(chalk.cyan(`\nStarting development server...\n`));
  try {
    await run(`${pm} start`, targetDir);
  } catch (err) {
    console.error(chalk.red('Start failed:'), (err as Error).message);
    process.exit(1);
  }
}

const program = new Command();

program
  .name('ndc')
  .description('Scaffold a neat design admin project from template')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .requiredOption('--dir <directory>', 'Target directory name or path for the new project')
  .action((options) => {
    init(options.dir).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program.parse(process.argv);
