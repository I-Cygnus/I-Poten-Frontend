import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { Schedule, ScheduleUpsertRequest } from "../../api/ScheduleApi.ts";
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
    background: rgba(15, 23, 42, 0.5);
`;

const Modal = styled.div`
    width: min(100%, 940px);
    max-height: min(90vh, 860px);
    overflow: hidden;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 24px;
    box-shadow: 0 32px 80px rgba(15, 23, 42, 0.18);

    :root[data-theme="dark"] & {
        background: #0f172a;
        border-color: rgba(148, 163, 184, 0.22);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 26px 28px;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 14px;
`;

const IconBadge = styled.div`
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;

    svg {
        display: block;
    }

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.16);
        color: #93c5fd;
    }
`;

const HeaderTextWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const Title = styled.h2`
    margin: 0;
    font-size: clamp(20px, 2.2vw, 24px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #0f172a;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const Description = styled.p`
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(15, 23, 42, 0.6);

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.6);
    }
`;

const CloseButton = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: none;
    background: rgba(148, 163, 184, 0.1);
    color: rgba(15, 23, 42, 0.6);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
    }

    :root[data-theme="dark"] & {
        background: rgba(148, 163, 184, 0.16);
        color: rgba(226, 232, 240, 0.65);

        &:hover {
            background: rgba(248, 113, 113, 0.16);
            color: #f87171;
        }
    }
`;

const Body = styled.div`
    display: grid;
    grid-template-columns: minmax(320px, 390px) minmax(0, 1fr);
    min-height: 470px;
    padding: 0 20px;
    gap: 18px;

    @media (max-width: 920px) {
        grid-template-columns: 1fr;
    }
`;

const CalendarPanel = styled.section`
    padding: 20px;
    border-radius: 18px;
    background: rgba(248, 250, 252, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.14);

    :root[data-theme="dark"] & {
        background: rgba(15, 23, 42, 0.45);
        border-color: rgba(148, 163, 184, 0.16);
    }
`;

const MonthToolbar = styled.div`
    display: grid;
    grid-template-columns: 36px 1fr 36px;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
`;

const MonthArrowButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(255, 255, 255, 0.7);
    color: #0f172a;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(59, 130, 246, 0.08);
        border-color: rgba(59, 130, 246, 0.2);
        color: #2563eb;
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.5);
        color: #f1f5f9;

        &:hover {
            background: rgba(96, 165, 250, 0.14);
            border-color: rgba(96, 165, 250, 0.3);
            color: #93c5fd;
        }
    }
`;

const MonthPill = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 18px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    color: #0f172a;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
`;

const WeekHeader = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0;
    margin-bottom: 4px;
`;

const WeekLabel = styled.div`
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.55);

    &:first-child {
        color: rgba(220, 38, 38, 0.6);
    }

    &:last-child {
        color: rgba(37, 99, 235, 0.6);
    }

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.55);

        &:first-child {
            color: rgba(248, 113, 113, 0.7);
        }

        &:last-child {
            color: rgba(147, 197, 253, 0.75);
        }
    }
`;

const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0;
`;

const DayButton = styled.button<{
    $muted: boolean;
    $today: boolean;
    $rangePosition: RangePosition;
}>`
    position: relative;
    height: 42px;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;

    &::before {
        content: "";
        position: absolute;
        inset: 3px 0;
        border-radius: ${({ $rangePosition }) => {
            if ($rangePosition === "single") return "10px";
            if ($rangePosition === "start") return "10px 0 0 10px";
            if ($rangePosition === "end") return "0 10px 10px 0";
            return "0";
        }};
        background: ${({ $rangePosition, $today }) => {
            if ($rangePosition === "single") return "#2563eb";
            if ($rangePosition === "start" || $rangePosition === "end")
                return "rgba(59, 130, 246, 0.18)";
            if ($rangePosition === "middle") return "rgba(59, 130, 246, 0.1)";
            if ($today) return "rgba(59, 130, 246, 0.08)";
            return "transparent";
        }};
        transition: background 0.2s ease;
    }

    &:hover::before {
        background: ${({ $rangePosition }) => {
            if ($rangePosition === "single") return "#1d4ed8";
            if ($rangePosition !== "none") return "rgba(59, 130, 246, 0.22)";
            return "rgba(59, 130, 246, 0.08)";
        }};
    }

    :root[data-theme="dark"] & {
        &::before {
            background: ${({ $rangePosition, $today }) => {
                if ($rangePosition === "single") return "#60a5fa";
                if ($rangePosition === "start" || $rangePosition === "end")
                    return "rgba(96, 165, 250, 0.22)";
                if ($rangePosition === "middle") return "rgba(96, 165, 250, 0.14)";
                if ($today) return "rgba(96, 165, 250, 0.1)";
                return "transparent";
            }};
        }

        &:hover::before {
            background: ${({ $rangePosition }) => {
                if ($rangePosition === "single") return "#3b82f6";
                if ($rangePosition !== "none") return "rgba(96, 165, 250, 0.26)";
                return "rgba(96, 165, 250, 0.12)";
            }};
        }
    }
`;

