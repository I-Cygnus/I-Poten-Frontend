import React from "react";
import EbookGrid, { EbookItem } from "../components/EbookGrid";
import cover1 from "../assets/book/pro-vol1.png";

export default function BookLandingPage() {
    const items: EbookItem[] = [
        {
            id: 1,
            title: "포텐북 - 실전편",
            coverUrl: cover1,
            ebookUrl: "https://example.com/ebook/int-vol1",
            pdfUrl: "/samples/sample.pdf",
        },
        {
            id: 2,
            title: "포텐북 - 생존편",
            coverUrl: "/assets/sample/survival-vol1.png",
            ebookUrl: "https://example.com/ebook/survival-vol1",
        },
        {
            id: 3,
            title: "포텐북 - 생존편",
            coverUrl: "/assets/sample/survival-vol1.png",
            ebookUrl: "https://example.com/ebook/survival-vol1",
        },
    ];

    return (
        <>
            {/* e-book 리스트 */}
            <EbookGrid items={items}/>
        </>
    );
}