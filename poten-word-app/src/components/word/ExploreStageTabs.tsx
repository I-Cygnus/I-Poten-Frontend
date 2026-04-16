import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useCategoryTree, Category } from "../../hooks/useCategoryTree";

type TabKey = "job" | "lang" | "initial" | "etc";

const LINE = {
    outline: "rgba(17, 24, 39, 0.18)",
    divider: "rgba(17, 24, 39, 0.12)",
    hair:   "rgba(17, 24, 39, 0.10)",
};

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

function LangGridPanel({
                           items,
                           selected,
                           onPick,
                       }: {
    items: { id: number; label: string }[];
    selected: number | null;
    onPick: (item: { id: number; label: string }) => void;
}) {
    return (
        <LangFrame aria-label="언어별 찾기" className="panelTop">
            <LangGrid>
                {items.map((it) => {
                    const active = selected === it.id;
                    return (
                        <LangCell
                            key={it.id}
                            type="button"
                            $active={active}
                            onClick={() => onPick(it)}
                            aria-pressed={active}
                            title={it.label.replace("\n", " ")}
                        >
                            <LangText $active={active}>{it.label}</LangText>
                        </LangCell>
                    );
                })}
            </LangGrid>
        </LangFrame>
    );
}

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

type Props = {
    defaultCollapsed?: boolean;
};

export default function ExploreStageTabs({ defaultCollapsed }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

    const [active, setActive] = React.useState<TabKey>("job");
    const [selection, setSelection] = React.useState<ExploreSelection>({ kind: "none" });

    const [collapsed, setCollapsed] = React.useState(!!defaultCollapsed);
    const userToggledRef = React.useRef(false);

    React.useEffect(() => {
        if (userToggledRef.current) return;
        setCollapsed(!!defaultCollapsed);
    }, [defaultCollapsed]);

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
    const [langSelected, setLangSelected] = React.useState<number | null>(null);

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

        userToggledRef.current = true;

        const sp = buildSearchParams();
        navigate({ pathname: "/learning/search", search: `?${sp.toString()}` });
    }, [canSearch, buildSearchParams, navigate]);

    const clearAndSet = React.useCallback((next: ExploreSelection) => {
        setJobSelJob(null); setJobSelTopic(null);
        setEtcSelGroup(null); setEtcSelItem(null);
        setLangSelected(null);
        setGlyphSelected(null);

        setSelection(next);
    }, []);

    const onTabClick = React.useCallback(
        (key: TabKey) => {
            userToggledRef.current = true;
            if (key !== active) {
                resetAll();
            }

            setActive(key);
            setCollapsed(false);
        },
        [active, resetAll]
    );

    function renderCrumbs(label: string) {
        if (!label.includes(" > ")) return label;

        const parts = label.split(" > ").map(s => s.trim()).filter(Boolean);

        return parts.map((p, idx) => (
            <React.Fragment key={`${p}-${idx}`}>
                {idx > 0 && (
                    <PathSepIcon aria-hidden="true" focusable="false" viewBox="0 0 20 20">
                        <path d="M7.5 4.5l5 5-5 5" />
                    </PathSepIcon>
                )}
                <CrumbText title={p}>{p}</CrumbText>
            </React.Fragment>
        ));
    }

    return (
        <Root>
            <TabRow role="tablist" aria-label="탐색 방식">
                {TABS.map((t) => {
                    const isActive = active === t.key;
                    return (
                        <TabBtn
                            key={t.key}
                            role="tab"
                            aria-selected={isActive}
                            $active={isActive}
                            type="button"
                            onClick={() => onTabClick(t.key)}
                        >
                            <TabLabel $active={isActive}>{t.label}</TabLabel>
                        </TabBtn>
                    );
                })}
            </TabRow>

            <PanelsArea $collapsed={collapsed}>
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
                                setSelection({ kind: "partial", label: text });
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
                            onPick={(item) => {
                                setLangSelected(item.id);

                                const label = `언어별: ${item.label.replace("\n", " ")}`;
                                const catPath = `${LANG_ROOT_ID}/${item.id}`;

                                setSelection({ kind: "catPath", label, catPath });

                                {active === "lang" && (
                                    <LangGridPanel
                                        items={LANG_ITEMS}
                                        selected={langSelected}
                                        onPick={(item) => {
                                            setLangSelected(item.id);

                                            const label = `언어별: ${item.label.replace("\n", " ")}`;
                                            const catPath = `${LANG_ROOT_ID}/${item.id}`; // depth 2

                                            // 선택만 세팅 (이동은 아래 "검색" 버튼에서)
                                            setSelection({ kind: "catPath", label, catPath });
                                        }}
                                    />
                                )}
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

                                // 선택만 세팅 (이동은 "검색" 버튼에서)
                                setSelection({ kind: "glyph", label, mode, value });
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
                                setSelection({ kind: "partial", label: formatKoEn(ko, en) });
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
                </BoxStack>
            </PanelsArea>

            {/* SummaryBar*/}
            <SummaryBar
                $collapsed={collapsed}
                $variant="full"
                aria-label="선택 요약"
            >
                <SummaryLeft>
                    {selection.kind === "none" ? (
                        <SummaryEmpty>선택한 항목이 없습니다.</SummaryEmpty>
                    ) : (
                        <ChipWrap>
                            <SummaryChip title={selection.label}>
                                <ChipText>
                                    <CrumbRow aria-label={selection.label}>
                                        {renderCrumbs(selection.label)}
                                    </CrumbRow>
                                </ChipText>
                            </SummaryChip>

                            <ChipX
                                type="button"
                                aria-label="선택 제거"
                                onClick={resetAll}
                                title="선택 제거"
                            >
                                ×
                            </ChipX>
                        </ChipWrap>
                    )}
                </SummaryLeft>

                <SummaryRight>
                    <GoBtn type="button" onClick={onSearch} disabled={!canSearch}>
                        검색
                    </GoBtn>
                </SummaryRight>
            </SummaryBar>
        </Root>
    );
}
/* ------------------- 패널들 ------------------- */

const LANG_ROOT_ID = 2;

const LANG_ITEMS: { id: number; label: string }[] = [
    { id: 94, label: "Java" },
    { id: 95, label: "Python" },
    { id: 96, label: "JavaScript" },
    { id: 97, label: "TypeScript" },
    { id: 98, label: "C / C++ / C#" },
    { id: 99, label: "SQL" },
    { id: 100, label: "Shell / Bash" },
    { id: 101, label: "Go(Golang)" },
    { id: 102, label: "Rust" },
    { id: 103, label: "Kotlin" },
    { id: 104, label: "Swift" },
    { id: 105, label: "Ruby" },
    { id: 106, label: "PHP" },
    { id: 107, label: "Dart" },
    { id: 108, label: "R" },
    { id: 109, label: "Julia" },
    { id: 110, label: "Assembly" },
    { id: 111, label: "Bash" },
    { id: 112, label: "PowerShell" },
    { id: 113, label: "HTML/CSS" },
    { id: 114, label: "GraphQL" },
    { id: 115, label: "Haskell, Scala, Elixir" },
    { id: 116, label: "Objective-C" },
    { id: 117, label: "Lua" },
];

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
                <PickGrid $cols={18}>
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
    align-items: stretch;
    width: 100%;
    max-width: 1060px;
    margin: 0 auto 18px;

    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(17, 24, 39, 0.18);
    border-radius: 14px;

    overflow: hidden;
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);

    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar { height: 0; }
