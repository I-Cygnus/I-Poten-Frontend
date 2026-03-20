import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { Schedule, ScheduleUpsertRequest } from "../../api/userScheduleApi.ts";
import { CalendarDays } from "lucide-react";

type Props = {
    onClose: () => void;
    onSubmit: (payload: ScheduleUpsertRequest) => Promise<void>;
    initialData?: Schedule | null;
    isSubmitting?: boolean;
};

type FormState = {
    title: string;
    memo: string;
    allDay: boolean;
    startAt: string;
    endAt: string;
};

type DateRange = {
    start: Date;
    end: Date;
};

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function formatDateInputValue(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDatetimeLocalValue(isoString: string) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 16);
}

function toDateInputValue(isoString: string) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 10);
}

function toIsoString(value: string, allDay: boolean, boundary: "start" | "end") {
    if (!value) return "";

    if (allDay) {
        const time = boundary === "start" ? "T00:00:00" : "T23:59:59";
        return new Date(`${value}${time}`).toISOString();
    }

    return new Date(value).toISOString();
}

function normalizeFormDateValue(value: string, allDay: boolean) {
    if (!value) return "";

    if (allDay) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        return toDateInputValue(value);
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
    return toDatetimeLocalValue(value);
}

function getRoundedNow() {
    const now = new Date();
    const rounded = new Date(now);
    rounded.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
    return rounded;
}

function createInitialForm(initialData?: Schedule | null): FormState {
    const start = getRoundedNow();
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    if (!initialData) {
        return {
            title: "",
            memo: "",
            allDay: false,
            startAt: toDatetimeLocalValue(start.toISOString()),
            endAt: toDatetimeLocalValue(end.toISOString()),
        };
    }

    return {
        title: initialData.title,
        memo: initialData.memo,
        allDay: initialData.allDay,
        startAt: initialData.allDay
            ? toDateInputValue(initialData.startAt)
            : toDatetimeLocalValue(initialData.startAt),
        endAt: initialData.allDay
            ? toDateInputValue(initialData.endAt)
            : toDatetimeLocalValue(initialData.endAt),
    };
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfCalendar(date: Date) {
    const firstDay = startOfMonth(date);
    return new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() - firstDay.getDay()
    );
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(left: Date, right: Date) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

function formatMonthLabel(date: Date) {
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
    }).format(date);
}

function parseFormValue(value: string, allDay: boolean) {
    if (!value) return null;
    const date = new Date(allDay ? `${value}T00:00:00` : value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getCurrentFormRange(form: FormState): DateRange | null {
    const start = parseFormValue(form.startAt, form.allDay);
    const end = parseFormValue(form.endAt, form.allDay);

    if (!start || !end) return null;

    return {
        start: startOfDay(start),
        end: startOfDay(end),
    };
}

function orderRange(left: Date, right: Date): DateRange {
    return left.getTime() <= right.getTime()
        ? { start: startOfDay(left), end: startOfDay(right) }
        : { start: startOfDay(right), end: startOfDay(left) };
}

function buildCalendarWeeks(displayMonth: Date) {
    const calendarStart = startOfCalendar(displayMonth);
    const next = new Date(calendarStart);
    const weeks: Date[][] = [];

    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
        const week: Date[] = [];
        for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
            week.push(new Date(next));
            next.setDate(next.getDate() + 1);
        }
        weeks.push(week);
    }

    return weeks;
}

