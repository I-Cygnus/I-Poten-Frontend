import React from "react";
import styled from "styled-components";
import { useSearchParams, useNavigationType, useNavigate } from "react-router-dom";
import TermCardWithTagsLazy from "../../components/word/TermCardWithTagsLazy.tsx";
import PtnNoteModal from "../../components/note/PtnNoteModal.tsx";
import { fetchTermsByTag } from "../../api/termApi.ts";
import { fetchUserFolders, patchReorderFolders } from "../../api/wordbook.ts";
import {deleteUserFolder, renameUserFolder} from "../../api/folder.ts";

/* 타입 */
type Term = { id: number; title: string; description: string; tags?: string[] };
type Notebook = { id: string; name: string };

/* 세션 캐시 유틸 */
type CacheData = { tag: string; items: Term[]; total: number; scrollY?: number };
const readCache = (k: string): CacheData | null => { try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; } };
const writeCache = (k: string, d: CacheData) => { try { sessionStorage.setItem(k, JSON.stringify(d)); } catch {} };

/* 디자인 토큰 */
const TOKENS = {
    color: {
        text: "#374151",
        textMuted: "#6b7280",
        textBlue: "#2563eb",
        red: "#dc2626",
        border: "#e5e7eb",
        chipBg: "#eef2ff",
        chipBorder: "#c7d2fe",
    },
    space: (n: number) => `${n}px`,
    font: { base: "14px", small: "12px", strong: 700 },
    radius: 14,
} as const;

const Root = styled.div` margin-top: ${TOKENS.space(16)}; `;

const InfoRow = styled.div`
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: ${TOKENS.space(8)};
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    font-size: ${TOKENS.font.base};
    color: ${TOKENS.color.textMuted};
`;

const Chip = styled.span`
    display: inline-flex; align-items: center; gap: ${TOKENS.space(6)};
    border-radius: ${TOKENS.radius}px;
    background: ${TOKENS.color.chipBg};
    border: 1px solid ${TOKENS.color.chipBorder};
    padding: ${TOKENS.space(4)} ${TOKENS.space(8)};
    font-size: ${TOKENS.font.small};
    color: ${TOKENS.color.textBlue};
    font-weight: ${TOKENS.font.strong};
    flex: 0 0 auto;
`;

const StrongNum = styled.span` font-weight: ${TOKENS.font.strong}; color: ${TOKENS.color.textBlue}; `;
const LoadingMsg = styled.div` margin-top: ${TOKENS.space(16)}; color: ${TOKENS.color.textMuted}; `;
const ErrorMsg = styled.div` margin-top: ${TOKENS.space(16)}; color: ${TOKENS.color.red}; `;
const List = styled.ul` margin-top: ${TOKENS.space(16)}; padding: 0; list-style: none; `;
const ListItem = styled.li` & + & { margin-top: ${TOKENS.space(16)}; } `;
const EmptyMsg = styled.div` margin-top: ${TOKENS.space(16)}; color: ${TOKENS.color.textMuted}; `;

/* ---------------- Pagination ---------------- */
type PaginationProps = {
    page: number; size: number; total: number;
    onChange: (nextPageZeroBased: number) => void;
};
const PaginationNav = styled.nav`
    margin-top: ${TOKENS.space(16)};
    display: flex; align-items: center; justify-content: center;
    gap: ${TOKENS.space(8)}; user-select: none;
`;
const PageNumBtn = styled.button<{ $active: boolean }>`
    min-width: 34px; height: 34px; padding: 0 10px; border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? TOKENS.color.textBlue : TOKENS.color.border)};
    background: ${({ $active }) => ($active ? TOKENS.color.textBlue : "#fff")};
    color: ${({ $active }) => ($active ? "#fff" : TOKENS.color.text)};
    font-weight: ${({ $active }) => ($active ? 700 : 600)};
    cursor: pointer;
`;
const NavBtn = styled.button<{ $disabled: boolean }>`
    width: 34px; height: 34px; border-radius: 999px; border: 1px solid ${TOKENS.color.border};
    background: #fff; color: ${({ $disabled }) => ($disabled ? "#c7c7c7" : TOKENS.color.text)};
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    display: inline-flex; align-items: center; justify-content: center;
`;

