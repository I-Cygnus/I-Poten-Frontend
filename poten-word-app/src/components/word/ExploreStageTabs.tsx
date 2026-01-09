import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useCategoryTree, Category } from "../../hooks/useCategoryTree";

type TabKey = "job" | "lang" | "initial" | "etc";

const TABS: { key: TabKey; label: string }[] = [
    { key: "job", label: "직무별 찾기" },
    { key: "lang", label: "언어별 찾기" },
    { key: "initial", label: "초성으로 찾기" },
    { key: "etc", label: "기타" },
];

type FilterMode = "initial" | "alpha" | "symbol";
type GlyphKind = "ko" | "alpha" | "symbol";

const INITIALS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const ALPHABETS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const SYMBOLS = ["@","#","$","%","&","*","/","?","-","_",".","!"];

const LANG_ITEMS: string[] = [
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "C / C++ / C#",
    "SQL",
    "Shell / Bash",
    "Go(Golang)",
    "Rust",
    "Kotlin",
    "Swift",
    "Ruby",
    "PHP",
    "Dart",
    "R",
    "Julia",
    "Assembly",
    "Bash",
    "PowerShell",
    "HTML/CSS",
    "GraphQL",
    "Haskell, Scala,\nElixir",
    "Objective-C",
    "Lua",
];

const JOB_KO_MAP: Record<string, string> = {
    "Frontend": "프론트엔드",
    "Backend": "백엔드",
    "Database": "데이터베이스",
    "Network": "네트워크",
    "Operating System": "운영체제",
    "Data Structure & Algorithm": "자료구조 & 알고리즘",
    "Security": "보안",
    "Software Engineering": "소프트웨어 공학",
    "DevOps / Cloud": "데브옵스 / 클라우드",
    "Computer Science": "컴퓨터 과학",
    "AI / Data / Machine Learning": "인공지능 / 데이터 / 머신러닝",
    "Embedded / IoT / System Programming": "임베디드 / IoT / 시스템 프로그래밍",
};

function hasHangul(s: string) {
    return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(s);
}

function formatKoEn(ko: string, en: string) {
    const k = (ko ?? "").trim();
    const e = (en ?? "").trim();
    if (!k && !e) return "";
    if (k && e && k.toLowerCase() !== e.toLowerCase()) return `${k}(${e})`;
    return k || e;
}

function getJobKoEn(c: Category) {
    const nameRaw = String(c.name ?? "").trim();
    const enRaw = String(c.group_name || c.type || c.name || "").trim();
    const ko = hasHangul(nameRaw) ? nameRaw : (JOB_KO_MAP[enRaw] ?? nameRaw ?? enRaw);
    const en = enRaw || nameRaw;
    return { ko, en, text: formatKoEn(ko, en) };
}

type ExploreSelection =
    | { kind: "none" }
    | { kind: "partial"; label: string; hint?: string } // 직무만/기타 분류만 고른 상태
    | { kind: "catPath"; label: string; catPath: string } // 직무/기타: root/level1/level2
    | { kind: "tag"; label: string; tag: string }         // 언어별
    | { kind: "glyph"; label: string; mode: FilterMode; value: string }; // 초성/알파벳/기호

