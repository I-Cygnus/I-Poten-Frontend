import styled, { keyframes } from "styled-components";
import { useEffect, useMemo, useState } from "react";
// API imports removed - using mock data
type UserStudySchedule = {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    studyRoomId: number;
    studyRoomTitle: string;
};

type UserScheduleResponse = {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    allDay: boolean;
    color?: string;
};

type UserScheduleRequest = {
    title: string;
    description?: string;
    startTime: string | null;
    endTime: string | null;
    location?: string;
    allDay: boolean;
    color?: string;
};
import Calendar from "../components/schedule/Calendar.tsx";
import ScheduleDetailPanel from "../components/schedule/ScheduleDetailPanel.tsx";
import AddScheduleModal from "../components/modals/AddScheduleModal.tsx";
import { notifyError, notifySuccess } from "../utils/toast";
import { motion } from "framer-motion";

type UnifiedSchedule = (UserScheduleResponse | UserStudySchedule) & {
    type: "personal" | "study";
};

export default function SchedulePage() {
    const [allSchedules, setAllSchedules] = useState<UnifiedSchedule[]>([]);
    const [viewMode, setViewMode] = useState<"all" | "personal" | "study">("all");
    const [selected, setSelected] = useState<UnifiedSchedule | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // 추가: 월간/주간/일간 뷰 상태 관리
    const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());

    // 일정 불러오기 (Mock)
    async function loadSchedules(showToast = false) {
        setLoading(true);
        // Mock data for UI display
        const mockPersonal: UserScheduleResponse[] = [
            {
                id: 1,
                title: "개인 학습",
                description: "React 학습",
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                location: "집",
                allDay: false,
                color: "#3b82f6"
            }
        ];
        
        const mockStudy: UserStudySchedule[] = [
            {
                id: 2,
                title: "스터디 모임",
                description: "주간 회고",
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
                studyRoomId: 100,
                studyRoomTitle: "React 스터디"
            }
        ];

        const merged: UnifiedSchedule[] = [
            ...mockPersonal.map((p) => ({ ...p, type: "personal" as const })),
            ...mockStudy.map((s) => ({ ...s, type: "study" as const })),
        ];

        setAllSchedules(merged);
        setLoading(false);
    }

    useEffect(() => {
        loadSchedules();
    }, []);

    // 일정 등록 (Mock)
    async function handleCreateSchedule(formData: UserScheduleRequest) {
        // API call removed - mock behavior
        notifySuccess("일정이 추가되었습니다 ✅");
        await loadSchedules();
        setTimeout(() => setIsAddModalOpen(false), 200);
    }

    // 보기 모드 필터링
    const filteredSchedules = useMemo(() => {
        if (viewMode === "all") return allSchedules;
        return allSchedules.filter((s) => s.type === viewMode);
    }, [allSchedules, viewMode]);

    return (
        <Section>
            {/* 상단 헤더 영역 */}
            <HeaderArea>
                <Title>내 일정</Title>
                <RightArea>
                    {/* 개인 일정일 때만 일정 추가 버튼 */}
                    {viewMode === "personal" && (
                        <AddButton onClick={() => setIsAddModalOpen(true)}>
                            + 일정 추가
                        </AddButton>
                    )}

                    {/* 보기 모드 토글 */}
                    <SegmentedToggle>
                        {["all", "personal", "study"].map((mode, i) => (
                            <SegmentButton
                                key={mode}
                                isActive={viewMode === mode}
                                onClick={() => setViewMode(mode as any)}
                            >
                                {mode === "all"
                                    ? "전체"
                                    : mode === "personal"
                                        ? "개인 일정"
                                        : "스터디 일정"}
                                {viewMode === mode && (
                                    <ActiveBg
                                        layoutId="active-bg"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </SegmentButton>
                        ))}
                    </SegmentedToggle>
                </RightArea>
            </HeaderArea>

            {/* 달력 */}
            {/* view, date 상태를 제어하도록 변경 */}
            <Calendar
                key={allSchedules.length} // 일정 개수 변화 시 강제 리렌더
                schedules={filteredSchedules}
                view={calendarView}
                date={calendarDate}
                onViewChange={setCalendarView}
                onDateChange={setCalendarDate}
                onEventClick={(event) => setSelected(event)}
            />


            {/* 달력 아래 추가 */}
            <MonthlySummary>
                    <h4>{calendarDate.getFullYear()}년 {calendarDate.getMonth() + 1}월 일정 목록</h4>

                {filteredSchedules.length === 0 ? (
                    <EmptyText>이번 달에는 등록된 일정이 없습니다.</EmptyText>
                ) : (
                    <EventTable>
                        <thead>
                        <tr>
                            <th>날짜</th>
                            <th>제목</th>
                            <th>구분</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredSchedules.map((event) => (
                            <tr key={event.id}>
                                <td>{new Date(event.startTime).toLocaleDateString("ko-KR")}</td>
                                <td>{event.title}</td>
                                <td>
                                    <Tag type={event.type}>
                                        {event.type === "study" ? "스터디" : "개인"}
                                    </Tag>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </EventTable>
                )}
            </MonthlySummary>

            {/* 일정 상세 패널 */}
            <ScheduleDetailPanel
                schedule={selected}
                onClose={() => setSelected(null)}
                onRefresh={loadSchedules}
            />

            {/* 일정 추가 모달 */}
            {isAddModalOpen && (
                <AddScheduleModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleCreateSchedule}
                />
            )}
        </Section>
    );
}

/* ================== styled-components ================== */
const fadeUp = keyframes`
  from {
    opacity: 0;
    margin-top: 16px;
  }
  to {
    opacity: 1;
    margin-top: 0;
  }
`;

const Section = styled.section`
    animation: ${fadeUp} 0.6s ease both;
    position: relative;
    padding: 24px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
`;

const HeaderArea = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: #111827;
`;

const RightArea = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const SegmentedToggle = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 9999px;
  padding: 4px;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const SegmentButton = styled.button<{ isActive: boolean }>`
  position: relative;
  border: none;
  background: none;
  padding: 8px 18px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${({ isActive }) => (isActive ? "#fff" : "#374151")};
  z-index: 1;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ isActive }) => (isActive ? "#fff" : "#111827")};
  }