function applyRangeToForm(prev: FormState, range: DateRange): FormState {
    if (prev.allDay) {
        return {
            ...prev,
            startAt: formatDateInputValue(range.start),
            endAt: formatDateInputValue(range.end),
        };
    }

    const currentStart = parseFormValue(prev.startAt, false) ?? getRoundedNow();
    const currentEnd = parseFormValue(prev.endAt, false) ?? new Date(currentStart.getTime() + 60 * 60 * 1000);

    const nextStart = new Date(range.start);
    nextStart.setHours(
        currentStart.getHours(),
        currentStart.getMinutes(),
        currentStart.getSeconds(),
        currentStart.getMilliseconds()
    );

    const nextEnd = new Date(range.end);
    nextEnd.setHours(
        currentEnd.getHours(),
        currentEnd.getMinutes(),
        currentEnd.getSeconds(),
        currentEnd.getMilliseconds()
    );

    if (nextEnd.getTime() < nextStart.getTime()) {
        nextEnd.setTime(nextStart.getTime());
    }

    return {
        ...prev,
        startAt: toDatetimeLocalValue(nextStart.toISOString()),
        endAt: toDatetimeLocalValue(nextEnd.toISOString()),
    };
}

function formatRangeLabel(range: DateRange | null) {
    if (!range) return "날짜를 선택해 주세요.";

    const formatter = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `${formatter.format(range.start)} - ${formatter.format(range.end)}`;
}

type RangePosition = "none" | "single" | "start" | "middle" | "end";