export default function ExploreStageTabs() {
    const navigate = useNavigate();
    const location = useLocation();

    const [active, setActive] = React.useState<TabKey>("job");
    const [selection, setSelection] = React.useState<ExploreSelection>({ kind: "none" });

    // JOB / ETC Root (DB에 맞게)
    const JOB_ROOT_ID = 1;
    const ETC_ROOT_ID = 3;

    // job panel state
    const [jobSelJob, setJobSelJob] = React.useState<number | null>(null);
    const [jobSelTopic, setJobSelTopic] = React.useState<number | null>(null);

    // etc panel state
    const [etcSelGroup, setEtcSelGroup] = React.useState<number | null>(null);
    const [etcSelItem, setEtcSelItem] = React.useState<number | null>(null);

    // lang panel state
    const [langSelected, setLangSelected] = React.useState<string | null>(null);

    // initial panel state
    const [glyphSelected, setGlyphSelected] = React.useState<{ mode: FilterMode; value: string } | null>(null);

    const resetAll = React.useCallback(() => {
        setSelection({ kind: "none" });

        setJobSelJob(null);
        setJobSelTopic(null);

        setEtcSelGroup(null);
        setEtcSelItem(null);

        setLangSelected(null);

        setGlyphSelected(null);
    }, []);

    const buildSearchParams = React.useCallback(() => {
        const sp = new URLSearchParams(location.search);

        // 탭 선택 검색용 파라미터만 남기고 정리
        ["q", "tag", "catPath", "page", "size", "initial", "alpha", "symbol"].forEach((k) => sp.delete(k));

        if (selection.kind === "catPath") {
            sp.set("catPath", selection.catPath);
        } else if (selection.kind === "tag") {
            sp.set("tag", selection.tag);
        } else if (selection.kind === "glyph") {
            sp.set(selection.mode, selection.value);
        }

        return sp;
    }, [location.search, selection]);

    const canSearch = selection.kind === "catPath" || selection.kind === "tag" || selection.kind === "glyph";

    const onSearch = React.useCallback(() => {
        if (!canSearch) return;
        const sp = buildSearchParams();
        navigate({ pathname: "/poten-word/search", search: `?${sp.toString()}` });
    }, [canSearch, buildSearchParams, navigate]);

    const clearAndSet = React.useCallback((next: ExploreSelection) => {
        // 다른 탭 선택 잔상/하이라이트 정리
        setJobSelJob(null); setJobSelTopic(null);
        setEtcSelGroup(null); setEtcSelItem(null);
        setLangSelected(null);
        setGlyphSelected(null);

        setSelection(next);
    }, []);

    return (
        <Root>
            <TabRow role="tablist" aria-label="탐색 방식">
                {TABS.map((t) => (
                    <TabBtn
                        key={t.key}
                        role="tab"
                        aria-selected={active === t.key}
                        $active={active === t.key}
                        type="button"
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </TabBtn>
                ))}
            </TabRow>

            <BoxStack>
                {active === "job" && (
                    <JobTopicPanel
                        JOB_ROOT_ID={JOB_ROOT_ID}
                        selJob={jobSelJob}
                        selTopic={jobSelTopic}
                        onPickJob={(job) => {
                            setJobSelJob(job.id);
                            setJobSelTopic(null);

                            const { text } = getJobKoEn(job);
                            setSelection({ kind: "partial", label: text, hint: "주제를 선택해 주세요." });
                        }}
                        onPickTopic={(job, topic) => {
                            setJobSelJob(job.id);
                            setJobSelTopic(topic.id);

                            const jobText = getJobKoEn(job).text;
                            const label = `${jobText} > ${topic.name}`;
                            const catPath = `${JOB_ROOT_ID}/${job.id}/${topic.id}`;
                            setSelection({ kind: "catPath", label, catPath });
                        }}
                    />
                )}

                {active === "lang" && (
                    <LangGridPanel
                        items={LANG_ITEMS}
                        selected={langSelected}
                        onPick={(label) => {
                            setLangSelected(label);
                            setSelection({ kind: "tag", label: `언어별: ${label.replace("\n", " ")}`, tag: label });
                        }}
                    />
                )}

                {active === "initial" && (
                    <InitialPickerPanel
                        selected={glyphSelected}
                        onPick={(mode, value) => {
                            setJobSelJob(null); setJobSelTopic(null);
                            setEtcSelGroup(null); setEtcSelItem(null);
                            setLangSelected(null);

                            setGlyphSelected({ mode, value });

                            const label =
                                mode === "initial" ? `초성: ${value}` :
                                    mode === "alpha"   ? `알파벳: ${value}` :
                                        `기호: ${value}`;

                            setSelection({ kind: "glyph", label, mode, value });

                            const sp = new URLSearchParams(location.search);
                            ["q","tag","catPath","page","size","initial","alpha","symbol"].forEach((k) => sp.delete(k));
                            sp.set(mode, value);

                            navigate({ pathname: "/poten-word/search", search: `?${sp.toString()}` });
                        }}
                    />
                )}

                {active === "etc" && (
                    <EtcTopicPanel
                        ETC_ROOT_ID={ETC_ROOT_ID}
                        selGroup={etcSelGroup}
                        selItem={etcSelItem}
                        onPickGroup={(group) => {
                            setEtcSelGroup(group.id);
                            setEtcSelItem(null);

                            const ko = String(group.name || "").trim();
                            const en = String(group.group_name || group.type || "").trim();
                            setSelection({ kind: "partial", label: formatKoEn(ko, en), hint: "주제를 선택해 주세요." });
                        }}
                        onPickItem={(group, item) => {
                            setEtcSelGroup(group.id);
                            setEtcSelItem(item.id);

                            const ko = String(group.name || "").trim();
                            const en = String(group.group_name || group.type || "").trim();
                            const groupText = formatKoEn(ko, en);

                            const label = `${groupText} > ${item.name}`;
                            const catPath = `${ETC_ROOT_ID}/${group.id}/${item.id}`;
                            setSelection({ kind: "catPath", label, catPath });
                        }}
                    />
                )}

                {/* 아래 요약 바: 선택 내용 표시 + 초기화 + 검색 */}
                {active !== "initial" && (
                    <SummaryBar aria-label="선택 요약">
                        <SummaryLeft>
                            {selection.kind === "none" ? (
                                <SummaryEmpty>선택한 항목이 없습니다.</SummaryEmpty>
                            ) : (
                                <>
                                    <SummaryText>{selection.label}</SummaryText>
                                    {selection.kind === "partial" && selection.hint && (
                                        <SummaryHint>{selection.hint}</SummaryHint>
                                    )}
                                    <SummaryX
                                        type="button"
                                        aria-label="선택 제거"
                                        onClick={resetAll}
                                        title="선택 제거"
                                    >
                                        ×
                                    </SummaryX>
                                </>
                            )}
                        </SummaryLeft>

                        <SummaryRight>
                            <ClearBtn type="button" onClick={resetAll} disabled={selection.kind === "none"}>
                                선택 초기화
                            </ClearBtn>
                            <GoBtn type="button" onClick={onSearch} disabled={!canSearch}>
                                검색
                            </GoBtn>
                        </SummaryRight>
                    </SummaryBar>
                )}
            </BoxStack>
        </Root>
    );
}

