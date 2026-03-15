import React from "react";
import styled from "styled-components";

const UI = {
    color: {
        bg: "#ffffff",
        text: "#111827",
        muted: "#6b7280",
    },
    font: {
        h2: "22px",
        body: "15px",
    },
};

const Toolbar = styled.div`
    position: sticky;
    top: 0;
    z-index: 5;
    background: ${UI.color.bg};
    padding: 12px 8px;
    margin-bottom: 16px;
`;

const RowFlex = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const BackBtn = styled.button`
    appearance: none;
    border: 0;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    padding: 6px 8px;
`;

const Title = styled.h2`
    margin: 0;
    font-size: ${UI.font.h2};
    letter-spacing: -0.01em;
    color: ${UI.color.text};
`;

const Count = styled.span`
    margin-left: 8px;
    font-size: ${UI.font.body};
    font-weight: 400;
    letter-spacing: -0.02em;
    color: ${UI.color.muted};
    line-height: 1;
`;

const Spacer = styled.div`
    flex: 1 1 auto;
`;

type Props = {
    title: string;
    count?: React.ReactNode;
    onBack: () => void;
    meta?: React.ReactNode;
    right?: React.ReactNode;
};

export default function LearningPageHeader({
                                               title,
                                               count,
                                               onBack,
                                               meta,
                                               right,
                                           }: Props) {
    return (
        <Toolbar>
            <RowFlex>
                <BackBtn onClick={onBack} aria-label="뒤로 가기">
                    ←
                </BackBtn>

                <Title>{title}</Title>
                {count ? <Count>{count}</Count> : null}
                {meta}

                <Spacer />
                {right}
            </RowFlex>
        </Toolbar>
    );
}