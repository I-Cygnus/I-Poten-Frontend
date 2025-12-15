import http from "../utils/http";

type Term = {
    id: number | string;
    title: string;
    description?: string | null;
    tags?: string[] | null;
};

type SearchByTagResponse = {
    page?: number;
    size?: number;
    total?: number;
    items?: Term[];
    content?: Term[];
    totalElements?: number;
    termList?: Term[];
    totalItems?: number;
};

/** 태그로 검색 (서버가 1-based 페이지면 page는 1 이상) */
export const fetchTermsByTag = async (
    tag: string,
    page = 1,
    size = 20
): Promise<SearchByTagResponse> => {
    const t = (tag ?? "").trim();
    if (!t) return { page, size, total: 0, items: [] };

    const { data } = await http.get<SearchByTagResponse>("/terms/search/by-tag", {
        params: { tag: t, page, size }, // http 인터셉터가 빈 값 자동 제거
    });

    // 응답 정규화
    const items = data.items ?? data.content ?? data.termList ?? [];
    const total =
        data.total ?? data.totalElements ?? data.totalItems ?? items.length;

    return { ...data, items, total, page, size };
};