/* ------------------- 패널들 ------------------- */

function LangGridPanel({
                           items,
                           selected,
                           onPick,
                       }: {
    items: string[];
    selected: string | null;
    onPick: (label: string) => void;
}) {
    return (
        <LangFrame aria-label="언어별 찾기" className="panelTop">
            <LangGrid>
                {items.map((label) => {
                    const active = selected === label;
                    return (
                        <LangCell
                            key={label}
                            type="button"
                            $active={active}
                            onClick={() => onPick(label)}
                            aria-pressed={active}
                            title={label.replace("\n", " ")}
                        >
                            <LangText $active={active}>{label}</LangText>
                        </LangCell>
                    );
                })}
            </LangGrid>
        </LangFrame>
    );
}

function InitialPickerPanel({
                                selected,
                                onPick,
                            }: {
    selected: { mode: FilterMode; value: string } | null;
    onPick: (mode: FilterMode, value: string) => void;
}) {
    const isActive = (mode: FilterMode, value: string) =>
        selected?.mode === mode && selected?.value === value;

    return (
        <InitialFrame aria-label="초성으로 찾기">
            <PickRow>
                <PickLabel>초성</PickLabel>
                <PickGrid>
                    {INITIALS.map((v) => (
                        <PickBtn
                            key={`initial-${v}`}
                            $kind="ko"
                            type="button"
                            $active={isActive("initial", v)}
                            aria-pressed={isActive("initial", v)}
                            onClick={() => onPick("initial", v)}
                        >
                            {v}
                        </PickBtn>
                    ))}
                </PickGrid>
            </PickRow>

            <PickRow>
                <PickLabel>알파벳</PickLabel>
                <PickGrid>
                    {ALPHABETS.map((v) => (
                        <PickBtn
                            key={`alpha-${v}`}
                            $kind="alpha"
                            type="button"
                            $active={isActive("alpha", v)}
                            aria-pressed={isActive("alpha", v)}
                            onClick={() => onPick("alpha", v)}
                        >
                            {v}
                        </PickBtn>
                    ))}
                </PickGrid>
            </PickRow>

            <PickRowLast>
                <PickLabel>기호</PickLabel>
                <PickGrid>
                    {SYMBOLS.map((v) => (
                        <PickBtn
                            key={`symbol-${v}`}
                            $kind="symbol"
                            type="button"
                            $active={isActive("symbol", v)}
                            aria-pressed={isActive("symbol", v)}
                            onClick={() => onPick("symbol", v)}
                            title={v}
                        >
                            {v}
                        </PickBtn>
                    ))}
                </PickGrid>
            </PickRowLast>
        </InitialFrame>
    );
}

