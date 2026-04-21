import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    FileText,
    Search,
    ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInterviewResultList, type InterviewSummary } from "../api/InterviewApi.ts";
import { notifyInfo } from "../utils/toast.ts";

const pretendard = css`
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Segoe UI",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  letter-spacing: -0.015em;
  word-break: keep-all;
`;

const interactiveText = css`
  ${pretendard};
  font: inherit;
  letter-spacing: -0.015em;
`;

const palette = {
    pageBlue: "#ffffff",
    pageMint: "#f8fafc",
    text: "#0f172a",
    textSoft: "rgba(15, 23, 42, 0.64)",
    textMuted: "rgba(15, 23, 42, 0.44)",
    border: "rgba(148, 163, 184, 0.22)",
    borderSoft: "rgba(148, 163, 184, 0.14)",
    primary: "#3b82f6",
    primaryStrong: "#2563eb",
    primaryRing: "rgba(59, 130, 246, 0.18)",
    primarySoft: "rgba(59, 130, 246, 0.1)",
    chipBg: "rgba(59, 130, 246, 0.08)",
    secondary: "#10b981",
    secondaryStrong: "#059669",
    secondaryHover: "#047857",
    secondarySoft: "rgba(16, 185, 129, 0.1)",
    warning: "#b45309",
    warningSoft: "rgba(245, 158, 11, 0.14)",
    shadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
    shadowSoft: "0 10px 24px rgba(15, 23, 42, 0.04)",
    radiusSm: "14px",
    radiusMd: "20px",
    radiusLg: "28px",
};

type FilterStatus = "all" | "completed" | "progress";

function formatDateTime(value: string) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getPdfViewUrl(record: InterviewSummary) {
    if (record.pdfUrl) return record.pdfUrl;
    if (record.interviewType === "인성 면접") {
        return `/vue-ai-interview/ai-interview/personality-result/${record.interviewId}`;
    }
    return `/vue-ai-interview/ai-interview/result/${record.interviewId}`;
}

