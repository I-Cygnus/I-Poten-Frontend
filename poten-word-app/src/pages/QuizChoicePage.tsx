import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import QuizChoiceCard from "../components/QuizChoiceCard.tsx";

const Stage = styled.div`
    width: 100%;
    min-height: calc(100dvh - 110px);
    display: grid;
    place-items: center;
    place-content: center;
    padding: clamp(12px, 2vw, 24px);
    background:
            radial-gradient(50% 38% at 10% 10%, rgba(62,99,224,.06) 0%, rgba(62,99,224,0) 70%),
            radial-gradient(40% 32% at 88% 18%, rgba(62,99,224,.08) 0%, rgba(62,99,224,0) 70%);
    border-radius: 28px;
`;

const QUIZ = [
    {
        q: "텍스트를 입력하세요.",
        choices: ["보기1", "보기2", "보기3", "보기4"],
        correctIndex: 2,
        explanation: "텍스트를 입력하세요.",
    },
    {
        q: "두 번째 문제 예시",
        choices: ["Alpha", "Bravo", "Charlie", "Delta"],
        correctIndex: 1,
        explanation: "설명 예시",
    },
    {
        q: "세 번째 문제 예시",
        choices: ["Red", "Green", "Blue", "Yellow"],
        correctIndex: 0,
        explanation: "설명 예시",
    },
];

const QUIZ_LEN = QUIZ.length;
const LS_KEY = "quiz/choice/progress"; // 로컬스토리지 키도 객관식용으로

export default function ChoiceQuizPage() {
    const nav = useNavigate();

    // 1-based 현재 문항 인덱스
    const [idx, setIdx] = React.useState(1);

    // 객관식 선택 인덱스(number|null)로 관리
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

    const [showResult, setShowResult] = React.useState(false);
    const [progress, setProgress] = React.useState<("O" | "X" | null)[]>(
        () => Array.from({ length: QUIZ_LEN }, () => null)
    );

    const cur = QUIZ[idx - 1];
    const isCorrect = selectedIndex !== null && selectedIndex === cur.correctIndex;

    // 선택하면 결과 공개
    React.useEffect(() => {
        if (selectedIndex === null) return;
        setShowResult(true);
    }, [selectedIndex]);

    // 결과 공개 시 진행도(O/X) 반영(한 번만)
    React.useEffect(() => {
        if (!showResult || selectedIndex === null) return;
        setProgress((prev) => {
            const next = [...prev];
            if (next[idx - 1] == null) next[idx - 1] = isCorrect ? "O" : "X";
            localStorage.setItem(LS_KEY, JSON.stringify(next));
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResult]);

    // 다음 문제
    const goNext = () => {
        if (idx >= QUIZ_LEN) {
            nav("/poten-word/quiz/result", { state: { progress } });
            return;
        }
        setSelectedIndex(null);
        setShowResult(false);
        requestAnimationFrame(() => setIdx(i => i + 1));
    };

    return (
        <Stage>
            <QuizChoiceCard
                key={`q-${idx}`}
                index={idx}
                total={QUIZ_LEN}
                question={cur.q}
                choices={cur.choices}
                value={selectedIndex}
                onChange={setSelectedIndex}
                showResult={showResult}
                correct={cur.correctIndex}
                explanation={cur.explanation}
                progress={progress}
                onNext={goNext}
                onGoto={(n) => {
                    setSelectedIndex(null);
                    setShowResult(false);
                    requestAnimationFrame(() => setIdx(n));
                }}
            />
        </Stage>
    );
}