`;

const ActiveBg = styled(motion.div)`
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    z-index: -1;
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 45%, #34d399 100%);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
`;

const AddButton = styled.button`
    background: #3b82f6; /* 메인 블루 (#2563eb보다 부드러운 느낌) */
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: 0.25s ease;
    box-shadow: 0 2px 5px rgba(59,130,246,0.25);

    &:hover {
        background: #2563eb; /* hover 시 진한 블루 */
        transform: translateY(-1px);
    }
`;

const MonthlySummary = styled.div`
  margin-top: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  padding: 24px 28px;

  h4 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1e293b;
  }
`;

const EventTable = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;

    th,
    td {
        padding: 10px 12px;
        font-size: 14px;
        text-align: center;
    }

    th {
        background: #E9F7F5;
        color: #0F172A;
        font-weight: 600;
        letter-spacing: -0.2px;
    }

    td {
        color: #334155;
        border-bottom: 1px solid #f1f5f9;
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    tbody tr:hover td {
        background: #F8FBF8;
        transition: all 0.25s ease;
    }
`;

const Tag = styled.span<{ type: "study" | "personal" }>`
    display: inline-block;
    font-size: 12.5px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 100px;
    letter-spacing: -0.3px;
    border: 1px solid
    ${({ type }) =>
            type === "study" ? "rgba(76, 196, 168, 0.4)" : "rgba(41, 152, 197, 0.4)"};
    background: ${({ type }) =>
            type === "study"
                    ? "rgba(76, 196, 168, 0.08)"
                    : "rgba(41, 152, 197, 0.08)"};
    color: ${({ type }) =>
            type === "study"
                    ? "#13B38D"
                    : "#2998C5"};
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
  padding: 20px 0;
`;
