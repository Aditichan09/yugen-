'use client';

import { useState } from 'react';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputText }),
      });

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        setOutputText(`Error: ${data.error}`);
        return;
      }

      setOutputText(data.result);
    } catch (err) {
      console.error(err);
      setOutputText('Failed to fetch response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ffffff', marginBottom: '1rem' }}>Executive Japanese Converter</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter English text here..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            color: '#000000',
            backgroundColor: '#ffffff',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        
        <button
          onClick={handleConvert}
          disabled={loading}
          style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#0070f3',
            color: '#ffffff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Generating...' : 'Generate Executive Output'}
        </button>

        {outputText && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333' }}>
            <h3 style={{ marginTop: 0, color: '#0070f3' }}>Output:</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{outputText}</p>
          </div>
        )}
      </div>
    </main>
  );
}