function JobTopicPanel({
                           JOB_ROOT_ID,
                           selJob,
                           selTopic,
                           onPickJob,
                           onPickTopic,
                       }: {
    JOB_ROOT_ID: number;
    selJob: number | null;
    selTopic: number | null;
    onPickJob: (job: Category) => void;
    onPickTopic: (job: Category, topic: Category) => void;
}) {
    const tree = useCategoryTree(JOB_ROOT_ID, selJob);

    const find = (arr: Category[], id?: number | null) => arr.find((x) => x.id === id) ?? null;
    const selectedJob = selJob ? find(tree.level1.items, selJob) : null;

    return (
        <PanelFrame aria-label="직무별 찾기" className="panelTop">
            <Cols>
                <Col>
                    <ColTitle>직무</ColTitle>
                    <ScrollPillBox maxHeight={420}>
                        {tree.level1.loading ? (
                            <Loading>불러오는 중...</Loading>
                        ) : tree.level1.items.length === 0 ? (
                            <Empty>직무 분류(depth=1)가 없습니다. (JOB_ROOT_ID 확인)</Empty>
                        ) : (
                            tree.level1.items.map((c) => (
                                <ListItem
                                    key={c.id}
                                    type="button"
                                    $active={selJob === c.id}
                                    onClick={() => onPickJob(c)}
                                >
                                    <NameBlock>
                                        <KName>{getJobKoEn(c).ko || c.name}</KName>
                                        <EnName>({getJobKoEn(c).en})</EnName>
                                    </NameBlock>
                                </ListItem>
                            ))
                        )}
                    </ScrollPillBox>
                </Col>

                <Col>
                    <ColTitle>주제</ColTitle>
                    <ScrollPillBox maxHeight={420}>
                        {!selJob ? (
                            <Empty>직무를 먼저 선택해 주세요.</Empty>
                        ) : tree.level2.loading ? (
                            <Loading>불러오는 중...</Loading>
                        ) : tree.level2.items.length === 0 ? (
                            <Empty>해당 직무의 주제(depth=2)가 없습니다.</Empty>
                        ) : (
                            tree.level2.items.map((c) => (
                                <ListItem
                                    key={c.id}
                                    type="button"
                                    $active={selTopic === c.id}
                                    onClick={() => {
                                        const job = selectedJob;
                                        if (!job) return;
                                        onPickTopic(job, c);
                                    }}
                                >
                                    <NameBlock>
                                        <KName>{c.name}</KName>
                                    </NameBlock>
                                </ListItem>
                            ))
                        )}
                    </ScrollPillBox>
                </Col>
            </Cols>
        </PanelFrame>
    );
}

