import React from "react";
import styled from "styled-components";
import PotenNoteModal from "../components/PotenNoteModal";
import { fetchUserFolders, patchReorderFolders } from "../api/wordbook";
import { moveFavorites, deleteFavoriteTerm, MoveFavoritesResponse } from "../api/favorites";
import http, { authHeader } from "../utils/http";
import { renameUserFolder, deleteUserFolder, deleteUserFoldersBulk } from "../api/folder";
// import toast from "react-hot-toast";

type FavoriteItem = {
    favoriteTermId: string;  // 서버 DELETE/식별용
    termId: string;
    title: string;
    description: string;
    tags?: string[];
};

const Toolbar = styled.div`
    display: flex; align-items: center; gap: 8px;
    margin: 0 0 12px 0;
`;
const Btn = styled.button<{ primary?: boolean }>`
    height: 32px; padding: 0 12px; border-radius: 8px;
    border: 1px solid #e5e7eb; cursor: pointer; background: ${({primary})=> primary ? "#eef2ff" : "#fff"};
    font-weight: 700;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
`;

const Card = styled.article`
    position: relative;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
`;

const DeleteBtn = styled.button<{ disabled?: boolean }>`
    position: absolute;
    top: 12px; right: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    height: 28px; padding: 0 10px;
    background: #fff; cursor: pointer;
    opacity: ${({disabled}) => (disabled ? 0.6 : 1)};
`;

const Check = styled.input.attrs({ type: "checkbox" })`
    position: absolute; top: 12px; left: 12px;
    width: 18px; height: 18px;
`;

const Empty = styled.div`
    border: 1px dashed #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    color: #6b7280;
`;

type Notebook = { id: string; name: string };

