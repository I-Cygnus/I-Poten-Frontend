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
    pageBlue: "#f8fbff",
    pageMint: "#f8fffd",
    text: "#111827",
    textSoft: "#6b7280",
    textMuted: "#94a3b8",
    border: "#e5e7eb",
    borderSoft: "#eef2f7",
    primary: "#4F76F1",
    primaryStrong: "#3E63E0",
    primarySoft: "rgba(79, 118, 241, 0.10)",
    secondaryStrong: "#10b981",
    secondarySoft: "rgba(43, 198, 166, 0.12)",
    accentGradient: "linear-gradient(90deg, #3E82E8 0%, #2BC6A6 100%)",
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
    return record.pdfUrl || `/vue-ai-interview/ai-interview/result/${record.interviewId}`;
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
                        <HeroBadge>INTERVIEW RECORDS</HeroBadge>
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

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const PageInner = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${palette.border};
  background: #ffffff;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const HeroCard = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
  padding: 28px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(14, 18, 28, 0.06);
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.05);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeroBadge = styled.div`
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: ${palette.primarySoft};
  color: ${palette.primaryStrong};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.04em;
  color: #0f172a;
`;

const HeroDescription = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.75;
  color: ${palette.textSoft};
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const HeroStatCard = styled.div`
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(79, 118, 241, 0.08) 0%, rgba(43, 198, 166, 0.08) 100%);
  border: 1px solid rgba(79, 118, 241, 0.12);
`;

const HeroStatLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${palette.textSoft};
  margin-bottom: 8px;
`;

const HeroStatValue = styled.div`
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: #0f172a;
`;

const FilterCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid ${palette.border};

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-height: 50px;
  padding: 0 16px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  color: ${palette.textMuted};
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: ${palette.text};

  &::placeholder {
    color: ${palette.textMuted};
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterChip = styled.button<{ $active: boolean }>`
    height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid ${({ $active }) => ($active ? "#111111" : "#d1d5db")};
    background: ${({ $active }) => ($active ? "#111111" : "#ffffff")};
    color: ${({ $active }) => ($active ? "#ffffff" : "#111111")};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;

    &:hover {
        background: ${({ $active }) => ($active ? "#111111" : "#f3f4f6")};
    }
`;

const StateCard = styled.div`
  min-height: 220px;
  border-radius: 24px;
  padding: 28px;
  background: #ffffff;
  border: 1px solid ${palette.border};
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 15px;
  color: ${palette.textSoft};
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
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(14, 18, 28, 0.06);
  box-shadow: 0 8px 20px rgba(30, 41, 59, 0.04);

  @media (max-width: 860px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RecordMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RecordTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const TypeBadge = styled.div`
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${palette.primarySoft};
  color: ${palette.primaryStrong};
  font-size: 12px;
  font-weight: 800;
`;

const StatusBadge = styled.div<{ $finished: boolean }>`
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: ${({ $finished }) =>
        $finished ? palette.secondarySoft : "rgba(245, 158, 11, 0.12)"};
  color: ${({ $finished }) => ($finished ? palette.secondaryStrong : "#b45309")};
  font-size: 12px;
  font-weight: 800;
`;

const RecordTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.03em;
  color: #0f172a;
`;

const RecordMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const MetaItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid ${palette.borderSoft};
  font-size: 13px;
  color: #475569;
`;

const RecordSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;

  @media (max-width: 860px) {
    width: 100%;
    align-items: stretch;
  }
`;

const ScoreBadge = styled.div`
  min-width: 84px;
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${palette.primarySoft};
  color: ${palette.primaryStrong};
  font-size: 13px;
  font-weight: 800;
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
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid ${palette.border};
  background: #ffffff;
  color: ${palette.primaryStrong};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    color: ${palette.textMuted};
    cursor: not-allowed;
    background: #f8fafc;
  }
`;

const DetailButton = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: none;
  background: ${palette.accentGradient};
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (max-width: 860px) {
    flex: 1;
  }
`;