const Pagination: React.FC<PaginationProps> = ({ page, size, total, onChange }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
    const current = page + 1; // 1-base
    const maxNumbers = 10;

    let start = Math.max(1, current - Math.floor(maxNumbers / 2));
    let end = Math.min(totalPages, start + maxNumbers - 1);
    start = Math.max(1, end - maxNumbers + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);

    const go = (p1: number) => {
        if (p1 < 1 || p1 > totalPages || p1 === current) return;
        onChange(p1 - 1);
    };

    return (
        <PaginationNav aria-label="페이지네이션">
            <NavBtn aria-label="처음" onClick={() => go(1)} disabled={current === 1} $disabled={current === 1}>«</NavBtn>
            <NavBtn aria-label="이전" onClick={() => go(current - 1)} disabled={current === 1} $disabled={current === 1}>‹</NavBtn>
            {nums.map((n) => (
                <PageNumBtn key={n} onClick={() => go(n)} aria-current={n === current ? "page" : undefined} $active={n === current}>
                    {n}
                </PageNumBtn>
            ))}
            <NavBtn aria-label="다음" onClick={() => go(current + 1)} disabled={current === totalPages} $disabled={current === totalPages}>›</NavBtn>
            <NavBtn aria-label="마지막" onClick={() => go(totalPages)} disabled={current === totalPages} $disabled={current === totalPages}>»</NavBtn>
        </PaginationNav>
    );
};

