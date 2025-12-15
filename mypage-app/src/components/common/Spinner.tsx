// src/components/common/Spinner.tsx
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh; /* 화면 중앙 배치 */
`;

const Circle = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb; /* 연회색 테두리 */
  border-top: 3px solid #007aff; /* Apple-style blue */
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export default function Spinner() {
    return (
        <SpinnerWrapper>
            <Circle />
        </SpinnerWrapper>
    );
}
