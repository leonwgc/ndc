#!/usr/bin/env node

import { Command } from 'commander';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const TEMPLATE_URL = 'https://github.com/leonwgc/ant-admin-template.git';

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
        reject(new Error(`命令执行失败: ${command} (退出码: ${code})`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`命令启动失败: ${command}\n${err.message}`));
    });
  });
}

async function init(dir: string): Promise<void> {
  const targetDir = path.resolve(process.cwd(), dir);

  if (fs.existsSync(targetDir)) {
    console.error(`错误: 目录已存在: ${targetDir}`);
    process.exit(1);
  }

  const parentDir = path.dirname(targetDir);
  const projectName = path.basename(targetDir);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  console.log(`\n正在克隆模板到 ${targetDir} ...\n`);
  try {
    await run(
      `git clone --depth 1 ${TEMPLATE_URL} ${projectName}`,
      parentDir
    );
  } catch (err) {
    console.error('克隆失败:', (err as Error).message);
    process.exit(1);
  }

  // 删除 .git 目录，重新初始化
  const gitDir = path.join(targetDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
  await run('git init', targetDir);

  const pm = 'npm';
  console.log(`\n正在使用 ${pm} 安装依赖...\n`);
  try {
    await run(`${pm} install`, targetDir);
  } catch (err) {
    console.error('依赖安装失败:', (err as Error).message);
    process.exit(1);
  }

  console.log(`\n✅ 项目初始化成功！\n`);
  console.log(`  cd ${dir}`);
  console.log(`  ${pm} dev\n`);
}

const program = new Command();

program
  .name('ndc')
  .description('从 ant-admin-template 初始化一个后台管理项目')
  .version('1.0.0');

program
  .command('init')
  .description('初始化新项目')
  .requiredOption('--dir <directory>', '目标项目目录名称或路径')
  .action((options) => {
    init(options.dir).catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
  });

program.parse(process.argv);
