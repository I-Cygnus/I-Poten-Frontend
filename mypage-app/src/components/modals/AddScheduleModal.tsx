import styled from "styled-components";
import { useEffect, useState } from "react";
import { UserScheduleRequest } from "../../api/userScheduleApi.ts";
import { notifyError, notifySuccess } from "../../utils/toast";

/* 🕐 TimePicker (오전/오후 + 시 + 분) */
function TimePicker({ label, name, value, onChange, disabled }: {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    disabled?: boolean;
}) {
    const [ampm, setAmpm] = useState("AM");
    const [hour, setHour] = useState("01");
    const [minute, setMinute] = useState("00");

    useEffect(() => {
        if (!value) return;
        const [h, m] = value.split(":").map(Number);
        if (h >= 12) {
            setAmpm("PM");
            setHour((h === 12 ? 12 : h - 12).toString().padStart(2, "0"));
        } else {
            setAmpm("AM");
            setHour((h === 0 ? 12 : h).toString().padStart(2, "0"));
        }
        setMinute(m.toString().padStart(2, "0"));
    }, [value]);

    useEffect(() => {
        let realHour = Number(hour);
        if (ampm === "PM" && realHour !== 12) realHour += 12;
        if (ampm === "AM" && realHour === 12) realHour = 0;
        const formatted = `${realHour.toString().padStart(2, "0")}:${minute}`;
        onChange(name, formatted);
    }, [ampm, hour, minute]);

    return (
        <TimePickerWrapper>
            <label>{label}</label>
            <PickerRow>
                <select value={ampm} onChange={(e) => setAmpm(e.target.value)} disabled={disabled}>
                    <option value="AM">오전</option>
                    <option value="PM">오후</option>
                </select>
                <select value={hour} onChange={(e) => setHour(e.target.value)} disabled={disabled}>
                    {Array.from({ length: 12 }, (_, i) => {
                        const val = (i + 1).toString().padStart(2, "0");
                        return <option key={val} value={val}>{val}</option>;
                    })}
                </select>
                <span>:</span>
                <select value={minute} onChange={(e) => setMinute(e.target.value)} disabled={disabled}>
                    {[0,5,10,15,20,25,30,35,40,45,50,55].map((m) => {
                        const val = m.toString().padStart(2, "0");
                        return <option key={val} value={val}>{val}</option>;
                    })}
                </select>
            </PickerRow>
        </TimePickerWrapper>
    );
}

