const { zip } = require("zip-a-folder");
const fs = require("fs");
const path = require("path");

(async () => {
    try {
        const mfDir = path.resolve("dist/@mf-types");
        const target = path.resolve("dist/@mf-types.d.ts");

        const findIndexDts = (dir) => {
            const preferred = [
                path.join(dir, "index.d.ts"),
                path.join(dir, "src/lib/index.d.ts"),
                path.join(dir, "lib/index.d.ts"),
                path.join(dir, "src/index.d.ts"),
            ];
            for (const p of preferred) {
                if (fs.existsSync(p)) return p;
            }

            const stack = [dir];
            while (stack.length) {
                const cur = stack.pop();
                const entries = fs.readdirSync(cur, { withFileTypes: true });
                for (const e of entries) {
                    const full = path.join(cur, e.name);
                    if (e.isDirectory()) {
                        stack.push(full);
                        continue;
                    }
                    if (e.isFile() && e.name === "index.d.ts") {
                        return full;
                    }
                }
            }
            return null;
        };

        if (!fs.existsSync(mfDir)) {
            console.error("❌ dist/@mf-types 디렉터리가 없습니다. (tsc 출력 실패)");
            process.exit(1);
        }

        const source = findIndexDts(mfDir);
        if (!source) {
            console.error("❌ index.d.ts 없음 (dist/@mf-types 내부에서 찾지 못함)");
            process.exit(1);
        }

        fs.copyFileSync(source, target);
        console.log("✅", path.relative(process.cwd(), source), "→ @mf-types.d.ts 복사 완료");

        await zip(mfDir, "dist/@mf-types.zip");
        console.log("✅ dist/@mf-types.zip 생성 완료!");
    } catch (err) {
        console.error("❌ 압축 중 오류 발생:", err);
        process.exit(1);
    }
})();