export default function AddScheduleModal({
                                             onClose,
                                             onSubmit,
                                             initialData,
                                             isSubmitting = false,
                                         }: Props) {
    const [form, setForm] = useState<FormState>(() => createInitialForm(initialData));
    const [displayMonth, setDisplayMonth] = useState<Date>(() => {
        const initialForm = createInitialForm(initialData);
        return parseFormValue(initialForm.startAt, initialForm.allDay) ?? new Date();
    });
    const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
    const [dragRange, setDragRange] = useState<DateRange | null>(null);
    const isEditMode = Boolean(initialData && initialData.id > 0);

    const [rangeAnchorDate, setRangeAnchorDate] = useState<Date | null>(null);
    const didDragRef = useRef(false);

    useEffect(() => {
        const nextForm = createInitialForm(initialData);
        setForm(nextForm);

        const nextMonth = parseFormValue(nextForm.startAt, nextForm.allDay) ?? new Date();
        setDisplayMonth(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
        setDragStartDate(null);
        setDragRange(null);
        setRangeAnchorDate(null);
        didDragRef.current = false;
    }, [initialData]);

    useEffect(() => {
        const handleWindowMouseUp = () => {
            setDragStartDate(null);
            didDragRef.current = false;
        };

        window.addEventListener("mouseup", handleWindowMouseUp);
        return () => window.removeEventListener("mouseup", handleWindowMouseUp);
    }, []);

    const isValidRange = useMemo(() => {
        const start = new Date(toIsoString(form.startAt, form.allDay, "start"));
        const end = new Date(toIsoString(form.endAt, form.allDay, "end"));

        return start.getTime() <= end.getTime();
    }, [form.allDay, form.endAt, form.startAt]);

    const selectedRange = useMemo(() => {
        return dragRange ?? getCurrentFormRange(form);
    }, [dragRange, form]);

    const rangeLabel = useMemo(() => formatRangeLabel(selectedRange), [selectedRange]);

    const weeks = useMemo(() => buildCalendarWeeks(displayMonth), [displayMonth]);
    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(displayMonth);
    const today = new Date();

    const handleChange =
        (key: keyof FormState) =>
            (
                event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
                if (
                    key === "allDay" &&
                    event.target instanceof HTMLInputElement &&
                    event.target.type === "checkbox"
                ) {
                    const nextAllDay = event.target.checked;

                    setForm((prev) => ({
                        ...prev,
                        allDay: nextAllDay,
                        startAt: normalizeFormDateValue(prev.startAt, nextAllDay),
                        endAt: normalizeFormDateValue(prev.endAt, nextAllDay),
                    }));
                    return;
                }

                const value =
                    event.target instanceof HTMLInputElement &&
                    event.target.type === "checkbox"
                        ? event.target.checked
                        : event.target.value;

                setForm((prev) => ({
                    ...prev,
                    [key]: value,
                }));

                if (key === "startAt" || key === "endAt") {
                    const nextDate = parseFormValue(String(value), form.allDay);
                    if (nextDate) {
                        setDisplayMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
                    }
                }
            };

    const commitRange = (range: DateRange) => {
        setForm((prev) => applyRangeToForm(prev, range));
        setDragRange(null);
        setDisplayMonth(new Date(range.start.getFullYear(), range.start.getMonth(), 1));
    };

    const handleDayMouseDown = (date: Date) => {
        const normalized = startOfDay(date);
        didDragRef.current = false;
        setDragStartDate(normalized);
        setDragRange({ start: normalized, end: normalized });
    };

    const handleDayMouseEnter = (date: Date) => {
        const normalized = startOfDay(date);

        if (dragStartDate) {
            didDragRef.current = true;
            setDragRange(orderRange(dragStartDate, normalized));
            return;
        }

        if (rangeAnchorDate) {
            setDragRange(orderRange(rangeAnchorDate, normalized));
        }
    };

    const handleDayMouseUp = (date: Date) => {
        if (!dragStartDate) return;

        const normalized = startOfDay(date);

        if (didDragRef.current) {
            const range = orderRange(dragStartDate, normalized);
            setDragStartDate(null);
            setRangeAnchorDate(null);
            didDragRef.current = false;
            commitRange(range);
            return;
        }

        setDragStartDate(null);
    };

    const handleDayClick = (date: Date) => {
        const normalized = startOfDay(date);

        if (didDragRef.current) {
            didDragRef.current = false;
            return;
        }

        if (!rangeAnchorDate) {
            setRangeAnchorDate(normalized);
            setDragRange({ start: normalized, end: normalized });
            return;
        }

        const range = orderRange(rangeAnchorDate, normalized);
        setRangeAnchorDate(null);
        commitRange(range);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload: ScheduleUpsertRequest = {
            title: form.title.trim(),
            memo: form.memo.trim(),
            allDay: form.allDay,
            startAt: toIsoString(form.startAt, form.allDay, "start"),
            endAt: toIsoString(form.endAt, form.allDay, "end"),
        };

        await onSubmit(payload);
    };

    return (
        <Backdrop onClick={onClose}>
            <Modal onClick={(event) => event.stopPropagation()}>
                <Header>
                    <HeaderLeft>
                        <IconBadge>
                            <CalendarDays size={20} strokeWidth={2.1} />
                        </IconBadge>
                        <HeaderTextWrap>
                            <Title>{isEditMode ? "일정 수정" : "일정 추가"}</Title>
                            <Description>
                                날짜를 드래그해서 범위를 선택하고, 오른쪽에서 세부 내용을 정리해 보세요.
                            </Description>
                        </HeaderTextWrap>
                    </HeaderLeft>

                    <CloseButton type="button" onClick={onClose} aria-label="닫기">
                        ×
                    </CloseButton>
                </Header>

                <Body>
                    <CalendarPanel>
                        <MonthToolbar>
                            <MonthArrowButton
                                type="button"
                                onClick={() =>
                                    setDisplayMonth(
                                        new Date(
                                            displayMonth.getFullYear(),
                                            displayMonth.getMonth() - 1,
                                            1
                                        )
                                    )
                                }
                                aria-label="이전 달"
                            >
                                ‹
                            </MonthArrowButton>

                            <MonthPill>{formatMonthLabel(displayMonth)}</MonthPill>

                            <MonthArrowButton
                                type="button"
                                onClick={() =>
                                    setDisplayMonth(
                                        new Date(
                                            displayMonth.getFullYear(),
                                            displayMonth.getMonth() + 1,
                                            1
                                        )
                                    )
                                }
                                aria-label="다음 달"
                            >
                                ›
                            </MonthArrowButton>
                        </MonthToolbar>

                        <WeekHeader>
                            {WEEK_LABELS.map((label) => (
                                <WeekLabel key={label}>{label}</WeekLabel>
                            ))}
                        </WeekHeader>

                        <CalendarGrid>
                            {weeks.flat().map((date) => {
                                const inCurrentMonth =
                                    date >= monthStart &&
                                    date <= monthEnd &&
                                    date.getMonth() === displayMonth.getMonth();

                                const rangeStart = selectedRange?.start;
                                const rangeEnd = selectedRange?.end;

                                const selected =
                                    rangeStart &&
                                    rangeEnd &&
                                    startOfDay(date).getTime() >= rangeStart.getTime() &&
                                    startOfDay(date).getTime() <= rangeEnd.getTime();

                                let rangePosition: RangePosition = "none";

                                if (selected && rangeStart && rangeEnd) {
                                    const isStart = isSameDay(date, rangeStart);
                                    const isEnd = isSameDay(date, rangeEnd);

                                    if (isStart && isEnd) rangePosition = "single";
                                    else if (isStart) rangePosition = "start";
                                    else if (isEnd) rangePosition = "end";
                                    else rangePosition = "middle";
                                }

                                return (
                                    <DayButton
                                        key={date.toISOString()}
                                        type="button"
                                        $muted={!inCurrentMonth}
                                        $today={isSameDay(date, today)}
                                        $rangePosition={rangePosition}
                                        onMouseDown={() => handleDayMouseDown(date)}
                                        onMouseEnter={() => handleDayMouseEnter(date)}
                                        onMouseUp={() => handleDayMouseUp(date)}
                                        onClick={() => handleDayClick(date)}
                                    >
                                        <DayText
                                            $rangePosition={rangePosition}
                                            $muted={!inCurrentMonth}
                                        >
                                            {date.getDate()}
                                        </DayText>
                                    </DayButton>
                                );
                            })}
                        </CalendarGrid>

                        <CalendarCaption>
                            범위를 선택하면 {form.allDay ? "날짜" : "시작과 종료 일시"}가 자동으로 반영됩니다.
                        </CalendarCaption>
                    </CalendarPanel>

                    <Form onSubmit={handleSubmit}>
                        <FieldSection>
                            <FieldGroup>
                                <Label htmlFor="schedule-title">일정 제목</Label>
                                <TextInput
                                    id="schedule-title"
                                    value={form.title}
                                    onChange={handleChange("title")}
                                    placeholder="예: 기술 면접 준비"
                                    maxLength={100}
                                    required
                                />
                            </FieldGroup>

                            <FieldGroup>
                                <Label htmlFor="schedule-memo">메모</Label>
                                <TextArea
                                    id="schedule-memo"
                                    value={form.memo}
                                    onChange={handleChange("memo")}
                                    placeholder="예: 자료구조 복습, 예상 질문 정리"
                                    rows={5}
                                />
                            </FieldGroup>
                        </FieldSection>

                        <FieldSection>
                            <InlineOptionRow>
                                <CheckLabel>
                                    <CheckInput
                                        type="checkbox"
                                        checked={form.allDay}
                                        onChange={handleChange("allDay")}
                                    />
                                    <CheckText>종일 일정</CheckText>
                                </CheckLabel>
                            </InlineOptionRow>

                            <DateGrid>
                                <FieldGroup>
                                    <Label htmlFor="schedule-start">
                                        {form.allDay ? "시작 날짜" : "시작 일시"}
                                    </Label>
                                    <TextInput
                                        id="schedule-start"
                                        type={form.allDay ? "date" : "datetime-local"}
                                        value={form.startAt}
                                        onChange={handleChange("startAt")}
                                        required
                                    />
                                </FieldGroup>

                                <FieldGroup>
                                    <Label htmlFor="schedule-end">
                                        {form.allDay ? "종료 날짜" : "종료 일시"}
                                    </Label>
                                    <TextInput
                                        id="schedule-end"
                                        type={form.allDay ? "date" : "datetime-local"}
                                        value={form.endAt}
                                        onChange={handleChange("endAt")}
                                        required
                                    />
                                </FieldGroup>
                            </DateGrid>

                            {!isValidRange && (
                                <ErrorText>종료 일시는 시작 일시보다 빠를 수 없습니다.</ErrorText>
                            )}
                        </FieldSection>

                        <RightPanelSpacer />
                    </Form>
                </Body>

                <Footer>
                    <RangeSummary>
                        <RangeSummaryLabel>선택 범위</RangeSummaryLabel>
                        <RangeSummaryValue>{rangeLabel}</RangeSummaryValue>
                    </RangeSummary>

                    <FooterActions>
                        <SecondaryButton type="button" onClick={onClose}>
                            취소
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            form="schedule-form-hidden"
                            as="button"
                            onClick={() => undefined}
                            disabled={
                                isSubmitting ||
                                !form.title.trim() ||
                                !form.startAt ||
                                !form.endAt ||
                                !isValidRange
                            }
                        >
                            {isSubmitting
                                ? "저장 중..."
                                : isEditMode
                                    ? "수정하기"
                                    : "등록하기"}
                        </PrimaryButton>
                    </FooterActions>
                </Footer>

                <HiddenSubmitForm id="schedule-form-hidden" onSubmit={handleSubmit} />
            </Modal>
        </Backdrop>
    );
}

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1400;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 23, 42, 0.32);
    backdrop-filter: blur(8px);
