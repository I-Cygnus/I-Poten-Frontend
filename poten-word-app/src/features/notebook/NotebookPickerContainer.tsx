import React from "react";
import PotenNoteModal from "../../components/note/PotenNoteModal.tsx";
import { fetchUserFolders, patchReorderFolders } from "../../api/folders";
import { renameUserFolder, deleteUserFolder, deleteUserFoldersBulk } from "../../api/folder";
import http, { authHeader } from "../../utils/http";

type Notebook = { id: string; name: string };

type Props = {
    open: boolean;
    onClose: () => void;
    onSaveToNotebook?: (wordbookId: string) => Promise<void> | void;
    onGoToFolder?: (wordbookId: string, name?: string) => void | Promise<void>;
};

async function createFolder(wordbookName: string) {
    const { data } = await http.post(`/api/me/folders`, { wordbookName }, { headers: { ...authHeader() } });
    return data as { id: number; wordbookName: string; sortOrder: number };
}

export default function NotebookPickerContainer({ open, onClose, onSaveToNotebook, onGoToFolder }: Props) {
    const [notebooks, setNotebooks] = React.useState<Notebook[]>([]);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            if (!open) return;
            try {
                const list = await fetchUserFolders();
                if (mounted) setNotebooks(list);
            } catch (e) {
                console.error("[NotebookPickerContainer] fetchUserFolders failed:", e);
                if (mounted) setNotebooks([]);
            }
        })();
        return () => { mounted = false; };
    }, [open]);

    const normalize = React.useCallback((s: string) => s.trim().replace(/\s+/g, " ").toLowerCase(), []);

    const refreshFolders = React.useCallback(async () => {
        const list = await fetchUserFolders();
        setNotebooks(list);
    }, []);

    const handleSave = React.useCallback(async (wordbookId: string) => {
        if (!onSaveToNotebook) return;
        setBusy(true);
        try {
            await Promise.resolve(onSaveToNotebook(wordbookId));
        } finally {
            setBusy(false);
        }
    }, [onSaveToNotebook]);

    const handleReorder = React.useCallback(async (orderedIds: string[]) => {
        setBusy(true);
        try {
            await patchReorderFolders(orderedIds);
            await refreshFolders();
        } catch (e) {
            console.error("[NotebookPickerContainer] reorder failed:", e);
            await refreshFolders();
        } finally {
            setBusy(false);
        }
    }, [refreshFolders]);

    // "이름 바꾸기" 실제 백엔드 호출 부분
    const handleRequestRename = React.useCallback(async (wordbookId: string, currentName: string) => {
        const next = window.prompt("새 폴더 이름을 입력하세요.", currentName ?? "");
        if (next == null) return; // 사용자가 취소
        const raw = next.trim();
        if (!raw) return alert("폴더 이름은 공백일 수 없습니다.");
        if (raw.length > 60) return alert("폴더 이름은 최대 60자입니다.");
        const normalized = normalize(raw);
        if (!normalized) return alert("폴더 이름은 공백만 입력할 수 없습니다.");

        const dup = notebooks.some(n => n.id !== wordbookId && normalize(n.name) === normalized);
        if (dup) return alert("동일한 이름의 폴더가 이미 존재합니다.");

        setBusy(true);
        try {
            await renameUserFolder(wordbookId, raw); // ← PATCH /api/me/folders/{id}
            await refreshFolders();               // UI 최신화
        } catch (e: any) {
            const s = e?.response?.status;
            if (s === 409) alert("동일한 이름의 폴더가 이미 존재합니다.");
            else if (s === 400) alert("폴더 이름 형식이 올바르지 않습니다.");
            else if (s === 403) alert("이 폴더에 대한 권한이 없습니다.");
            else if (s === 404) alert("폴더를 찾을 수 없습니다.");
            else alert("폴더 이름 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    }, [notebooks, normalize, refreshFolders]);

    const handleCreate = React.useCallback(async (name: string) => {
        setBusy(true);
        try {
            const created = await createFolder(name);
            await refreshFolders();
            return String(created.id);
        } catch (e: any) {
            const s = e?.response?.status;
            if (s === 409) throw new Error("DUPLICATE_LOCAL");
            if (s === 400) throw new Error("EMPTY_NAME");
            throw e;
        } finally {
            setBusy(false);
        }
    }, [refreshFolders]);

    // 실제 삭제 연동(단건)
    const handleRequestDelete = React.useCallback(async (wordbookId: string, wordbookName: string) => {
        if (!confirm(`'${wordbookName}' 폴더를 삭제할까요?\n(폴더 안 용어도 함께 삭제됩니다)`)) return;
        setBusy(true);
        try {
            await deleteUserFolder(wordbookId, "purge");
            await refreshFolders();
        } catch (e: any) {
            const s = e?.response?.status;
            if (s === 401) alert("로그인이 필요합니다.");
            else if (s === 403) alert("이 폴더에 대한 권한이 없습니다.");
            else if (s === 404) alert("폴더를 찾을 수 없습니다.");
            else alert("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    }, [refreshFolders]);

    // 실제 삭제 연동(다건)
    const handleRequestBulkDelete = React.useCallback(async (wordbookIds: string[]) => {
        if (wordbookIds.length === 0) return;
        if (!confirm(`선택한 ${wordbookIds.length}개 폴더를 삭제할까요?\n(각 폴더 안 용어도 함께 삭제됩니다)`)) return;
        setBusy(true);
        try {
            await deleteUserFoldersBulk(wordbookIds, "purge");
            await refreshFolders();
        } catch (e: any) {
            const s = e?.response?.status;
            if (s === 401) alert("로그인이 필요합니다.");
            else if (s === 403) alert("권한이 없습니다.");
            else if (s === 404) alert("일부 폴더를 찾을 수 없습니다.");
            else alert("일괄 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    }, [refreshFolders]);

    return (
        <PotenNoteModal
            open={open}
            notebooks={notebooks}
            onClose={onClose}
            onSave={handleSave}
            onCreate={handleCreate}
            onReorder={handleReorder}
            onGoToFolder={onGoToFolder}
            onRename={async (wordbookId, newName) => {
                await renameUserFolder(wordbookId, newName);
                // 로컬 반영 or 재조회
                setNotebooks(prev => prev.map(n => n.id === wordbookId ? ({ ...n, name: newName }) : n));
            }}
            onRequestDelete={handleRequestDelete}
            onRequestBulkDelete={handleRequestBulkDelete}
        />
    );
}
