import { useEffect, useRef, useState, memo } from 'react';

const TranslateText = memo(({ text }: { text: string }) => {
    const [translatedText, setTranslatedText] = useState(text);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        setTranslatedText(text); // Reset khi text gốc thay đổi
        const currentRef = textRef.current;
        if (!currentRef) return;

        const observer = new MutationObserver(() => {
            if (currentRef.innerText !== translatedText) {
                setTranslatedText(currentRef.innerText);
                // Ngừng observe sau khi đã dịch để tránh lỗi lặp vô hạn
                observer.disconnect();
            }
        });

        observer.observe(currentRef, { childList: true, characterData: true, subtree: true });
        return () => observer.disconnect();
    }, [text]); // Chỉ chạy lại khi text gốc thay đổi

    // lang="en" để Google biết đây là văn bản cần dịch
    // key={text} giúp React tạo lại component khi text thay đổi, khởi động lại quá trình dịch
    return (
        <span ref={textRef} lang="en" key={text} className="notranslate">
      {translatedText}
    </span>
    );
});

export default TranslateText;