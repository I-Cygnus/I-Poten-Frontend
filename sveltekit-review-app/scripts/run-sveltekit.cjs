#!/usr/bin/env node
/* scripts/run-sveltekit.cjs
 * - 1) @sveltejs/kit package.json bin 실행
 * - 2) 실패/Invalid command면 dist/cli.js 직접 실행 (권장 경로)
 * - 3) 그래도 안 되면 .bin/svelte-kit(.cmd) 최후 시도
 * - 실행에 사용된 경로와 kit 버전을 콘솔에 로그해 디버그 쉽게
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function resolveKitPkgJson() {
    // sveltekit-review-app 워크스페이스 기준 → 루트로 상향탐색
    // (호이스팅/워크스페이스 환경에서도 확실히 kit 패키지를 집도록)
    const hints = [process.cwd(), path.resolve(__dirname, '..')];
    for (const hint of hints) {
        try {
            const p = require.resolve('@sveltejs/kit/package.json', { paths: [hint] });
            return p;
        } catch { }
    }
    // 마지막 fallback: 기본 resolve
    return require.resolve('@sveltejs/kit/package.json');
}

function spawnNode(file, args) {
    const r = spawnSync(process.execPath, [file, ...args], { stdio: 'inherit' });
    return r.status ?? 1;
}

function spawnCmd(cmdPath, args) {
    const r = spawnSync(cmdPath, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    return r.status ?? 1;
}

function findDotBinSvelteKit(startDir) {
    let dir = startDir;
    const names = process.platform === 'win32'
        ? ['svelte-kit.cmd', 'svelte-kit.CMD']
        : ['svelte-kit'];
    while (true) {
        const binDir = path.join(dir, 'node_modules', '.bin');
        for (const n of names) {
            const p = path.join(binDir, n);
            if (fs.existsSync(p)) return p;
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

function run(cmd) {
    const kitPkgJsonPath = resolveKitPkgJson();
    const kitDir = path.dirname(kitPkgJsonPath);
    const kitPkg = require(kitPkgJsonPath);
    const kitVersion = kitPkg.version;

    // 1) bin 경로 시도
    let binRel = null;
    if (typeof kitPkg.bin === 'string') binRel = kitPkg.bin;
    else if (kitPkg.bin && typeof kitPkg.bin === 'object') binRel = kitPkg.bin['svelte-kit'] || Object.values(kitPkg.bin)[0];

    if (binRel) {
        const binAbs = path.join(kitDir, binRel);
        console.log(`[run-sveltekit] v${kitVersion} → bin: ${binAbs} (cmd=${cmd})`);
        const code = spawnNode(binAbs, [cmd]);
        if (code === 0) return;
        // 일부 환경에서 bin 래퍼가 "Invalid command"를 내뱉는 경우가 있어 dist/cli.js 재시도
        console.warn(`[run-sveltekit] bin failed with code=${code}. Falling back to dist/cli.js...`);
    } else {
        console.warn('[run-sveltekit] No bin field in @sveltejs/kit package.json. Trying dist/cli.js...');
    }

    // 2) dist/cli.js 직접 실행
    const cliAbs = path.join(kitDir, 'dist', 'cli.js');
    if (fs.existsSync(cliAbs)) {
        console.log(`[run-sveltekit] v${kitVersion} → dist/cli.js: ${cliAbs} (cmd=${cmd})`);
        const code2 = spawnNode(cliAbs, [cmd]);
        if (code2 === 0) return;
        console.warn(`[run-sveltekit] dist/cli.js failed with code=${code2}. Trying .bin fallback...`);
    } else {
        console.warn('[run-sveltekit] dist/cli.js not found. Trying .bin fallback...');
    }

    // 3) 최후: .bin/svelte-kit(.cmd)
    const dotbin = findDotBinSvelteKit(process.cwd()) || findDotBinSvelteKit(path.resolve(__dirname, '..'));
    if (!dotbin) {
        console.error('[run-sveltekit] Could not find .bin/svelte-kit(.cmd). Aborting.');
        process.exit(1);
    }
    console.log(`[run-sveltekit] .bin fallback: ${dotbin} (cmd=${cmd})`);
    const code3 = spawnCmd(dotbin, [cmd]);
    process.exit(code3);
}

const arg = process.argv[2];
if (!arg || !['sync', 'build', 'preview', 'dev'].includes(arg)) {
    console.error('Usage: node scripts/run-sveltekit.cjs <sync|build|preview|dev>');
    process.exit(1);
}
run(arg);
