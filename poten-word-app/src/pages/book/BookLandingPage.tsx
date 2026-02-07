import React from "react";
import EbookGrid, { EbookItem } from "../../components/book/EbookGrid";
import cover1 from "../../assets/book/team-01.png";
import cover2 from "../../assets/book/choi.png";
import cover3 from "../../assets/book/jihan.png";
import cover4 from "../../assets/book/min.png";

export default function BookLandingPage() {
    const items: EbookItem[] = [
        {
            id: 1,
            title: "시골쥐×서울쥐 첫 이야기",
            coverUrl: cover1,
            pdfUrl: "http://localhost:3006/samples/sample.pdf",
        },
        {
            id: 2,
            title: "Developer 최현수",
            coverUrl: cover2,
            pdfUrl: "http://localhost:3006/samples/sample.pdf",
        },
        {
            id: 3,
            title: "Developer 김지한",
            coverUrl: cover3,
            pdfUrl: "http://localhost:3006/samples/sample.pdf",
        },
        {
            id: 4,
            title: "Developer 김정민",
            coverUrl: cover4,
            pdfUrl: "http://localhost:3006/samples/sample.pdf",
        },
    ];

    return (
        <>
            {/* e-book 리스트 */}
            <EbookGrid items={items}/>
        </>
    );
}