`;

const Modal = styled.div`
    width: min(100%, 940px);
    max-height: min(90vh, 860px);
    overflow: hidden;
    border-radius: 28px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow:
        0 32px 80px rgba(15, 23, 42, 0.14),
        0 8px 24px rgba(15, 23, 42, 0.08);
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 22px 24px 18px;
    border-bottom: 1px solid #eef2f7;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 14px;
`;

const IconBadge = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #4f6ef7;
    background: linear-gradient(180deg, #f7f9ff 0%, #eef3ff 100%);
    border: 1px solid #dfe7ff;
    box-shadow:
            0 8px 20px rgba(79, 110, 247, 0.10),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);

    svg {
        display: block;
    }
`;

const HeaderTextWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #111827;
`;

const Description = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #6b7280;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: #6b7280;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;

    &:hover {
        background: #f3f4f6;
        color: #111827;
    }
`;

const Body = styled.div`
    display: grid;
    grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
    min-height: 470px;

    @media (max-width: 920px) {
        grid-template-columns: 1fr;
    }
`;

const CalendarPanel = styled.section`
    padding: 22px 20px 20px 24px;
    border-right: 1px solid #eef2f7;
    background: #ffffff;

    @media (max-width: 920px) {
        border-right: none;
        border-bottom: 1px solid #eef2f7;
    }
`;

