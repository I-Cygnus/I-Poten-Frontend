// src/components/category/CategoryDropdownPicker.tsx
import React from "react";
import styled from "styled-components";
import { useCategoryTree, Category } from "../../../hooks/useCategoryTree.ts";

const TOKENS = {
    color: {
        text: "#374151",
        muted: "#6b7280",
        border: "#e5e7eb",
        blue: "#2563eb",
    },
    space: (n: number) => `${n}px`,
};

const Panel = styled.div`
    border: 1px solid ${TOKENS.color.border};
    border-top: none;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    background: #f8fafc;
    padding: ${TOKENS.space(12)};
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr; /* 대/중/소 3열 */
    gap: ${TOKENS.space(12)};

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: ${TOKENS.space(6)};
`;

const Label = styled.span`
    font-size: 13px;
    font-weight: 700;
    color: ${TOKENS.color.muted};
`;

const Select = styled.select<{ $disabled?: boolean }>`
    appearance: none;
    width: 100%;
    height: 38px;
    padding: 0 ${TOKENS.space(12)};
    border-radius: 10px;
    border: 1px solid ${TOKENS.color.border};
    background: #fff;
    color: ${TOKENS.color.text};
    font-size: 14px;
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    outline: none;

    &:focus {
        border-color: ${TOKENS.color.blue};
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    gap: ${TOKENS.space(8)};
    margin-top: ${TOKENS.space(12)};
    border-top: 1px solid ${TOKENS.color.border};
    padding-top: ${TOKENS.space(12)};
    flex-wrap: wrap;
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${TOKENS.space(6)};
    padding: ${TOKENS.space(4)} ${TOKENS.space(10)};
    border-radius: 999px;
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    color: ${TOKENS.color.blue};
    font-weight: 700;
    font-size: 12px;
`;

const Spacer = styled.span`
    color: ${TOKENS.color.muted};
    font-size: 12px;
`;

const Right = styled.div`
    margin-left: auto;
    display: inline-flex;
    gap: ${TOKENS.space(8)};
`;

const GhostBtn = styled.button`
    padding: ${TOKENS.space(6)} ${TOKENS.space(10)};
    border: 1px solid ${TOKENS.color.border};
    background: #fff;
    border-radius: 10px;
    font-size: 13px;
    cursor: pointer;
`;

const PrimaryBtn = styled.button<{ $disabled?: boolean }>`
    padding: ${TOKENS.space(6)} ${TOKENS.space(12)};
    border: none;
    background: ${({ $disabled }) => ($disabled ? "#93c5fd" : "#2563eb")};
    color: #fff;
    border-radius: 10px;
    font-size: 13px;
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    opacity: ${({ $disabled }) => ($disabled ? 0.8 : 1)};
`;

type PathNode = { id: number; name: string; depth: 0 | 1 | 2 };

type Props = {
    /** URL 복원 등으로 초기 경로를 주고 싶을 때 (예: [1, 4, 12]) */
    initialPathIds?: number[];
    /** 적용 시 외부 콜백 (라우팅 책임을 위임) */
    onApply?: (path: PathNode[]) => void;
};

const CategoryDropdownPicker: React.FC<Props> = ({ initialPathIds, onApply }) => {
    const [sel0, setSel0] = React.useState<number | "">(initialPathIds?.[0] ?? "");
    const [sel1, setSel1] = React.useState<number | "">(initialPathIds?.[1] ?? "");
    const [sel2, setSel2] = React.useState<number | "">(initialPathIds?.[2] ?? "");

    // initialPathIds가 바뀌면 동기화
    React.useEffect(() => {
        if (!initialPathIds) return;
        setSel0(initialPathIds[0] ?? "");
        setSel1(initialPathIds[1] ?? "");
        setSel2(initialPathIds[2] ?? "");
    }, [initialPathIds?.[0], initialPathIds?.[1], initialPathIds?.[2]]); // 개별 의존성으로 안전하게

    const sel0Num = typeof sel0 === "number" ? sel0 : null;
    const sel1Num = typeof sel1 === "number" ? sel1 : null;
    const sel2Num = typeof sel2 === "number" ? sel2 : null;

    const { level0, level1, level2 } = useCategoryTree(sel0Num, sel1Num);

    const find = (arr: Category[], id?: number | null) => arr.find((x) => x.id === id) ?? null;

    const path: PathNode[] = React.useMemo(() => {
        const p0 = sel0Num ? find(level0.items, sel0Num) : null;
        const p1 = sel1Num ? find(level1.items, sel1Num) : null;
        const p2 = sel2Num ? find(level2.items, sel2Num) : null;
        return [p0, p1, p2].filter(Boolean).map((c) => ({ id: c!.id, name: c!.name, depth: c!.depth }));
    }, [sel0Num, sel1Num, sel2Num, level0.items, level1.items, level2.items]);

    const resetAll = () => {
        setSel0("");
        setSel1("");
        setSel2("");
    };

    const apply = () => {
        if (onApply) onApply(path);
    };

    // 드롭다운 변경 핸들러
    const onChange0 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : "";
        setSel0(val);
        setSel1("");
        setSel2("");
    };

    const onChange1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : "";
        setSel1(val);
        setSel2("");
    };

    const onChange2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : "";
        setSel2(val);
    };

    // 플레이스홀더 문구
    const ph0 = "대분류를 선택하세요.";
    const ph1 = sel0Num
        ? level1.loading
            ? "불러오는 중..."
            : level1.items.length
                ? "중분류를 선택하세요."
                : "하위 분류 없음"
        : "중분류를 선택하세요.";
    const ph2 = sel1Num
        ? level2.loading
            ? "불러오는 중..."
            : level2.items.length
                ? "소분류를 선택하세요."
                : "하위 분류 없음"
        : "소분류를 선택하세요.";

    return (
        <Panel>
            <Row>
                <Field>
                    <Label>대분류</Label>
                    <Select aria-label="대분류" value={sel0} onChange={onChange0}>
                        <option value="">{ph0}</option>
                        {level0.items.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field>
                    <Label>중분류</Label>
                    <Select
                        aria-label="중분류"
                        value={sel1}
                        onChange={onChange1}
                        $disabled={!sel0Num}
                        disabled={!sel0Num}
                    >
                        <option value="">{ph1}</option>
                        {sel0Num &&
                            level1.items.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                    </Select>
                </Field>

                <Field>
                    <Label>소분류</Label>
                    <Select
                        aria-label="소분류"
                        value={sel2}
                        onChange={onChange2}
                        $disabled={!sel1Num || level2.items.length === 0}
                        disabled={!sel1Num || level2.items.length === 0}
                    >
                        <option value="">{ph2}</option>
                        {sel1Num &&
                            level2.items.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                    </Select>
                </Field>
            </Row>

            <Footer>
                {path.length === 0 ? (
                    <Spacer>선택한 분류가 없습니다.</Spacer>
                ) : (
                    <>
                        {path.map((p, i) => (
                            <React.Fragment key={p.id}>
                                <Chip>{p.name}</Chip>
                                {i < path.length - 1 && <Spacer>›</Spacer>}
                            </React.Fragment>
                        ))}
                    </>
                )}

                <Right>
                    <GhostBtn type="button" onClick={resetAll}>
                        전체 초기화
                    </GhostBtn>
                    <PrimaryBtn type="button" onClick={apply} $disabled={path.length === 0} aria-disabled={path.length === 0}>
                        선택한 분류로 보기
                    </PrimaryBtn>
                </Right>
            </Footer>
        </Panel>
    );
};

export default CategoryDropdownPicker;