`;

const TAB_DIVIDER_INSET_Y = 12;

const TabBtn = styled.button<{ $active?: boolean }>`
    position: relative;
    flex: 1 0 0;
    min-width: 160px;

    border: 0;
    background: ${({ $active }) => ($active ? "rgba(79, 118, 241, 0.08)" : "transparent")};

    color: #0f172a;
    font-weight: 750;
    font-size: 18px;
    letter-spacing: -0.015em;

    padding: 16px 18px;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:not(:last-child)::after {
        content: "";
        position: absolute;
        right: 0;
        top: ${TAB_DIVIDER_INSET_Y}px;
        bottom: ${TAB_DIVIDER_INSET_Y}px;
        width: 1px;
        background: ${LINE.divider};
        border-radius: 999px;
    }

    transition: background 140ms ease, transform 80ms ease;

    &:hover {
        background: ${({ $active }) =>
                $active ? "rgba(79, 118, 241, 0.10)" : "rgba(15, 23, 42, 0.03)"};
    }

    &:active {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 3px rgba(79, 118, 241, 0.20);
    }

    @media (max-width: 640px) {
        font-size: 14px;
        padding: 12px 10px;
        min-width: 120px;
    }
`;

const TabLabel = styled.span<{ $active?: boolean }>`
    position: relative;
    display: inline-block;
    padding-bottom: 6px;

    &::after {
        content: "";
        position: absolute;
        left: -8px;
        right: -8px;
        bottom: 0;

        height: 6px;
        border-radius: 999px;
        background: rgba(79, 118, 241, 0.35);

        transform-origin: left center;
        transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
        opacity: ${({ $active }) => ($active ? 1 : 0)};

        transition: transform 320ms cubic-bezier(.16, 1, .3, 1), opacity 200ms ease;

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
`;

const BoxStack = styled.div`
    width: 100%;
`;

const PanelFrame = styled.div`
    border: 1px solid ${LINE.outline};
    border-radius: 14px 14px 0 0;
    border-bottom: 0;
    background: #ffffff;
    padding: 24px;
`;

const LangFrame = styled.div`
    border: 1px solid ${LINE.outline};
    border-radius: 14px 14px 0 0;
    border-bottom: 0;

    background: #ffffff;
    padding: 0;
    overflow: hidden;
`;

const InitialFrame = styled.div`
    border: 1px solid ${LINE.outline};
    border-radius: 14px 14px 0 0;
    border-bottom: 0;
    background: #ffffff;

    padding: 30px 22px 26px;
    width: 100%;
    max-width: 1060px;
    margin: 0 auto;
    box-sizing: border-box;
`;

const SummaryBar = styled.div<{ $collapsed: boolean; $variant: "full" | "narrow" }>`
    width: 100%;
    max-width: ${({ $variant }) => ($variant === "narrow" ? "860px" : "1060px")};
    margin: 0 auto;

    border: 1px solid rgba(17, 24, 39, 0.10);
    border-radius: 0 0 28px 28px;

    background: rgba(248, 250, 252, 0.95);

    padding: 18px 18px;
    min-height: 84px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;

    margin-top: -1px;
    border-top-color: transparent;

    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);

    @media (max-width: 720px) {
        max-width: 100%;
        padding: 14px 12px;
        min-height: auto;
        border-radius: 0 0 22px 22px;
    }