const MonthToolbar = styled.div`
    display: grid;
    grid-template-columns: 40px 1fr 40px;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
`;

const MonthArrowButton = styled.button`
    width: 40px;
    height: 40px;
    border: 1px solid #eceff3;
    border-radius: 999px;
    background: #ffffff;
    color: #4b5563;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
    transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: #dbe2ea;
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
    }
`;

const MonthPill = styled.div`
    height: 42px;
    border-radius: 999px;
    background: #f6f7fb;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 18px;
    font-size: 18px;
    font-weight: 700;
    color: #374151;
`;

const WeekHeader = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    margin-bottom: 6px;
`;

const WeekLabel = styled.div`
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
`;

const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
`;

const DayButton = styled.button<{
    $muted: boolean;
    $today: boolean;
    $rangePosition: RangePosition;
}>`
    position: relative;
    height: 44px;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    border-radius: 14px;

    &::before {
        content: "";
        position: absolute;
        inset: 4px 0;
        background: ${({ $rangePosition, $today }) => {
    if ($rangePosition === "single") return "#3b5bfd";
    if ($rangePosition === "start") return "#dfe8ff";
    if ($rangePosition === "middle") return "#edf3ff";
    if ($rangePosition === "end") return "#dfe8ff";
    if ($today) return "#f3f6fb";
    return "transparent";
}};
        border-radius: ${({ $rangePosition }) => {
    if ($rangePosition === "single") return "999px";
    if ($rangePosition === "start") return "999px 0 0 999px";
    if ($rangePosition === "middle") return "0";
    if ($rangePosition === "end") return "0 999px 999px 0";
    return "14px";
}};
        transition: all 0.18s ease;
    }

    &:hover::before {
        box-shadow: ${({ $rangePosition }) =>
    $rangePosition === "none"
        ? "inset 0 0 0 1px #dbe2ea"
        : "inset 0 0 0 1px rgba(59, 91, 253, 0.12)"};
    }
`;

