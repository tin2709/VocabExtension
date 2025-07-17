import { useEffect } from 'react';
import './App.css';
import { WordLookup } from './components/WordLookup';

// Khai báo kiểu cho window để TypeScript không báo lỗi
declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

function App() {
    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: 'en', includedLanguages: 'vi', autoDisplay: false },
                'google_translate_element'
            );
        };

        if (!document.querySelector('#google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="bg-gray-900 min-h-screen">
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            <WordLookup />
        </div>
    );
}

export default App;