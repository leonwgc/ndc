#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const TEMPLATE_URL = 'https://github.com/leonwgc/ant-admin-template.git';
function run(command, cwd) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');
        const child = (0, child_process_1.spawn)(cmd, args, {
            cwd,
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`命令执行失败: ${command} (退出码: ${code})`));
            }
        });
        child.on('error', (err) => {
            reject(new Error(`命令启动失败: ${command}\n${err.message}`));
        });
    });
}
async function init(dir) {
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
        await run(`git clone --depth 1 ${TEMPLATE_URL} ${projectName}`, parentDir);
    }
    catch (err) {
        console.error('克隆失败:', err.message);
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
    }
    catch (err) {
        console.error('依赖安装失败:', err.message);
        process.exit(1);
    }
    console.log(`\n✅ 项目初始化成功！\n`);
    console.log(`  cd ${dir}`);
    console.log(`  ${pm} dev\n`);
}
const program = new commander_1.Command();
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
