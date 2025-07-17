import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/greeting')
            .then((res) => res.json())
            .then((data) => setMessage(data.message));
    }, []);

    return (
        <>
            <h1>Vite + React + Node.js</h1>
            <div className="card">
                <p>Message from server: <strong>{message || 'Loading...'}</strong></p>
            </div>
        </>
    )
}

export default App