function EtcTopicPanel({
                           ETC_ROOT_ID,
                           selGroup,
                           selItem,
                           onPickGroup,
                           onPickItem,
                       }: {
    ETC_ROOT_ID: number;
    selGroup: number | null;
    selItem: number | null;
    onPickGroup: (group: Category) => void;
    onPickItem: (group: Category, item: Category) => void;
}) {
    const tree = useCategoryTree(ETC_ROOT_ID, selGroup);
    const find = (arr: Category[], id?: number | null) => arr.find((x) => x.id === id) ?? null;
    const selectedGroup = selGroup ? find(tree.level1.items, selGroup) : null;

    return (
        <PanelFrame aria-label="기타 찾기" className="panelTop">
            <Cols>
                <Col>
                    <ColTitle>분류</ColTitle>
                    <ScrollPillBox maxHeight={420}>
                        {tree.level1.loading ? (
                            <Loading>불러오는 중...</Loading>
                        ) : tree.level1.items.length === 0 ? (
                            <Empty>기타 분류(depth=1)가 없습니다. (ETC_ROOT_ID 확인)</Empty>
                        ) : (
                            tree.level1.items.map((c) => {
                                const ko = String(c.name || "").trim();
                                const en = String(c.group_name || c.type || "").trim();
                                const showEn = !!en && !!ko && en.toLowerCase() !== ko.toLowerCase();

                                return (
                                    <ListItem
                                        key={c.id}
                                        type="button"
                                        $active={selGroup === c.id}
                                        onClick={() => onPickGroup(c)}
                                    >
                                        <NameBlock>
                                            <KName>{ko}</KName>
                                            {showEn && <EnName>({en})</EnName>}
                                        </NameBlock>
                                    </ListItem>
                                );
                            })
                        )}
                    </ScrollPillBox>
                </Col>

                <Col>
                    <ColTitle>주제</ColTitle>
                    <ScrollPillBox maxHeight={420}>
                        {!selGroup ? (
                            <Empty>분류를 먼저 선택해 주세요.</Empty>
                        ) : tree.level2.loading ? (
                            <Loading>불러오는 중...</Loading>
                        ) : tree.level2.items.length === 0 ? (
                            <Empty>해당 분류의 주제가 없습니다.</Empty>
                        ) : (
                            tree.level2.items.map((c) => (
                                <ListItem
                                    key={c.id}
                                    type="button"
                                    $active={selItem === c.id}
                                    onClick={() => {
                                        const group = selectedGroup;
                                        if (!group) return;
                                        onPickItem(group, c);
                                    }}
                                >
                                    <NameBlock>
                                        <KName>{c.name}</KName>
                                    </NameBlock>
                                </ListItem>
                            ))
                        )}
                    </ScrollPillBox>
                </Col>
            </Cols>
        </PanelFrame>
    );
}

/* ================= styles ================= */

const UI = {
    primaryBtn: "#4F76F1",
    primaryBtnHover: "#3E63E0",
    primaryBtnDisabled: "rgba(79, 118, 241, 0.35)",
};

const Root = styled.div`
  width: 100%;
`;

const TabRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: clamp(32px, 8vw, 128px);
  padding: 6px 2px 16px;
  margin-bottom: 18px;

  @media (max-width: 720px) {
    justify-content: flex-start;
    overflow-x: auto;
    gap: 16px;
    padding-bottom: 10px;
  }
`;

const TabBtn = styled.button<{ $active?: boolean }>`
  position: relative;
  border: 0;
  background: transparent;
  cursor: pointer;

  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #111827;
  padding: 6px 8px 12px;

  &:first-child { margin-left: 10px; }
  &:last-child  { margin-right: 10px; }

  @media (max-width: 720px) {
    font-size: 18px;
    white-space: nowrap;
    padding: 6px 8px 10px;

    &:first-child { margin-left: 6px; }
    &:last-child  { margin-right: 6px; }
  }

  &::after {
    content: "";
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 2px;
    height: 5px;
    background: ${({ $active }) => ($active ? "#111827" : "transparent")};
    border-radius: 999px;
  }
`;

const BoxStack = styled.div`
  width: 100%;

  .panelTop {
    border-bottom: 0 !important;
  }
`;

const PanelFrame = styled.div`
  border: 1px solid rgba(17, 24, 39, 0.45);
  background: #ffffff;
  padding: 24px;
`;

const SummaryBar = styled.div`
  border: 1px solid rgba(17, 24, 39, 0.45);
  border-top: 1px solid rgba(17, 24, 39, 0.14);
  background: rgba(17, 24, 39, 0.03);
  padding: 18px 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const SummaryLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const SummaryText = styled.div`
  font-size: 16px;
  color: #111827;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SummaryHint = styled.div`
  font-size: 14px;
  color: rgba(17, 24, 39, 0.65);
  letter-spacing: -0.02em;
  white-space: nowrap;
`;

const SummaryEmpty = styled.div`
  font-size: 15px;
  color: rgba(17, 24, 39, 0.55);
  letter-spacing: -0.02em;
`;

const SummaryX = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  color: rgba(17, 24, 39, 0.55);
  font-size: 20px;
  line-height: 1;
  padding: 0 6px;
  margin-left: 2px;

  &:hover {
    color: rgba(17, 24, 39, 0.85);
  }
`;

const SummaryRight = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 720px) {
    justify-content: flex-end;
  }
