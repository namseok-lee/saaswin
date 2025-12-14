'use client';
import { useState, useEffect } from 'react';

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState('blue');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'blue';
        setTheme(savedTheme);
        document.body.className = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'blue' ? 'green' : 'blue';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.className = newTheme;
        document.body.setAttribute('data-theme', newTheme);

        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return <button onClick={toggleTheme}>테마변경</button>;
}
