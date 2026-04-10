import http from "../utils/http";
import { parseContentDispositionFilename, sanitizeFilename } from "../utils/cdFilename";

export type PdfMeta = {
    ebookId: string | null;
    ebookFilename: string | null;
    ebookCount: number | null;
    ebookSkipped: number | null;
    cdFilename: string | null; // 헤더에서 파싱한 파일명(디코딩 완료)
    mismatch: boolean;         // ebookFilename 헤더와 파일명 비교 결과
};

export async function generatePdfByTermIds(params: { termIds: (number|string)[]; title?: string }) {
    const res = await http.post("/pdf/generate", params, {
        responseType: "blob",
    });

    if (res.status < 200 || res.status >= 300) {
        const errCode = res.headers["ebook-error"] ?? "UNKNOWN_ERROR";
        throw new Error(String(errCode));
    }

    // 메타 헤더 파싱
    const ebookId = res.headers["ebook-id"] ?? null;
    const ebookFilename = res.headers["ebook-filename"] ?? null;
    const ebookCount = res.headers["ebook-count"] ? Number(res.headers["ebook-count"]) : null;
    const ebookSkipped = res.headers["ebook-skipped"] ? Number(res.headers["ebook-skipped"]) : null;

    // Content-Disposition에서 파일명 파싱(모든 규격 지원)
    const cdHeader: string | undefined = res.headers["content-disposition"];
    const parsed = parseContentDispositionFilename(cdHeader || null);

    // mismatch 는 “보조 헤더(ebook-filename)”와 실제 다운로드 파일명 간 비교
    const cdFilename = parsed || null;
    const mismatch = !!(ebookFilename && cdFilename && ebookFilename !== cdFilename);

    return {
        blob: res.data as Blob,
        meta: { ebookId, ebookFilename, ebookCount, ebookSkipped, cdFilename, mismatch } as PdfMeta,
    };
}