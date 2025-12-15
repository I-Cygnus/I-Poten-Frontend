export function toChosungArray(input: string): string[] {
    const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    const out: string[] = [];
    const s = (input ?? "").normalize("NFC");

    for (const ch of s) {
        if (ch === " ") continue; // 공백 제거
        const code = ch.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) {
            // 한글 음절 → 초성 index
            const idx = Math.floor((code - 0xac00) / 588);
            out.push(CHO[idx]);
        } else if (/[ㄱ-ㅎ]/.test(ch)) {
            // 자모가 이미 초성계열이면 그대로
            out.push(ch);
        } else {
            // 필요시 그대로 두거나 점(·)로 치환 가능
            // out.push("·");
        }
    }
    return out;
}