`;

const SummaryLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
`;

const SummaryRight = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SummaryChip = styled.div`
    display: inline-flex;
    align-items: center;

    padding: 8px 12px;

    border-radius: 999px;
    border: 1px solid rgba(17, 24, 39, 0.10);

    font-weight: 500;
    font-size: 14px;
    letter-spacing: -0.02em;
    line-height: 1.2;

    max-width: 100%;
`;

const ChipWrap = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
`;

const ChipText = styled.span<{ $placeholder?: boolean }>`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: rgba(17, 24, 39, 0.55);
`;

const ChipX = styled.button`
    flex: 0 0 auto;
    width: auto;
    height: auto;
    border-radius: 0;

    border: 0;
    background: transparent;
    padding: 0 2px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    color: rgba(17, 24, 39, 0.55);
    font-size: 18px;
    line-height: 1;

    transition: none;

    &:hover {
        background: transparent;
        color: rgba(17, 24, 39, 0.55);
    }

    &:active {
        transform: none;
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 118, 241, 0.22);
        border-radius: 6px;
    }
`;
const SummaryEmpty = styled.div`
    font-size: 15px;
    color: rgba(17, 24, 39, 0.55);
    letter-spacing: -0.02em;
`;

const SummaryHint = styled.div`
    font-size: 14px;
    color: rgba(17, 24, 39, 0.55);
    letter-spacing: -0.02em;
    white-space: nowrap;

    @media (max-width: 720px) {
        display: none;
    }
`;

const SummaryText = styled.div`
    font-size: 16px;
    color: #111827;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    -webkit-text-fill-color: #ffffff;

    transition: transform 80ms ease, background 140ms ease, box-shadow 140ms ease;

    &:hover:not(:disabled) {
        background: ${UI.primaryBtnHover};
        color: #ffffff;
        -webkit-text-fill-color: #ffffff;
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
        -webkit-text-fill-color: rgba(255,255,255,0.9);
        box-shadow: none;
    }
`;

const LangGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 1px;
    background: ${LINE.divider};

    @media (max-width: 1024px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const LangCell = styled.button<{ $active?: boolean }>`
    appearance: none;
    -webkit-appearance: none;

    border: 0;
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
        background: ${({ $active }) => ($active ? "#EEF2FF" : "#F6F7F9")};
        outline: none !important;
        box-shadow: none !important;
    }

    &:focus,
    &:focus-visible,
    &:active {
        outline: none !important;
        box-shadow: none !important;
    }

    @media (max-width: 640px) {
        min-height: 68px;
        padding: 12px 8px;
    }
`;

const LangText = styled.div<{ $active?: boolean }>`
    position: relative;
    display: inline-block;

    font-size: 16px;
    font-weight: 600;
    color: #111827;
    letter-spacing: -0.015em;

    line-height: 1.3;
    white-space: pre-line;

    padding-bottom: 6px;

    &::after {
        content: "";
        position: absolute;

        left: -2px;
        right: -2px;

        bottom: 2px;
        height: 2px;
        border-radius: 999px;

        background: rgba(17, 24, 39, 0.75);

        transform-origin: left center;
        transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
        opacity: ${({ $active }) => ($active ? 1 : 0)};

        transition: transform 320ms cubic-bezier(.16, 1, .3, 1),
        opacity 160ms ease;
        will-change: transform;

        @media (max-width: 640px) {
            font-size: 13px;
        }
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

    border: 2px dotted ${LINE.divider};
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

const PickGrid = styled.div<{ $cols?: number }>`
    display: grid;
    grid-template-columns: repeat(${({ $cols }) => $cols ?? GRID_COLS}, 44px);
    gap: 7px;
    justify-content: start;

    @media (max-width: 980px) {
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

const PanelsArea = styled.div<{ $collapsed: boolean }>`
    overflow: hidden;
    max-height: ${({ $collapsed }) => ($collapsed ? "0px" : "3000px")};
    opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
    transition: max-height 260ms cubic-bezier(.16, 1, .3, 1), opacity 160ms ease;
    margin-top: -1px;
`;

const CrumbRow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
`;

const CrumbText = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const PathSepIcon = styled.svg`
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
    opacity: 0.55;

    path {
        fill: none;
        stroke: currentColor;
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
`;