/* 📅 AddScheduleModal */
export default function AddScheduleModal({ onClose, onSubmit, initialData }: {
    onClose: () => void;
    onSubmit: (data: UserScheduleRequest) => Promise<void>;
    initialData?: any;
}) {
    const isEditMode = !!initialData;
    const [form, setForm] = useState({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        allDay: false,
        color: "#3b82f6",
    });

    const handleTimeChange = (name: string, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const formatDate = (d: Date) => d.toLocaleDateString("en-CA");
        const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

        if (isEditMode) {
            const start = new Date(initialData.startTime);
            const end = new Date(initialData.endTime);
            setForm({
                ...initialData,
                startDate: formatDate(start),
                startTime: formatTime(start),
                endDate: formatDate(end),
                endTime: formatTime(end),
            });
        } else {
            const now = new Date();
            const roundedStart = new Date(now);
            const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;
            if (roundedMinutes === 60) roundedStart.setHours(now.getHours() + 1, 0, 0, 0);
            else roundedStart.setMinutes(roundedMinutes, 0, 0);
            const roundedEnd = new Date(roundedStart);
            roundedEnd.setHours(roundedStart.getHours() + 1);
            setForm((p) => ({
                ...p,
                startDate: formatDate(roundedStart),
                startTime: formatTime(roundedStart),
                endDate: formatDate(roundedEnd),
                endTime: formatTime(roundedEnd),
            }));
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return notifyError("제목을 입력해주세요.");
        if (!form.startDate || !form.endDate) return notifyError("날짜를 선택해주세요.");
        if (new Date(form.endDate) < new Date(form.startDate))
            return notifyError("종료일은 시작일 이후여야 합니다.");

        try {
            const startTime = form.allDay
                ? `${form.startDate}T00:00:00`
                : `${form.startDate}T${form.startTime}`;
            const endTime = form.allDay
                ? `${form.endDate}T23:59:59`
                : `${form.endDate}T${form.endTime}`;

            const data: UserScheduleRequest = { ...form, startTime, endTime };
            await onSubmit(data);

            onClose();
        } catch (err: any) {
            console.error(err);
            const message = err?.response?.data?.message || "일정 저장 중 오류가 발생했습니다.";
            notifyError(message);
        }
    };

    return (
        <Backdrop onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <h3>{isEditMode ? "일정 수정" : "일정 추가"}</h3>
                    <CloseBtn onClick={onClose}>×</CloseBtn>
                </Header>

                <Form onSubmit={handleSubmit}>
                    <label>
                        제목
                        <input
                            name="title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="일정 제목을 입력하세요"
                        />
                    </label>

                    <label>
                        설명
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            placeholder="일정 설명을 입력하세요 (선택)"
                        />
                    </label>

                    <TimeGroup>
                        <TimeRow>
                            <label>
                                시작 날짜
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    required
                                />
                            </label>
                            <TimePicker
                                label="시작 시간"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleTimeChange}
                                disabled={form.allDay}
                            />
                        </TimeRow>

                        <TimeRow>
                            <label>
                                종료 날짜
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    required
                                />
                            </label>
                            <TimePicker
                                label="종료 시간"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleTimeChange}
                                disabled={form.allDay}
                            />
                        </TimeRow>

                        <AllDayRow>
                            <span>하루 종일</span>
                            <SwitchWrapper>
                                <SwitchInput
                                    type="checkbox"
                                    checked={form.allDay}
                                    onChange={() => setForm({ ...form, allDay: !form.allDay })}
                                />
                                <SwitchSlider checked={form.allDay} />
                            </SwitchWrapper>
                        </AllDayRow>
                    </TimeGroup>

                    <label>
                        장소
                        <input
                            name="location"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="예: 강남 카페, 스터디룸 등"
                        />
                    </label>

                    <ColorSelectRow>
                        <span>색상</span>
                        <ColorPalette>
                            {["#A5D8FF","#B2F2BB","#FFD6A5","#D0BFFF","#FFADAD","#FDFFB6","#C8E7FF","#E8C2FF"].map((c) => (
                                <ColorCircle
                                    key={c}
                                    color={c}
                                    selected={form.color === c}
                                    onClick={() => setForm({ ...form, color: c })}
                                />
                            ))}
                        </ColorPalette>
                    </ColorSelectRow>

                    <SubmitBtn type="submit">{isEditMode ? "수정하기" : "등록하기"}</SubmitBtn>
                </Form>
            </Modal>
        </Backdrop>
    );
}

/* ========== 🍏 Styled ========== */
const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const Modal = styled.div`
    background: #ffffff;
    border-radius: 20px;
    padding: 28px 26px;
    width: 440px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Noto Sans KR", sans-serif;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    h3 {
        font-size: 18px;
        font-weight: 600;
        color: #111;
    }
`;

const CloseBtn = styled.button`
    border: none;
    background: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: #444; }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 18px;
    label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 14px;
        color: #333;
    }
    input, textarea, select {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 14px;
        background: #fafafa;
        transition: all 0.2s;
        &:focus {
            border-color: #007aff;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(0,122,255,0.15);
            outline: none;
        }
    }
    textarea { resize: none; }
`;

const TimeGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TimeRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
`;

const TimePickerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
`;

const PickerRow = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    select {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 6px 10px;
        background: #fafafa;
        &:focus {
            border-color: #007aff;
            background: #fff;
        }
    }
    span { color: #666; }
`;

/* ✅ 하루 종일 토글 (Apple Switch) */
const AllDayRow = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #333;
`;

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 26px;
`;

const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;
`;

const SwitchSlider = styled.span<{ checked: boolean }>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ checked }) => (checked ? "#007AFF" : "#d6d6d6")};
  transition: all 0.3s ease;
  border-radius: 26px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
  
  &::before {
    content: "";
    position: absolute;
    height: 22px;
    width: 22px;
    left: ${({ checked }) => (checked ? "20px" : "2px")};
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`;


const ColorSelectRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
`;

const ColorPalette = styled.div`
    display: flex;
    gap: 10px;
`;

const ColorCircle = styled.button.attrs({ type: "button" })<{ color: string; selected: boolean }>`
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: ${({ selected }) => (selected ? "2px solid #007aff" : "1px solid #ccc")};
    background-color: ${({ color }) => color};
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
        transform: scale(1.15);
        box-shadow: 0 0 6px rgba(0,122,255,0.25);
    }
`;

const SubmitBtn = styled.button`
    background: linear-gradient(90deg, #007aff 0%, #0a84ff 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 0;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 14px rgba(0,122,255,0.25);
    transition: all 0.25s;
    &:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,122,255,0.35); }
    &:active { transform: translateY(0); box-shadow: 0 3px 6px rgba(0,122,255,0.2); }
`;