export default function FavoriteTermsPage() {
    const [items, setItems] = React.useState<FavoriteItem[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [busy, setBusy] = React.useState<Record<string, boolean>>({});
    const [selectMode, setSelectMode] = React.useState(false);
    const [checked, setChecked] = React.useState<Record<string, boolean>>({});
    const selected = React.useMemo(
        () => items.filter(it => checked[it.favoriteTermId]),
        [items, checked]
    );

    // 이동 모달
    const [moveOpen, setMoveOpen] = React.useState(false);
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);

    /** 서버 응답 → 안전한 배열 변환 */
    const toArray = (d: any): any[] => {
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.items)) return d.items;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.content)) return d.content;
        if (Array.isArray(d?.list)) return d.list;
        if (Array.isArray(d?.results)) return d.results;
        return [];
    };

    /** 개별 row → FavoriteItem 매핑 */
    const mapRow = (row: any): FavoriteItem | null => {
        const favoriteTermId = row.favoriteTermId ?? row.id ?? row.favorite_term_id;
        const termId = row.termId ?? row.term?.id ?? row.term_id;
        if (favoriteTermId == null || termId == null) return null;

        const title = row.title ?? row.term?.title ?? row.word ?? "(제목 없음)";
        const description = row.description ?? row.term?.description ?? row.explain ?? "";
        const tags: string[] = row.tags ?? row.term?.tags ?? [];

        return {
            favoriteTermId: String(favoriteTermId),
            termId: String(termId),
            title: String(title),
            description: String(description),
            tags,
        };
    };

    /** 즐겨찾기 목록 로딩 */
    const fetchFavorites = React.useCallback(async () => {
        setLoading(true);
        try {
            // 백엔드에 맞춰 엔드포인트 조정 가능: /api/me/favorite-terms, /api/me/wordbook/favorites 등
            const { data } = await http.get("/api/me/favorite-terms", {
                headers: { ...authHeader() },
                params: { page: 0, perPage: 100 }, // 필요 시 페이징
            });
            const list = toArray(data).map(mapRow).filter(Boolean) as FavoriteItem[];
            setItems(list);
        } catch (e) {
            console.warn("[favorites] 목록 조회 실패", e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleDelete = async (favoriteTermId: string) => {
        if (busy[favoriteTermId]) return;

        const prev = items;
        const next = prev.filter(it => it.favoriteTermId !== favoriteTermId);
        setItems(next);
        setBusy(b => ({ ...b, [favoriteTermId]: true }));

        try {
            await deleteFavoriteTerm(favoriteTermId);
            // toast.success("즐겨찾기에서 삭제했어요.");
        } catch (e: any) {
            // 롤백
            setItems(prev);
            const s = e?.response?.status;
            if (s === 401) alert("로그인이 필요합니다.");
            else if (s === 404) { /* 이미 삭제됨: 무시 가능 */ }
            else alert("삭제에 실패했어요. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(b => ({ ...b, [favoriteTermId]: false }));
        }
    };

    const openMove = async () => {
        if (selected.length === 0) return;
        try { setNotebooks(await fetchUserFolders()); } catch { setNotebooks([]); }
        setMoveOpen(true);
    };

    const handleConfirmMove = async (destWordbookId: string) => {
        if (selected.length === 0) return;

        // 요청 구성: favoriteIds(권장)
        const favoriteIds = selected.map(s => Number(s.favoriteTermId)).filter(Number.isFinite);
        // const termIds = selected.map(s => Number(s.termId)); // 필요 시 대체

        try {
            const res: MoveFavoritesResponse = await moveFavorites({
                targetWordbookId: Number(destWordbookId),
                favoriteIds,
            });

            // 이동이 없으면 종료
            if (!res || res.movedCount === 0) {
                setMoveOpen(false);
                return;
            }

            // 서버 진실과 재동기화 (로컬 제거 대신 다시 로드)
            await fetchFavorites();

            // 선택 상태 초기화 & 모달 닫기
            setChecked({});
            setSelectMode(false);
            setMoveOpen(false);

            // 피드백
            // toast.success(`${res.movedCount}개 이동 완료${res.skippedCount ? ` · 중복 ${res.skippedCount}개 스킵` : ""}`);
            if (res.skippedCount > 0) {
                const dupe = res.skipped.filter(s => s.reason === "DUPLICATE_IN_TARGET").length;
                console.info(`[move] 중복 ${dupe}개 스킵`);
            }
        } catch (err: any) {
            const s = err?.response?.status;
            if (s === 401) alert("로그인이 필요합니다.");
            else if (s === 403) alert("해당 폴더 접근 권한이 없습니다.");
            else if (s === 404) alert("대상 폴더를 찾을 수 없습니다.");
            else alert("이동 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
            console.error("[moveFavorites] failed:", err);
        }
    };

    const handleReorder = async (orderedIds: string[]) => {
        try { await patchReorderFolders(orderedIds); }
        catch (e) { console.warn("[folders reorder] 실패", e); }
    };

    const toggleAll = (on: boolean) => {
        if (!selectMode) return;
        const next: Record<string, boolean> = {};
        if (on) items.forEach(it => (next[it.favoriteTermId] = true));
        setChecked(next);
    };

    if (loading && items.length === 0) return <p style={{ padding: 20 }}>⏳ 불러오는 중...</p>;
    if (items.length === 0) return <Empty>즐겨찾기한 용어가 없어요.</Empty>;

    const normalize = React.useCallback((s: string) => s.trim().replace(/\s+/g, " ").toLowerCase(), []);

    const handleRequestRename = React.useCallback(async (wordbookId: string, currentName: string) => {
        const next = window.prompt("새 폴더 이름을 입력하세요.", currentName ?? "");
        if (next == null) return;
        const raw = next.trim();
        if (!raw) { alert("폴더 이름은 공백일 수 없습니다."); return; }
        if (raw.length > 60) { alert("폴더 이름은 최대 60자입니다."); return; }

        // 로컬 중복 체크(선택 사항)
        const dup = notebooks.some(n => n.id !== wordbookId && normalize(n.name) === normalize(raw));
        if (dup) { alert("동일한 이름의 폴더가 이미 존재합니다."); return; }

        try {
            await renameUserFolder(wordbookId, raw);
            // 최신 목록 갱신
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
    }, [notebooks, normalize]);


    return (
        <>
            <Toolbar>
                {!selectMode ? (
                    <Btn onClick={() => setSelectMode(true)} aria-label="단어 선택 시작">단어 선택</Btn>
                ) : (
                    <>
                        <Btn onClick={() => toggleAll(true)}>전체선택</Btn>
                        <Btn onClick={() => toggleAll(false)}>선택해제</Btn>
                        <Btn primary disabled={selected.length === 0} onClick={openMove} aria-label="선택 항목 이동">선택 항목 이동</Btn>
                        <Btn onClick={() => { setSelectMode(false); setChecked({}); }}>선택 종료</Btn>
                    </>
                )}
            </Toolbar>

            <Grid>
                {items.map(it => {
                    const isChecked = !!checked[it.favoriteTermId];
                    return (
                        <Card key={it.favoriteTermId} aria-labelledby={`fav-${it.favoriteTermId}`}>
                            {selectMode && (
                                <Check
                                    checked={isChecked}
                                    onChange={() => setChecked(prev => ({ ...prev, [it.favoriteTermId]: !prev[it.favoriteTermId] }))}
                                    aria-label={isChecked ? "선택 해제" : "선택"}
                                    title={isChecked ? "선택 해제" : "선택"}
                                />
                            )}
                            <h3 id={`fav-${it.favoriteTermId}`}>{it.title}</h3>
                            <p>{it.description}</p>

                            <DeleteBtn
                                onClick={() => handleDelete(it.favoriteTermId)}
                                disabled={busy[it.favoriteTermId]}
                                aria-busy={busy[it.favoriteTermId]}
                                aria-label="즐겨찾기에서 삭제"
                                title="즐겨찾기에서 삭제"
                            >
                                삭제
                            </DeleteBtn>
                        </Card>
                    );
                })}
            </Grid>

            {/* 이동 모달 */}
            <PotenNoteModal
                open={moveOpen}
                notebooks={notebooks}
                onClose={() => setMoveOpen(false)}
                onCreate={async (name) => {
                    const { data } = await http.post(
                        "/api/me/folders",
                        { wordbookName: name },
                        { headers: { ...authHeader() } }
                    );
                    const newId = String(data.id);
                    const newName = data.wordbookName ?? name;
                    setNotebooks(prev => [{ id: newId, name: newName }, ...prev]);
                    return newId;
                }}
                onReorder={handleReorder}
                onSave={handleConfirmMove}
                onGoToFolder={() => {
                    // 즐겨찾기 화면은 라우팅만 해두고 여기서는 모달만 닫음(필요 시 navigate 연결)
                    setMoveOpen(false);
                }}
                onRename={async (wordbookId, newName) => {
                    await renameUserFolder(wordbookId, newName);
                    setNotebooks(prev => prev.map(n => n.id === wordbookId ? ({ ...n, name: newName }) : n));
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
        </>
    );
}