`;

const ClearBtn = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  color: rgba(17, 24, 39, 0.8);
  letter-spacing: -0.02em;

  &:hover {
    color: rgba(17, 24, 39, 1);
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  &:disabled {
    cursor: default;
    color: rgba(17, 24, 39, 0.35);
    text-decoration: none;
  }
`;

const GoBtn = styled.button`
    border: 0;
    border-radius: 10px;
    padding: 10px 22px;
    font-size: 16px;
    font-weight: 750;
    cursor: pointer;

    background: ${UI.primaryBtn};
    color: #ffffff;

    transition: transform 80ms ease, background 140ms ease, box-shadow 140ms ease;

    &:hover:not(:disabled) {
        background: ${UI.primaryBtnHover};
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.28);
    }

    &:disabled {
        cursor: default;
        background: ${UI.primaryBtnDisabled};
        color: rgba(255,255,255,0.9);
        box-shadow: none;
    }
`;

const LangFrame = styled.div`
  border: 1px solid rgba(17, 24, 39, 0.45);
  background: #ffffff;
  overflow: hidden;
  box-shadow: none;
  outline: none;
  isolation: isolate;

  &:hover,
  &:focus-within {
    border-color: rgba(17, 24, 39, 0.45) !important;
    box-shadow: none !important;
    outline: none !important;
  }
`;

const LangGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0;

  border-top: 1px solid rgba(17, 24, 39, 0.12);
  border-left: 1px solid rgba(17, 24, 39, 0.12);

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 520px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const LangCell = styled.button<{ $active?: boolean }>`
  appearance: none;
  -webkit-appearance: none;

  border: 0;
  border-right: 1px solid rgba(17, 24, 39, 0.12);
  border-bottom: 1px solid rgba(17, 24, 39, 0.12);

  background: ${({ $active }) => ($active ? "#EEF2FF" : "#ffffff")};
  cursor: pointer;

  min-height: 78px;
  padding: 18px 14px;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  outline: none !important;
  box-shadow: none !important;

  transition: background 140ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#EEF2FF" : "rgba(17, 24, 39, 0.03)")};
    outline: none !important;
    box-shadow: none !important;
  }

  &:focus,
  &:focus-visible,
  &:active {
    outline: none !important;
    box-shadow: none !important;
  }
`;

const LangText = styled.div<{ $active?: boolean }>`
    position: relative;
    display: inline-block;

    font-size: 16px;
    font-weight: 600;
    color: #111827;
    letter-spacing: -0.015em;

    line-height: 1.25;
    white-space: pre-line;

    padding-bottom: ${({ $active }) => ($active ? "2px" : "0")};

    &::after {
        content: "";
        position: absolute;

        left: -2px;
        right: -2px;

        bottom: 2px;
        height: 2px;
        border-radius: 999px;
        background: ${({ $active }) => ($active ? "rgba(17, 24, 39, 0.75)" : "transparent")};
    }
`;

const Cols = styled.div`
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 22px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div``;

const ColTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 14px;
  letter-spacing: -0.02em;
`;

function ScrollPillBox({
                           children,
                           maxHeight = 420,
                       }: {
    children: React.ReactNode;
    maxHeight?: number;
}) {
    const PILL_INSET = 10;
    const PILL_MIN_H = 28;

    const ref = React.useRef<HTMLDivElement>(null);
    const [pill, setPill] = React.useState({ h: 0, y: 0, show: false });

    const update = React.useCallback(() => {
        const el = ref.current;
        if (!el) return;

        const viewportH = el.clientHeight;
        const contentH = el.scrollHeight;
        const st = el.scrollTop;

        if (contentH <= viewportH + 1) {
            setPill({ h: 0, y: 0, show: false });
            return;
        }

        const trackH = Math.max(0, viewportH - PILL_INSET * 2);
        const h = Math.max(PILL_MIN_H, Math.round((viewportH / contentH) * trackH));

        const maxY = Math.max(0, trackH - h);
        const rawY = (st / (contentH - viewportH)) * maxY;
        const y = Math.min(maxY, Math.max(0, Math.round(rawY)));

        setPill({ h, y, show: true });
    }, []);

    React.useLayoutEffect(() => {
        update();
        const el = ref.current;
        if (!el) return;

        const onScroll = () => update();
        el.addEventListener("scroll", onScroll, { passive: true });

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        const mo = new MutationObserver(() => update());
        mo.observe(el, { childList: true, subtree: true });

        return () => {
            el.removeEventListener("scroll", onScroll);
            ro.disconnect();
            mo.disconnect();
        };
    }, [update]);

    return (
        <ListBoxShell>
            <ListScroll ref={ref} $maxHeight={maxHeight}>
                {children}
            </ListScroll>

            {pill.show && (
                <ScrollPill
                    style={{
                        height: `${pill.h}px`,
                        transform: `translateY(${pill.y}px)`,
                    }}
                />
            )}
        </ListBoxShell>
    );
}

