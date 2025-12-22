import styled from "styled-components";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect } from "react";
import { notifyInfo } from "../../utils/toast";

const locales = { ko };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

type Props = {
    schedules: any[];
    onEventClick?: (event: any) => void;
    view: "month" | "week" | "day";
    date: Date;
    onViewChange: (v: "month" | "week" | "day") => void;
    onDateChange: (d: Date) => void;
};

// 기능 그대로: Custom Toolbar
const CustomToolbar = ({ label, onNavigate, onView, view }: any) => {
    const goToBack = () => onNavigate("PREV");
    const goToNext = () => onNavigate("NEXT");
    const goToToday = () => onNavigate("TODAY");

    // label이 "10월 2025" → "2025년 10월" 변환
    const formattedLabel = (() => {
        if (view === "day") {
            // "월요일 10월 20" 같은 기본 label 대신 직접 날짜 포맷팅
            const today = new Date(label); // label이 날짜 객체로 안 넘어올 수도 있으니 안전하게 처리
            try {
                return format(today, "yyyy년 M월 d일 (EEE)", { locale: ko });
            } catch {
                // 혹시 label이 문자열일 경우 강제 파싱
                return format(new Date(), "yyyy년 M월 d일 (EEE)", { locale: ko });
            }
        }

        // 기존 월간/주간용 포맷 유지
        const match = label.match(/(\d{1,2})월\s?(\d{4})/);
        if (match) {
            const [_, month, year] = match;
            return `${year}년 ${month}월`;
        }

        return label;
    })();

    return (
        <ToolbarWrapper>
            <div className="nav-buttons">
                <button onClick={goToBack}>‹ 이전</button>
                <button onClick={goToToday}>오늘</button>
                <button onClick={goToNext}>다음 ›</button>
            </div>

            <div className="label">{formattedLabel}</div>

            {view !== "month" && (
                <BackToMonthBtn onClick={() => onView("month")}>
                    뒤로 가기
                </BackToMonthBtn>
            )}
        </ToolbarWrapper>
    );
};

// 기능 그대로: Calendar 본체
export default function Calendar({ schedules, onEventClick }: Props) {
    const events = schedules.map((s) => ({
        id: s.id,
        title:
            s.type === "study"
                ? `${s.studyRoomTitle || ""} - ${s.title}`
                : s.title,
        start: new Date(s.startTime),
        end: new Date(s.endTime),
        allDay: s.allDay,
        description: s.description || "",
        location: s.location || "",
        color:
            s.type === "study"
                ? "rgba(52,211,153,0.9)"
                : s.color
                    ? s.color
                    : "rgba(0,122,255,0.9)",
        type: s.type,
        studyRoomId: s.studyRoomId,
    }));

    const CustomEvent = ({ event }: any) => (
        <div style={{ whiteSpace: "normal", fontSize: 13 }}>{event.title}</div>
    );

    return (
        <CalendarWrapper>
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={(event) => {
                    if (onEventClick) onEventClick(event);
                    else notifyInfo("일정 정보를 불러오는 중입니다...");
                }}
                culture="ko"
                style={{ height: "100%" }}
                components={{ event: CustomEvent, toolbar: CustomToolbar }}
                views={["month", "week", "day"]}
                defaultView="month"
                eventPropGetter={(event) => ({
                    style: {
                        background: event.color,
                        borderRadius: "8px",
                        border: "none",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "13px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // subtle
                    },
                })}
                messages={{
                    next: "다음",
                    previous: "이전",
                    today: "오늘",
                    month: "월",
                    week: "주",
                    day: "일",
                }}
            />
        </CalendarWrapper>
    );
}