/* ---------------- 페이지 컴포넌트 ---------------- */
const TermListPage: React.FC = () => {
    const [params] = useSearchParams();
    const navType = useNavigationType();
    const navigate = useNavigate();

    const tag = (params.get("tag") ?? "").trim();
    const page = Number(params.get("page") ?? 0) || 0;
    const size = Number(params.get("size") ?? 20) || 20;

    const [terms, setTerms] = React.useState<Term[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // 모달/폴더 상태
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selectedTermId, setSelectedTermId] = React.useState<number | null>(null);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);

    const cacheKey = React.useMemo(() => `terms_by_tag:tag${tag}:p${page}:s${size}`, [tag, page, size]);
    const normalize = React.useCallback((s: string) => s.trim().replace(/\s+/g, " ").toLowerCase(), []);

    /* 언마운트 시 스크롤 저장 */
    React.useEffect(() => {
        return () => {
            const base = readCache(cacheKey) ?? { tag, items: terms, total };
            writeCache(cacheKey, { ...base, scrollY: window.scrollY });
        };
    }, [cacheKey, tag, terms, total]);

    /* 태그 검색 + 캐시 복원 */
    React.useEffect(() => {
        if (!tag) {
            setTerms([]); setTotal(0); setLoading(false); setError(null);
            requestAnimationFrame(() => window.scrollTo(0, 0));
            return;
        }

        if (navType === "POP") {
            const cached = readCache(cacheKey);
            if (cached) {
                setTerms(cached.items);
                setTotal(cached.total);
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => window.scrollTo(0, cached.scrollY ?? 0))
                );
                return;
            }
        } else {
            requestAnimationFrame(() => window.scrollTo(0, 0));
        }

        const ac = new AbortController();
        setLoading(true); setError(null);

        (async () => {
            try {
                const res = await fetchTermsByTag(tag, page + 1, size);
                const rawItems = (res as any).termList ?? [];
                const items: Term[] = rawItems.map((it: any) => ({
                    id: Number(it.id),
                    title: it.title,
                    description: it.description ?? "",
                    tags: Array.from(new Set((it.tags ?? []).filter(Boolean))),
                }));
                const totalNum = (res as any).totalItems ?? items.length;

                if (totalNum === 0) {
                    const spNF = new URLSearchParams();
                    spNF.set("tag", tag);
                    navigate({ pathname: "../not-found", search: `?${spNF.toString()}` }, { replace: true });
                    return;
                }

                // 범위 보정
                const totalPages = Math.max(1, Math.ceil((totalNum || 0) / (size || 1)));
                if (page > totalPages - 1 && totalNum > 0) {
                    const sp = new URLSearchParams();
                    sp.set("tag", tag);
                    sp.set("page", String(totalPages - 1));
                    sp.set("size", String(size || 20));
                    navigate(`/terms/by-tag?${sp.toString()}`, { replace: true });
                    return;
                }

                setTerms(items);
                setTotal(totalNum);
                writeCache(cacheKey, { tag, items, total: totalNum, scrollY: 0 });
            } catch (e: any) {
                setError(e?.message || "태그 검색 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [tag, page, size, cacheKey, navType, navigate]);

    /* 페이지 이동 */
    const handlePageChange = (nextZeroBased: number) => {
        const sp = new URLSearchParams();
        if (tag) sp.set("tag", tag);
        sp.set("page", String(nextZeroBased));
        sp.set("size", String(size || 20));
        navigate({ pathname: "terms/by-tag", search: `?${sp.toString()}` });
    };

    /* 카드 내 태그 클릭 → 같은 페이지에서 태그 교체 */
    const handleTagClick = (t: string) => {
        const sp = new URLSearchParams();
        sp.set("tag", t);
        sp.set("page", "0");
        sp.set("size", String(size || 20));
        navigate({ pathname: "terms/by-tag", search: `?${sp.toString()}` });
    };

    /* --- 모달 제어 & 폴더 로딩 --- */
    const openModalFor = (termId: number) => {
        setSelectedTermId(termId);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedTermId(null);
    };

    React.useEffect(() => {
        let aborted = false;
        (async () => {
            if (!modalOpen) return;
            try {
                const list = await fetchUserFolders();
                if (!aborted) setNotebooks(list);
            } catch {
                if (!aborted) setNotebooks([]);
            }
        })();
        return () => { aborted = true; };
    }, [modalOpen]);

    /* --- 모달 핸들러들 --- */
    // 저장 버튼: 실제 attach API 연동 지점
    const handleSaveToNotebook = async (notebookId: string) => {
        if (!selectedTermId) return;
        // TODO: 백엔드 attach API 붙이면 호출
        // await attachTermToFolder({ termId: selectedTermId, wordbookId: notebookId });
        closeModal();
    };

    const handleReorder = async (orderedIds: string[]) => {
        try { await patchReorderFolders(orderedIds); }
        catch (e) { console.warn("[folders reorder] 실패", e); }
    };

    const handleRequestRename = React.useCallback(
        async (wordbookId: string, currentName: string) => {
            const next = window.prompt("새 폴더 이름을 입력하세요.", currentName ?? "");
            if (next == null) return;
            const raw = next.trim();
            if (!raw) { alert("폴더 이름은 공백일 수 없습니다."); return; }
            if (raw.length > 60) { alert("폴더 이름은 최대 60자입니다."); return; }

            const dup = notebooks.some(n => n.id !== wordbookId && normalize(n.name) === normalize(raw));
            if (dup) { alert("동일한 이름의 폴더가 이미 존재합니다."); return; }

            try {
                await renameUserFolder(wordbookId, raw);
                // 최신 목록 반영: 재조회 또는 로컬 업데이트 중 택1
                const list = await fetchUserFolders();
                setNotebooks(list);
            } catch (e: any) {
                const s = e?.response?.status;
                if (s === 409) alert("동일한 이름의 폴더가 이미 존재합니다.");
                else if (s === 400) alert("폴더 이름 형식이 올바르지 않습니다.");
                else if (s === 403) alert("이 폴더에 대한 권한이 없습니다.");
                else if (s === 404) alert("폴더를 찾을 수 없습니다.");
                else alert("폴더 이름 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            }
        },
        [notebooks, normalize]
    );

    return (
        <Root>
            {/*{tag ? (
                <InfoRow aria-live="polite">
                    <Chip>#{tag}</Chip>
                    <span>에 대한 <StrongNum>{total}</StrongNum>개의 용어가 검색되었습니다.</span>
                </InfoRow>
            ) : (
                <InfoRow>해시태그를 선택하면 해당 태그의 용어를 보여드립니다.</InfoRow>
            )}*/}

            {loading && <LoadingMsg>불러오는 중...</LoadingMsg>}
            {error && <ErrorMsg>{error}</ErrorMsg>}

            {!loading && !error && terms.length > 0 && (
                <>
                    <List>
                        {terms.map((t) => (
                            <ListItem key={t.id}>
                                <TermCardWithTagsLazy
                                    id={t.id}
                                    title={t.title}
                                    description={t.description}
                                    tags={t.tags}
                                    onTagClick={handleTagClick}
                                    onAdd={(id) => {
                                        console.log("단어장 추가:", id);
                                        openModalFor(id);
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Pagination page={page} size={size} total={total} onChange={handlePageChange} />
                </>
            )}

            {!loading && !error && tag && terms.length === 0 && (
                <EmptyMsg>해당 태그로 등록된 용어가 없습니다.</EmptyMsg>
            )}

           {/* {!loading && !error && !tag && (
                <EmptyMsg>용어 카드를 열고 해시태그를 눌러보세요.</EmptyMsg>
            )}*/}

            {/* 폴더 선택/관리 모달 */}
            <PtnNoteModal
                open={modalOpen}
                notebooks={notebooks}
                onClose={closeModal}
                onSave={handleSaveToNotebook}
                onReorder={handleReorder}
                onRename={async (wordbookId, newName) => {
                    await renameUserFolder(wordbookId, newName);
                    setNotebooks(prev => prev.map(n => n.id === wordbookId ? ({ ...n, name: newName }) : n));
                }}
                onGoToFolder={(fid, name) => {
                    // 폴더 상세 페이지로 이동하고 모달 닫기
                    setModalOpen(false);
                    navigate(`/learning/folders/${fid}`, { state: { wordbookName: name } });
                }}
                onRequestDelete={async (fid, name) => {
                    await deleteUserFolder(fid, "purge");
                    setNotebooks(await fetchUserFolders());
                }}
                onRequestBulkDelete={async (ids) => {
                    if (!confirm(`선택 ${ids.length}개 폴더 삭제? (안의 용어도 삭제)`)) return;
                    setNotebooks(await fetchUserFolders());
                }}
            />
        </Root>
    );
};

export default TermListPage;