const DayText = styled.span<{
    $rangePosition: RangePosition;
    $muted: boolean;
}>`
    position: relative;
    z-index: 1;
    width: 100%;
    height: 36px;
    margin: 3px auto 0;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: ${({ $rangePosition, $muted }) => {
        if ($rangePosition === "single") return "#ffffff";
        if ($rangePosition === "start" || $rangePosition === "end") return "#2563eb";
        if ($rangePosition === "middle") return "#2563eb";
        if ($muted) return "rgba(15, 23, 42, 0.3)";
        return "#0f172a";
    }};

    :root[data-theme="dark"] & {
        color: ${({ $rangePosition, $muted }) => {
            if ($rangePosition === "single") return "#0f172a";
            if ($rangePosition === "start" || $rangePosition === "end") return "#93c5fd";
            if ($rangePosition === "middle") return "#93c5fd";
            if ($muted) return "rgba(226, 232, 240, 0.3)";
            return "#f1f5f9";
        }};
    }
`;

const CalendarCaption = styled.div`
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.06);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;
    color: rgba(15, 23, 42, 0.6);

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.1);
        color: rgba(226, 232, 240, 0.6);
    }
`;

const Form = styled.form.attrs({ id: "schedule-form" })`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px 28px 24px 8px;
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
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: rgba(15, 23, 42, 0.75);

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.75);
    }
`;

const TextInput = styled.input`
    width: 100%;
    height: 44px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.7);
    padding: 0 14px;
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
    outline: none;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &::placeholder {
        color: rgba(15, 23, 42, 0.35);
        font-weight: 400;
    }

    &:hover {
        border-color: rgba(148, 163, 184, 0.35);
    }

    &:focus {
        border-color: rgba(59, 130, 246, 0.55);
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.45);
        color: #f1f5f9;

        &::placeholder {
            color: rgba(226, 232, 240, 0.35);
        }

        &:hover {
            border-color: rgba(148, 163, 184, 0.28);
        }

        &:focus {
            border-color: rgba(96, 165, 250, 0.55);
            background: rgba(15, 23, 42, 0.7);
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);
        }
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 120px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.7);
    padding: 14px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.65;
    color: #0f172a;
    resize: vertical;
    outline: none;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &::placeholder {
        color: rgba(15, 23, 42, 0.35);
        font-weight: 400;
    }

    &:hover {
        border-color: rgba(148, 163, 184, 0.35);
    }

    &:focus {
        border-color: rgba(59, 130, 246, 0.55);
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.45);
        color: #f1f5f9;

        &::placeholder {
            color: rgba(226, 232, 240, 0.35);
        }

        &:hover {
            border-color: rgba(148, 163, 184, 0.28);
        }

        &:focus {
            border-color: rgba(96, 165, 250, 0.55);
            background: rgba(15, 23, 42, 0.7);
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);
        }
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
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.08);
    cursor: pointer;
    transition: background 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(59, 130, 246, 0.12);
    }

    :root[data-theme="dark"] & {
        background: rgba(96, 165, 250, 0.14);

        &:hover {
            background: rgba(96, 165, 250, 0.18);
        }
    }
`;

const CheckInput = styled.input`
    width: 15px;
    height: 15px;
    accent-color: #2563eb;

    :root[data-theme="dark"] & {
        accent-color: #60a5fa;
    }
`;

const CheckText = styled.span`
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #2563eb;

    :root[data-theme="dark"] & {
        color: #93c5fd;
    }
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
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(220, 38, 38, 0.08);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #dc2626;

    :root[data-theme="dark"] & {
        background: rgba(248, 113, 113, 0.12);
        color: #f87171;
    }
`;

const RightPanelSpacer = styled.div`
    flex: 1;
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 28px 26px;

    @media (max-width: 720px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const RangeSummary = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const RangeSummaryLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: rgba(15, 23, 42, 0.55);

    :root[data-theme="dark"] & {
        color: rgba(226, 232, 240, 0.55);
    }
`;

const RangeSummaryValue = styled.div`
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    color: #0f172a;
    word-break: keep-all;

    :root[data-theme="dark"] & {
        color: #f1f5f9;
    }
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
    min-width: 96px;
    height: 44px;
    padding: 0 22px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.7);
    color: rgba(15, 23, 42, 0.75);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
        background: rgba(59, 130, 246, 0.08);
        border-color: rgba(59, 130, 246, 0.22);
        color: #2563eb;
    }

    :root[data-theme="dark"] & {
        border-color: rgba(148, 163, 184, 0.22);
        background: rgba(15, 23, 42, 0.45);
        color: rgba(226, 232, 240, 0.75);

        &:hover {
            background: rgba(96, 165, 250, 0.14);
            border-color: rgba(96, 165, 250, 0.28);
            color: #93c5fd;
        }
    }
`;

const PrimaryButton = styled.button`
    min-width: 136px;
    height: 44px;
    padding: 0 24px;
    border: none;
    border-radius: 14px;
    background: #2563eb;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover:not(:disabled) {
        background: #1d4ed8;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    :root[data-theme="dark"] & {
        background: #3b82f6;
        color: #ffffff;

        &:hover:not(:disabled) {
            background: #2563eb;
        }
    }
`;

const HiddenSubmitForm = styled.form`
    display: none;
`;