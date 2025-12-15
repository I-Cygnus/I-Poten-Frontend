import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import OXQuizCard from "../components/OXQuizCard";

type OX = "O" | "X";

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
    { q: "텍스트를 입력하세요.", correct: "O" as OX, explanation: "텍스트를 입력하세요." },
    { q: "두 번째 문제 예시",   correct: "X" as OX, explanation: "설명 예시" },
    { q: "세 번째 문제 예시",   correct: "O" as OX, explanation: "설명 예시" },
];
const QUIZ_LEN = QUIZ.length;
const LS_KEY = "quiz/initials-or-ox/progress";

export default function OXQuizPage() {
    const nav = useNavigate();

    const [idx, setIdx] = React.useState(1);                   // 1-based
    const [value, setValue] = React.useState<OX | null>(null); // 사용자가 고른 값
    const [showResult, setShowResult] = React.useState(false);
    const [progress, setProgress] = React.useState<(OX|null)[]>(
        () => Array.from({ length: QUIZ_LEN }, () => null)
    );

    const cur = QUIZ[idx - 1];
    const isCorrect = value !== null && value === cur.correct;

    // 선택 → 결과 공개
    React.useEffect(() => {
        if (value === null) return;
        setShowResult(true);
    }, [value]);

    // 결과가 열리면 진행도에 반영(한 번만)
    React.useEffect(() => {
        if (!showResult || value === null) return;
        setProgress(prev => {
            const next = [...prev];
            if (next[idx - 1] == null) next[idx - 1] = isCorrect ? "O" : "X";
            localStorage.setItem(LS_KEY, JSON.stringify(next));
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResult]);

    const goNext = () => {
        if (idx >= QUIZ_LEN) {
            nav("/poten-word/quiz/result", { state: { progress } });
            return;
        }
        setIdx(i => i + 1);
        setValue(null);
        setShowResult(false);
    };

    return (
        <Stage>
            <OXQuizCard
                index={idx}
                question={cur.q}
                value={value}
                onChange={setValue}
                showResult={showResult}
                correct={cur.correct}
                explanation={cur.explanation}
                progress={progress}
                onNext={goNext}
            />
        </Stage>
    );
}