/* ================== styled-components ================== */
const CalendarWrapper = styled.div`
    width: 100%;
    max-width: none;
    margin: 0;
    height: calc(100vh - 250px);
    background: #fff;
    border-radius: 12px;
    box-shadow: none;
    border: none;
    overflow: hidden;
    padding: 0;
    font-family: "SF Pro Text", "Noto Sans KR", sans-serif;
    transition: all 0.2s ease;

    /* 캘린더 외곽 테두리 제거 */
    .rbc-month-view {
        border: none !important;
    }

    /* 요일(일~토) 사이 세로 구분선 제거 */
    .rbc-header {
        border-left: none !important;
        border-right: none !important;
    }

    .rbc-calendar {
        border: none !important;
        background: transparent !important;
    }

    .rbc-toolbar {
        margin-bottom: 0.5rem !important;
    }

    .rbc-month-view {
        padding: 0.4rem;
    }

    .rbc-date-cell {
        padding: 7px 5px;
        font-size: 13px;
        font-weight: 400;
        color: #444;
    }

    .rbc-today {
        background: #f0f7ff !important;
        border-radius: 6px;
    }

    /* 주말 텍스트 (요일 헤더 + 날짜 숫자 둘 다) */
    && {
        /* === 일요일 === */
        .rbc-month-view .rbc-header:first-child,
        .rbc-month-row .rbc-row > .rbc-date-cell:first-child .rbc-button-link {
            color: #ff3b30 !important;
            font-weight: 400 !important;
        }

        /* === 토요일 === */
        .rbc-month-view .rbc-header:last-child,
        .rbc-month-row .rbc-row > .rbc-date-cell:last-child .rbc-button-link {
            color: #007aff !important;
            font-weight: 400 !important;
        }

        /* === 기본 요일 === */
        .rbc-header {
            color: #1c1c1e !important;
            font-weight: 400;
        }
    }

    /* 오늘 날짜 강조 + 주말 분기 + hover 인터랙션 */
    && {
        /* 오늘 날짜 셀 기본 설정 */
        .rbc-month-view .rbc-date-cell.rbc-now {
            background: none !important; /* 배경 제거 */
            position: relative;
            z-index: 2;
        }

        /* 오늘 날짜 버튼 공통 스타일 */
        .rbc-month-view .rbc-date-cell.rbc-now button.rbc-button-link {
            background-color: #007aff !important;
            color: #ffffff !important;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 13.5px;
            font-weight: 600;
            line-height: 1;
            border: none !important;
            box-shadow: 0 1px 4px rgba(0, 122, 255, 0.25);
            transition: all 0.25s ease;
            transform: scale(1);
        }

        /* hover 시 밝은 파랑 + 확대 */
        .rbc-month-view .rbc-date-cell.rbc-now button.rbc-button-link:hover {
            background-color: #0a84ff !important;
            box-shadow: 0 2px 8px rgba(0, 122, 255, 0.35);
            transform: scale(1.08);
        }

        /* 클릭 시 줄어듦 */
        .rbc-month-view .rbc-date-cell.rbc-now button.rbc-button-link:active {
            transform: scale(0.96);
            box-shadow: 0 1px 3px rgba(0, 122, 255, 0.2);
        }

        /* 오늘이 토요일일 때 (덮어쓰기) */
        .rbc-month-view .rbc-date-cell.rbc-now:last-child button.rbc-button-link {
            background-color: #007aff !important; /* Blue 유지 */
            color: #ffffff !important;
        }

        /* 오늘이 일요일일 때 (덮어쓰기) */
        .rbc-month-view .rbc-date-cell.rbc-now:first-child button.rbc-button-link {
            background-color: #ff3b30 !important; /* Apple Red */
            color: #ffffff !important;
            box-shadow: 0 1px 4px rgba(255, 59, 48, 0.25);
        }

        /* hover 시 (일요일용 밝은 레드) */
        .rbc-month-view .rbc-date-cell.rbc-now:first-child button.rbc-button-link:hover {
            background-color: #ff453a !important;
            box-shadow: 0 2px 8px rgba(255, 59, 48, 0.35);
        }
    }

    @media (max-width: 1200px) {
        height: 620px;
        max-width: 95%;
    }

    @media (max-width: 768px) {
        height: auto;
        padding: 1rem;
    }

    /* ==================== Day / Week View 스타일 ==================== */
    .rbc-time-view {
        border: none !important;
        background: #ffffff !important;
        border-radius: 10px;
    }

    .rbc-time-header-gutter {
        background: transparent !important;
        border: none !important;
        color: #6b7280 !important;
        font-size: 12.5px !important;
        font-weight: 400;
    }

    .rbc-time-header {
        background: rgba(255, 255, 255, 0.7) !important;
        backdrop-filter: blur(8px);
        border: none !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        font-weight: 500;
        color: #111;
    }

    .rbc-time-content > * + * > * {
        border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
    }

    .rbc-time-content > * {
        border-left: none !important;
    }

    .rbc-timeslot-group {
        min-height: 52px;
        background: #fcfcfd;
    }

    .rbc-current-time-indicator {
        background: #ff3b30 !important;
        height: 2px;
        box-shadow: 0 0 4px rgba(255, 59, 48, 0.3);
    }

    .rbc-event {
        border: none;
        border-radius: 10px;
        background: linear-gradient(145deg, #34c759, #30d158);
        color: white;
        font-weight: 600;
        font-size: 13px;
        padding: 6px 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.15s ease;
    }
    .rbc-event:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .rbc-time-content::-webkit-scrollbar {
        display: none;
    }

    .rbc-today {
        background: #f8fbff !important;
    }
`;

const ToolbarWrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px 6px; /* 상하 패딩 줄임 (10px → 4px) */
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px; /* 조금 더 compact하게 */
    margin-bottom: 0.5rem; /* 툴바-캘린더 간격 축소 */

    .nav-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .nav-buttons button {
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 6px; /* 작게 조정 */
        padding: 3px 8px; /* 버튼 세로 높이 감소 */
        font-size: 12.5px;
        color: #111;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .nav-buttons button:hover {
        background: rgba(0, 122, 255, 0.1);
        color: #007aff;
        border-color: rgba(0, 122, 255, 0.2);
    }

    .label {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        font-weight: 500;
        color: #111;
        font-size: 14.5px;
    }
`;

const BackToMonthBtn = styled.button`
    background: rgba(0, 122, 255, 0.1);
    color: #007aff;
    border: 1px solid rgba(0, 122, 255, 0.25);
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 122, 255, 0.15);
        border-color: rgba(0, 122, 255, 0.4);
    }
`;