const DayText = styled.span<{
    $rangePosition: RangePosition;
    $muted: boolean;
}>`
    position: relative;
    z-index: 1;
    width: 36px;
    height: 36px;
    margin: 4px auto 0;
    display: grid;
    place-items: center;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    color: ${({ $rangePosition, $muted }) => {
    if ($rangePosition === "single") return "#ffffff";
    if ($muted) return "#c0c6d1";
    return "#374151";
}};
    background: ${({ $rangePosition }) => {
    if ($rangePosition === "start" || $rangePosition === "end") return "#3b5bfd";
    return "transparent";
}};

    ${({ $rangePosition }) =>
    ($rangePosition === "start" || $rangePosition === "end") &&
    `
        color: #ffffff;
        box-shadow: 0 10px 22px rgba(59, 91, 253, 0.22);
    `}
`;

const CalendarCaption = styled.div`
    margin-top: 16px;
    font-size: 13px;
    line-height: 1.6;
    color: #8a94a6;
`;

const Form = styled.form.attrs({ id: "schedule-form" })`
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px 24px 20px;
    background: #ffffff;
`;

const FieldSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 700;
    color: #374151;
`;

const TextInput = styled.input`
    width: 100%;
    height: 50px;
    border: 1px solid #e6eaf0;
    border-radius: 14px;
    background: #fbfcfe;
    padding: 0 16px;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

    &:focus {
        border-color: #4f6ef7;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.11);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 128px;
    border: 1px solid #e6eaf0;
    border-radius: 14px;
    background: #fbfcfe;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.65;
    color: #111827;
    resize: vertical;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

    &:focus {
        border-color: #4f6ef7;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(79, 110, 247, 0.11);
    }
`;

const InlineOptionRow = styled.div`
    display: flex;
    align-items: center;
`;

const CheckLabel = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
`;

const CheckInput = styled.input`
    width: 16px;
    height: 16px;
    accent-color: #4f6ef7;
`;

const CheckText = styled.span`
    font-size: 14px;
    font-weight: 700;
    color: #374151;
`;

const DateGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const ErrorText = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #dc2626;
`;

const RightPanelSpacer = styled.div`
    flex: 1;
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 16px 24px;
    border-top: 1px solid #eef2f7;
    background: #ffffff;

    @media (max-width: 720px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const RangeSummary = styled.div`
    min-width: 0;
`;

const RangeSummaryLabel = styled.div`
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
    margin-bottom: 4px;
`;

const RangeSummaryValue = styled.div`
    font-size: 15px;
    font-weight: 700;
    color: #374151;
    word-break: keep-all;
`;

const FooterActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    @media (max-width: 720px) {
        width: 100%;
        flex-direction: column-reverse;
    }
`;

const SecondaryButton = styled.button`
    min-width: 100px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #4b5563;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;

    &:hover {
        background: #f9fafb;
        border-color: #d1d5db;
    }
`;

const PrimaryButton = styled.button`
    min-width: 136px;
    height: 42px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #4f6ef7 0%, #3b5bfd 100%);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(79, 110, 247, 0.22);
    transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 16px 28px rgba(79, 110, 247, 0.28);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const HiddenSubmitForm = styled.form`
    display: none;
`;