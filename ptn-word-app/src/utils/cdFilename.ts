/** RFC 5987: filename*=UTF-8''...  */
function decodeRFC5987(header: string): string | null {
    const m = header.match(/filename\*\s*=\s*([^']*)''([^;]+)/i);
    if (!m) return null;
    try {
        const enc = (m[1] || "").toLowerCase();
        const data = m[2] || "";
        // 일반적으로 UTF-8
        return decodeURIComponent(data.replace(/\+/g, "%20"));
    } catch {
        return null;
    }
}

/** filename="..."(따옴표/맨몸) 추출 */
function getBasicFilename(header: string): string | null {
    const q = header.match(/filename\s*=\s*"([^"]+)"/i);
    if (q) return q[1];
    const b = header.match(/filename\s*=\s*([^;]+)/i);
    if (b) return b[1].trim();
    return null;
}

/** RFC 2047: =?UTF-8?Q?...?= 또는 =?UTF-8?B?...?= 디코딩 */
function decodeRFC2047(value: string): string {
    return value.replace(/=\?([^?]+)\?([bqBQ])\?([^?]+)\?=/g, (_all, cs, enc, data) => {
        const charset = String(cs).toLowerCase();
        const mode = String(enc).toUpperCase();
        try {
            if (mode === "B") {
                const bin = atob(data.replace(/\s+/g, ""));
                const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
                return new TextDecoder(charset).decode(bytes);
            } else {
                // Q-encoding (RFC 2047): '_'는 공백으로 해석
                const q = data
                    .replace(/_/g, " ")
                    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
                // 대부분 UTF-8
                const bytes = new TextEncoder().encode(q);
                return new TextDecoder(charset).decode(bytes);
            }
        } catch {
            return value;
        }
    });
}

/** OS 안전한 파일명으로 정리 */
export function sanitizeFilename(name: string, fallback = "download.pdf") {
    const cleaned = name
        .replace(/[\u0000-\u001F<>:"/\\|?*]+/g, "_")
        .replace(/\s+/g, " ")
        .trim();
    return cleaned || fallback;
}

/** Content-Disposition에서 최적 파일명 추출(+디코딩) */
export function parseContentDispositionFilename(header?: string | null): string | null {
    if (!header) return null;

    // 1) RFC 5987 우선
    const f5987 = decodeRFC5987(header);
    if (f5987) return f5987;

    // 2) 기본 filename=... 추출 후 RFC 2047 처리
    const basic = getBasicFilename(header);
    if (basic) {
        // =?UTF-8?...?= 형태면 디코딩
        if (/=\?[^?]+\?[bqBQ]\?[^?]+\?=/.test(basic)) {
            return decodeRFC2047(basic);
        }
        try {
            // 혹시 퍼센트 인코딩이면 복원
            return decodeURIComponent(basic);
        } catch {
            return basic;
        }
    }

    return null;
}
