import React, { useEffect } from "react";
import styled from "styled-components";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ServiceModal({ isOpen, onClose }: ServiceModalProps) {
    // ESC 키로 닫기
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <Overlay isOpen={isOpen} onClick={onClose}>
            <ModalBox
                isOpen={isOpen}
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫힘 방지
            >
                <Title>서비스 준비 중</Title>

                <Message>
                    해당 기능은 현재 준비 중입니다. <br />
                    곧 만나보실 수 있어요 😊
                </Message>

                <CloseButton onClick={onClose}>닫기</CloseButton>
            </ModalBox>
        </Overlay>
    );
}

/* ================== styled-components ================== */

const Overlay = styled.div<{ isOpen: boolean }>`
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    background: ${({ isOpen }) => (isOpen ? "rgba(0, 0, 0, 0.5)" : "transparent")};
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
    transition: all 0.3s ease-in-out;
`;

const ModalBox = styled.div<{ isOpen: boolean }>`
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 28px;
    width: 360px;
    text-align: center;
    transform: ${({ isOpen }) => (isOpen ? "scale(1)" : "scale(0.95)")};
    transition: all 0.3s ease-in-out;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 12px;
    color: rgb(17, 24, 39);
`;

const Message = styled.p`
    font-size: 15px;
    color: rgb(75, 85, 99);
    margin-bottom: 20px;
    line-height: 1.6;
`;

const CloseButton = styled.button`
    padding: 10px 20px;
    background: rgb(59, 130, 246);
    border: none;
    color: white;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    &:hover {
        background: rgb(37, 99, 235);
    }
`;