const ListBoxShell = styled.div`
  position: relative;
  overflow: hidden;

  border: 2px dotted rgba(17, 24, 39, 0.14);
  border-radius: 18px;
  background: #ffffff;
`;

const ListScroll = styled.div<{ $maxHeight: number }>`
  padding: 10px;
  max-height: ${({ $maxHeight }) => $maxHeight}px;
  overflow: auto;
  overscroll-behavior: contain;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  padding-right: 18px;
`;

const ScrollPill = styled.div`
  position: absolute;
  right: 6px;
  top: 10px;

  width: 8px;
  border-radius: 999px;
  background: rgba(156, 163, 175, 0.15);

  pointer-events: none;
`;

const ListItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 0;
  background: ${({ $active }) => ($active ? "#EEF2FF" : "transparent")};
  border-radius: 12px;
  padding: 14px 14px;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#EEF2FF" : "rgba(15, 23, 42, 0.03)")};
  }
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const KName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  letter-spacing: -0.02em;
`;

const EnName = styled.div`
  font-size: 14px;
  color: rgba(17, 24, 39, 0.75);
  letter-spacing: -0.02em;
`;

const Loading = styled.div`
  padding: 14px;
  color: #6b7280;
  font-size: 14px;
`;

const Empty = styled.div`
  padding: 14px;
  color: #6b7280;
  font-size: 14px;
`;

const InitialFrame = styled.div`
    border: 1px solid rgba(17, 24, 39, 0.45);
    background: #ffffff;
    padding: 30px 22px 26px;

    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    box-sizing: border-box;

    @media (max-width: 720px) {
        max-width: none;
        margin: 0;
        padding: 24px 16px 22px;
    }
`;

const LABEL_COL = 64;

const GRID_COLS = 14;

const PickRow = styled.div`
  display: grid;
  grid-template-columns: ${LABEL_COL}px 1fr;
  gap: 14px;
  align-items: start;
  margin-bottom: 22px;

  @media (max-width: 720px) {
    grid-template-columns: 56px 1fr;
    gap: 12px;
    margin-bottom: 18px;
  }
`;

const PickRowLast = styled(PickRow)`
  margin-bottom: 0;
`;

const PickLabel = styled.div`
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
`;

const PickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_COLS}, 44px);
  gap: 7px;
  justify-content: start;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(10, 44px);
  }
  @media (max-width: 720px) {
    grid-template-columns: repeat(7, 44px);
    gap: 10px;
  }
  @media (max-width: 420px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

const PickBtn = styled.button<{ $active?: boolean; $kind?: GlyphKind }>`
  width: 44px;
  height: 44px;
  border-radius: 6px;

  border: 1px solid ${({ $active }) => ($active ? "#4F76F1" : "rgba(17,24,39,0.14)")};
  background: ${({ $active }) => ($active ? "#EEF2FF" : "#ffffff")};

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-family: "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif;
  font-synthesis: none;

  font-weight: ${({ $active, $kind }) => ($active ? 650 : $kind === "ko" ? 550 : 500)};
  font-size: 16px;
  color: ${({ $active }) => ($active ? "#1d4ed8" : "#111827")};

  cursor: pointer;
  outline: none;
  box-shadow: none;
  transition: background 140ms ease, border-color 140ms ease, transform 80ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#EEF2FF" : "rgba(15, 23, 42, 0.02)")};
  }
  &:active { transform: scale(0.98); }
  &:focus-visible { box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.22); }

  @media (max-width: 420px) { width: 100%; }
`;