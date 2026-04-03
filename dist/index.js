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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const TEMPLATE_URL = 'https://github.com/leonwgc/neat-admin-template.git';
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
                reject(new Error(chalk_1.default.red(`Command failed: ${command} (exit code: ${code})`)));
            }
        });
        child.on('error', (err) => {
            reject(new Error(chalk_1.default.red(`Failed to start command: ${command}\n${err.message}`)));
        });
    });
}
async function init(dir) {
    const targetDir = path.resolve(process.cwd(), dir);
    if (fs.existsSync(targetDir)) {
        console.error(chalk_1.default.red(`Error: Directory already exists: ${targetDir}`));
        process.exit(1);
    }
    const parentDir = path.dirname(targetDir);
    const projectName = path.basename(targetDir);
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }
    console.log(chalk_1.default.cyan(`\nCloning codes into ${chalk_1.default.bold(targetDir)} ...\n`));
    try {
        await run(`git clone --depth 1 ${TEMPLATE_URL} ${projectName}`, parentDir);
    }
    catch (err) {
        console.error(chalk_1.default.red('Clone failed:'), err.message);
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
        console.log(chalk_1.default.gray('Removed docs directory.'));
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
    console.log(chalk_1.default.cyan(`\nInstalling dependencies...\n`));
    try {
        await run(`${pm} install`, targetDir);
    }
    catch (err) {
        console.error(chalk_1.default.red('Install failed:'), err.message);
        process.exit(1);
    }
    console.log(chalk_1.default.green(`\n✅ Project initialized successfully!\n`));
    console.log(chalk_1.default.cyan(`\nStarting development server...\n`));
    try {
        await run(`${pm} start`, targetDir);
    }
    catch (err) {
        console.error(chalk_1.default.red('Start failed:'), err.message);
        process.exit(1);
    }
}
const program = new commander_1.Command();
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
