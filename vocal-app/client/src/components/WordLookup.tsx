import { useState } from 'react';
import { lookupWord } from '../services/api';
import type {WordResponse} from '../types/word';
import TranslateText from './TranslateText'; // Import component dịch

export function WordLookup() {
    const [word, setWord] = useState('');
    const [result, setResult] = useState<WordResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!word.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await lookupWord(word);
            setResult(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold text-center mb-6 text-white">Free Vocabulary Lookup</h1>
            <form onSubmit={handleLookup} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter an English word..."
                    className="flex-grow p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-800 text-white"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-500 transition-colors"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg text-center">{error}</div>}

            {result && (
                <div className="text-left bg-gray-800 p-6 rounded-lg animate-fade-in mt-6">
                    <div className="mb-4 border-b border-gray-700 pb-4">
                        <span className="font-bold text-3xl text-cyan-400">{word}</span>
                        {result.ipa && <em className="ml-4 text-xl text-red-400">{result.ipa}</em>}
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-xl mb-3 text-gray-300">Meanings (Vietnamese):</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {result.meanings.map((meaning, i) => (
                                <li key={i} className="text-gray-200">
                                    <TranslateText text={meaning} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-xl mb-3 text-gray-300">Examples:</h3>
                        <div className="space-y-4">
                            {result.examples.map((ex, i) => (
                                <div key={i} className="bg-gray-700/50 p-4 rounded-md">
                                    <p className="font-semibold text-blue-300">{ex.sentence}</p>
                                    <p className="text-gray-400 italic mt-1">
                                        <TranslateText text={ex.explanation} />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}