export default function InterviewRecordListPage() {
    const navigate = useNavigate();
    const [records, setRecords] = useState<InterviewSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

    useEffect(() => {
        let mounted = true;

        const fetchRecords = async () => {
            try {
                setLoading(true);
                const nextRecords = await getInterviewResultList();

                if (mounted) {
                    setRecords(nextRecords);
                }
            } catch (error) {
                console.error(error);
                if (mounted) {
                    setRecords([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchRecords();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredRecords = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        return [...records]
            .filter((record) => {
                if (!query) return true;

                return [
                    record.title,
                    record.role,
                    record.interviewType,
                    record.status,
                ]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(query));
            })
            .filter((record) => {
                if (filterStatus === "completed") return record.finished;
                if (filterStatus === "progress") return !record.finished;
                return true;
            })
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    }, [filterStatus, records, searchText]);

    const completedCount = useMemo(
        () => records.filter((record) => record.finished).length,
        [records]
    );

    const handlePdfOpen = (record: InterviewSummary) => {
        if (!record.finished) {
            notifyInfo("아직 완료되지 않은 면접 기록입니다.");
            return;
        }

        window.open(getPdfViewUrl(record), "_blank", "noopener,noreferrer");
    };

    return (
        <Page>
            <PageInner>
                {/*<TopBar>*/}
                {/*    <BackButton type="button" onClick={() => navigate("/mypage")}>*/}
                {/*        <ArrowLeft size={18} />*/}
                {/*        마이페이지로 돌아가기*/}
                {/*    </BackButton>*/}
                {/*</TopBar>*/}

                <HeroCard>
                    <HeroContent>
                        <HeroTitle>AI 모의 면접 기록 전체 보기</HeroTitle>
                        <HeroDescription>
                            진행한 면접 기록을 모아보고, 완료된 면접은 결과 화면과 PDF 리포트까지 바로 확인할 수 있습니다.
                        </HeroDescription>
                    </HeroContent>

                    <HeroStats>
                        <HeroStatCard>
                            <HeroStatLabel>전체 기록</HeroStatLabel>
                            <HeroStatValue>{records.length}</HeroStatValue>
                        </HeroStatCard>
                        <HeroStatCard>
                            <HeroStatLabel>분석 완료</HeroStatLabel>
                            <HeroStatValue>{completedCount}</HeroStatValue>
                        </HeroStatCard>
                    </HeroStats>
                </HeroCard>

                <FilterCard>
                    <SearchBox>
                        <Search size={17} />
                        <SearchInput
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="면접명, 직무, 상태로 검색"
                        />
                    </SearchBox>

                    <FilterGroup>
                        <FilterChip
                            type="button"
                            $active={filterStatus === "all"}
                            onClick={() => setFilterStatus("all")}
                        >
                            전체
                        </FilterChip>
                        <FilterChip
                            type="button"
                            $active={filterStatus === "completed"}
                            onClick={() => setFilterStatus("completed")}
                        >
                            완료
                        </FilterChip>
                        <FilterChip
                            type="button"
                            $active={filterStatus === "progress"}
                            onClick={() => setFilterStatus("progress")}
                        >
                            진행 중
                        </FilterChip>
                    </FilterGroup>
                </FilterCard>

                {loading ? (
                    <StateCard>면접 기록을 불러오는 중입니다.</StateCard>
                ) : filteredRecords.length === 0 ? (
                    <StateCard>
                        {records.length === 0
                            ? "아직 저장된 면접 기록이 없습니다."
                            : "조건에 맞는 면접 기록이 없습니다."}
                    </StateCard>
                ) : (
                    <ListWrap>
                        {filteredRecords.map((record) => (
                            <RecordCard key={record.interviewId}>
                                <RecordMain>
                                    <RecordTop>
                                        <TypeBadge>{record.interviewType}</TypeBadge>
                                        <StatusBadge $finished={record.finished}>
                                            {record.finished ? "분석 완료" : "진행 중"}
                                        </StatusBadge>
                                    </RecordTop>

                                    <RecordTitle>{record.title || record.interviewType}</RecordTitle>

                                    <RecordMetaRow>
                                        <MetaItem>
                                            <ShieldCheck size={14} />
                                            {record.role || "직무 정보 없음"}
                                        </MetaItem>
                                        <MetaItem>
                                            <CalendarDays size={14} />
                                            {formatDateTime(record.createdAt)}
                                        </MetaItem>
                                    </RecordMetaRow>
                                </RecordMain>

                                <RecordSide>
                                    {/*<ScoreBadge>*/}
                                    {/*    {record.totalScore > 0 ? `${record.totalScore}점` : "미채점"}*/}
                                    {/*</ScoreBadge>*/}
                                    <ActionGroup>
                                        <PdfIconButton
                                            type="button"
                                            onClick={() => handlePdfOpen(record)}
                                            disabled={!record.finished}
                                            aria-label="면접 결과 PDF 확인"
                                            title={
                                                record.finished
                                                    ? "면접 결과 PDF 확인"
                                                    : "완료된 면접만 PDF 확인 가능"
                                            }
                                        >
                                            <FileText size={18} />
                                        </PdfIconButton>
                                        <DetailButton
                                            type="button"
                                            onClick={() => handlePdfOpen(record)}
                                            disabled={!record.finished}
                                        >
                                            상세 보기
                                            <ChevronRight size={16} />
                                        </DetailButton>
                                    </ActionGroup>
                                </RecordSide>
                            </RecordCard>
                        ))}
                    </ListWrap>
                )}
            </PageInner>
        </Page>
    );
}

const Page = styled.div`
  ${pretendard};
  min-height: auto;
  background: transparent;
  padding: 0;
  color: ${palette.text};

  * {
    box-sizing: border-box;
  }

  button,
  input {
    ${interactiveText};
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const PageInner = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  ${interactiveText};
  height: 40px;
  padding: 0 16px;
  border: 1px solid ${palette.border};
  background: transparent;
  color: ${palette.text};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: ${palette.text};
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;
    border-color: rgba(148, 163, 184, 0.3);

    &:hover {
      border-color: #f1f5f9;
    }
  }
`;

const HeroCard = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 40px;
  padding: clamp(28px, 4vw, 44px);
  background: #ffffff;
  border: 1px solid ${palette.border};
  border-radius: ${palette.radiusLg};

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.7);
    border-color: rgba(148, 163, 184, 0.18);
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: ${palette.text};

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const HeroDescription = styled.p`
  margin: 0;
  max-width: 55ch;
  font-size: 14px;
  line-height: 1.7;
  color: ${palette.textSoft};

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.6);
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HeroStatCard = styled.div`
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid ${palette.borderSoft};
  display: flex;
  flex-direction: column;
  gap: 8px;

  :root[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.55);
    border-color: rgba(148, 163, 184, 0.14);
  }
`;

const HeroStatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: ${palette.textSoft};

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.7);
  }
`;

const HeroStatValue = styled.div`
  font-size: clamp(1.8rem, 2.6vw, 2.4rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${palette.primaryStrong};
  font-variant-numeric: tabular-nums;

  :root[data-theme="dark"] & {
    color: #93c5fd;
  }
`;

const FilterCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-radius: ${palette.radiusMd};
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid ${palette.borderSoft};
  box-shadow: ${palette.shadowSoft};

  :root[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.5);
    border-color: rgba(148, 163, 184, 0.14);
  }

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-height: 40px;
  padding: 0 8px 0 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid ${palette.borderSoft};
  color: ${palette.textMuted};
  transition: border-color 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);

  &:focus-within {
    border-color: ${palette.primary};
    box-shadow: 0 0 0 4px ${palette.primaryRing};
    color: ${palette.primaryStrong};
  }

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.55);
    border-color: rgba(148, 163, 184, 0.18);

    &:focus-within {
      border-color: #60a5fa;
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
      color: #93c5fd;
    }
  }
`;

const SearchInput = styled.input`
  ${interactiveText};
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14.5px;
  padding: 10px 0;
  color: ${palette.text};

  &::placeholder {
    color: ${palette.textMuted};
  }

  :root[data-theme="dark"] & {
    color: #f1f5f9;

    &::placeholder {
      color: rgba(226, 232, 240, 0.4);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterChip = styled.button.attrs({ "data-interview-filter-chip": "true" })<{ $active: boolean }>`
    &[data-interview-filter-chip="true"] {
        ${interactiveText};
        height: 36px;
        padding: 0 16px;
        border: 0;
        border-radius: 999px;
        background: ${({ $active }) => ($active ? palette.primaryStrong : "#ffffff")};
        color: ${({ $active }) => ($active ? "#ffffff" : palette.textSoft)};
        font-size: 13px;
        font-weight: 700;
        letter-spacing: -0.01em;
        cursor: pointer;
        transition:
          background 0.28s cubic-bezier(0.16, 1, 0.3, 1),
          color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
          transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    }

    &[data-interview-filter-chip="true"]:hover {
        transform: translateY(-1px);
        color: ${({ $active }) => ($active ? "#ffffff" : palette.primaryStrong)};
    }

    :root[data-theme="dark"] &[data-interview-filter-chip="true"] {
        background: ${({ $active }) => ($active ? palette.primaryStrong : "rgba(30, 41, 59, 0.6)")};
        color: ${({ $active }) => ($active ? "#ffffff" : "rgba(226, 232, 240, 0.72)")};
    }

    :root[data-theme="dark"] &[data-interview-filter-chip="true"]:hover {
        color: ${({ $active }) => ($active ? "#ffffff" : "#93c5fd")};
    }
`;

const StateCard = styled.div`
  min-height: 200px;
  padding: 48px 24px;
  border-radius: ${palette.radiusMd};
  background: rgba(255, 255, 255, 0.6);
  border: 1px dashed ${palette.border};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14.5px;
  color: ${palette.textSoft};

  :root[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.4);
    border-color: rgba(148, 163, 184, 0.24);
    color: rgba(226, 232, 240, 0.6);
  }
`;

const ListWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const RecordCard = styled.article`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  border-radius: ${palette.radiusMd};
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid ${palette.borderSoft};
  box-shadow: ${palette.shadowSoft};
  transition:
    transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.32s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.32s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-2px);
    border-color: ${palette.border};
    box-shadow: ${palette.shadow};
  }

  :root[data-theme="dark"] & {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(148, 163, 184, 0.16);
    box-shadow: 0 10px 28px rgba(2, 6, 23, 0.3);
  }

  :root[data-theme="dark"] &:hover {
    border-color: rgba(148, 163, 184, 0.24);
  }

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RecordMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  flex: 1;
`;

const RecordTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`;

const TypeBadge = styled.div`
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${palette.chipBg};
  display: inline-flex;
  align-items: center;
  color: ${palette.primaryStrong};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: -0.005em;

  :root[data-theme="dark"] & {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
  }
`;

const StatusBadge = styled.div<{ $finished: boolean }>`
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${({ $finished }) => ($finished ? palette.secondarySoft : palette.warningSoft)};
  display: inline-flex;
  align-items: center;
  color: ${({ $finished }) => ($finished ? palette.secondaryHover : palette.warning)};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: -0.005em;

  :root[data-theme="dark"] & {
    background: ${({ $finished }) => ($finished ? "rgba(16, 185, 129, 0.22)" : "rgba(245, 158, 11, 0.2)")};
    color: ${({ $finished }) => ($finished ? "#6ee7b7" : "#fbbf24")};
  }
`;

const RecordTitle = styled.h2`
  margin: 0;
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.025em;
  color: ${palette.text};

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const RecordMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const MetaItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${palette.textSoft};
  font-variant-numeric: tabular-nums;

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.6);
  }
`;

const RecordSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  flex-shrink: 0;

  @media (max-width: 860px) {
    width: 100%;
    align-items: stretch;
  }
`;

const ScoreBadge = styled.div`
  min-width: 72px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${palette.text};
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;

  :root[data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 860px) {
    width: 100%;
  }
`;

const PdfIconButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid ${palette.borderSoft};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  color: ${palette.textSoft};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: ${palette.chipBg};
    color: ${palette.primaryStrong};
    border-color: rgba(59, 130, 246, 0.32);
    transform: translateY(-1px);
  }

  &:disabled {
    color: ${palette.textMuted};
    cursor: not-allowed;
    border-color: ${palette.borderSoft};
    background: transparent;
    transform: none;
  }

  :root[data-theme="dark"] & {
    color: rgba(226, 232, 240, 0.6);
    background: rgba(30, 41, 59, 0.55);
    border-color: rgba(148, 163, 184, 0.18);

    &:hover {
      background: rgba(96, 165, 250, 0.16);
      color: #93c5fd;
      border-color: rgba(96, 165, 250, 0.34);
    }

    &:disabled {
      color: rgba(226, 232, 240, 0.35);
      background: transparent;
      border-color: rgba(148, 163, 184, 0.16);
    }
  }
`;

const DetailButton = styled.button`
  ${interactiveText};
  height: 40px;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  background: ${palette.primaryStrong};
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 860px) {
    flex: 1;
  }
`;
