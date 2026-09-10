'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';

const colors = {
  bg: '#050b18',
  glass: 'rgba(59, 130, 246, 0.06)',
  glassBorder: 'rgba(96, 165, 250, 0.15)',
  glassBorderStrong: 'rgba(56, 189, 248, 0.45)',
  accent: '#38bdf8',
  accentDim: '#0ea5e9',
  textMain: '#e6edf7',
  textMuted: '#93a5c4',
  textFaint: '#5c7099',
  white: '#ffffff',
  riskLow: '#34d399',
  riskMedium: '#fbbf24',
  riskHigh: '#f87171',
};

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const glassPanel = {
  background: colors.glass,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${colors.glassBorder}`,
  borderRadius: '16px',
};

const space = { xs: '8px', sm: '16px', md: '24px', lg: '32px' };

type Direction = 'EN_TO_JA' | 'JA_TO_EN';

interface HistoryEntry {
  id: number;
  direction: Direction;
  inputText: string;
  output: string;
  timestamp: string;
}

const OUTPUT_SCHEMA: Record<Direction, { key: string; label: string; speak?: boolean }[]> = {
  EN_TO_JA: [
    { key: 'Translation', label: '🇯🇵 Translation', speak: true },
    { key: 'Romaji', label: '🗣️ Pronunciation' },
    { key: 'Literal Meaning Check', label: '🔍 Literal Meaning Check' },
    { key: 'Confidence', label: '⚠️ Confidence' },
    { key: 'Quick Context', label: '💡 Nuance & Context' },
  ],
  JA_TO_EN: [
    { key: 'English Translation', label: '🇺🇸 Translation', speak: true },
    { key: 'Tone Breakdown', label: '🎌 Tone & Politeness' },
    { key: 'Confidence', label: '⚠️ Confidence' },
    { key: 'Business Context', label: '💡 Nuance & Context' },
  ],
};

function parseOutput(raw: string, direction: Direction) {
  const schema = OUTPUT_SCHEMA[direction];
  const found = schema
    .map((s) => ({ ...s, index: raw.indexOf(s.key) }))
    .filter((s) => s.index !== -1)
    .sort((a, b) => a.index - b.index);
  if (found.length === 0) return [{ label: '📝 Result', content: raw.trim(), speak: true }];
  return found.map((s, i) => {
    const end = i + 1 < found.length ? found[i + 1].index : raw.length;
    let chunk = raw.slice(s.index, end);
    chunk = chunk.replace(/^[^\n]*\n?/, '').trim();
    chunk = chunk.replace(/\*\*/g, '').trim();
    return { label: s.label, content: chunk, speak: s.speak };
  });
}

function riskColor(text: string) {
  const t = text.toLowerCase();
  if (t.includes('low')) return colors.riskHigh;
  if (t.includes('high')) return colors.riskLow;
  return colors.riskMedium;
}

function AmbientAudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const toggleAmbient = () => {
    if (isPlaying) {
      oscillatorsRef.current.forEach((osc) => osc.stop());
      oscillatorsRef.current = [];
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
      setIsPlaying(false);
    } else {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.02, ctx.currentTime);
      masterGain.connect(ctx.destination);
      const frequencies = [110, 164.81, 220, 329.63];
      const oscs: OscillatorNode[] = [];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((Math.random() - 0.5) * 10, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.05 / frequencies.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });
      oscillatorsRef.current = oscs;
      setIsPlaying(true);
    }
  };
  return (
    <button onClick={toggleAmbient} title={isPlaying ? 'Mute ambient lounge sound' : 'Enable soft ambient lounge sound'}
      style={{ fontSize: '12px', color: isPlaying ? colors.accent : colors.textMuted, padding: '6px 14px', borderRadius: '20px', border: `1px solid ${isPlaying ? colors.glassBorderStrong : colors.glassBorder}`, background: isPlaying ? 'rgba(56, 189, 248, 0.1)' : colors.glass, backdropFilter: 'blur(12px)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: fontStack, transition: 'all 0.2s ease' }}>
      {isPlaying ? '🎧 Ambient Lounge: ON' : '🔈 Ambient Lounge: OFF'}
    </button>
  );
}

export default function Home() {
  const [direction, setDirection] = useState<Direction>('EN_TO_JA');
  const [prompt, setPrompt] = useState('');
  const [medium, setMedium] = useState('Email');
  const [yourRole, setYourRole] = useState('Executive');
  const [recipientRole, setRecipientRole] = useState('Client / Stakeholder');
  const [keigoType, setKeigoType] = useState('Keigo (Standard Business)');
  const [intent, setIntent] = useState('General Update');
  const [politenessSofteners, setPolitenessSofteners] = useState(true);
  const [glossary, setGlossary] = useState('');

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load saved history from this browser once, on first load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yugen-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      // If localStorage is unavailable or corrupted, just start empty — never crash the page over this
    }
    setHistoryLoaded(true);
  }, []);

  // Save history to this browser every time it changes, so it survives closing the tab
  useEffect(() => {
    if (!historyLoaded) return; // don't overwrite saved history with the initial empty state
    try {
      localStorage.setItem('yugen-history', JSON.stringify(history));
    } catch (e) {
      // Storage full or unavailable — fail silently rather than breaking the app
    }
  }, [history, historyLoaded]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isEnToJa = direction === 'EN_TO_JA';

  const handleTTS = (textToSpeak: string, langCode: string) => {
    if (!('speechSynthesis' in window)) { alert('Text-to-speech is not supported by your browser.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyForEmail = (translationText: string) => {
    const emailFormatted = isEnToJa
      ? `${translationText}\n\nどうぞよろしくお願いいたします。`
      : `Hello,\n\n${translationText}\n\nBest regards,`;
    navigator.clipboard.writeText(emailFormatted);
    setCopiedSection('email');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTranslate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, direction, medium, yourRole, recipientRole, keigoType, politenessSofteners, glossary, intent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed.');
      setOutput(data.result);
      setHistory((prev) => [
        { id: Date.now(), direction, inputText: prompt, output: data.result, timestamp: new Date().toLocaleTimeString() },
        ...prev,
      ].slice(0, 8));
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setDirection(entry.direction);
    setPrompt(entry.inputText);
    setOutput(entry.output);
    setShowHistory(false);
  };

  const outputBlocks = output ? parseOutput(output, direction) : [];
  const selectStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(10, 15, 30, 0.6)', border: `1px solid ${colors.glassBorder}`,
    borderRadius: '8px', padding: '10px', color: colors.textMain, fontFamily: fontStack, fontSize: '14px',
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: colors.bg, color: colors.textMain, fontFamily: fontStack, padding: space.md }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Navbar />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg, flexWrap: 'wrap', gap: space.sm }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: colors.white }}>
            YUGEN <span style={{ color: colors.accent, fontSize: '14px', fontWeight: 400 }}>// Executive JP-EN Suite</span>
          </h1>
          <div style={{ display: 'flex', gap: space.xs, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ fontSize: '12px', color: showHistory ? colors.accent : colors.textMuted, padding: '6px 14px', borderRadius: '20px', border: `1px solid ${showHistory ? colors.glassBorderStrong : colors.glassBorder}`, background: colors.glass, backdropFilter: 'blur(12px)', cursor: 'pointer', fontFamily: fontStack }}>
              🕐 History ({history.length})
            </button>
            <AmbientAudioToggle />
            <span style={{ fontSize: '12px', color: colors.accent, padding: '6px 14px', borderRadius: '20px', border: `1px solid ${colors.glassBorderStrong}`, background: colors.glass, backdropFilter: 'blur(12px)', whiteSpace: 'nowrap' }}>
              🔒 Encrypted & enterprise secure
            </span>
          </div>
        </div>

        {showHistory && (
          <div style={{ ...glassPanel, padding: space.md, marginBottom: space.md }}>
            <h3 style={{ fontSize: '12px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 0, marginBottom: space.sm }}>
              Saved on This Device
            </h3>
            {history.length === 0 ? (
              <p style={{ fontSize: '13px', color: colors.textFaint, margin: 0 }}>
                Nothing yet — your translations will be saved here on this device, so they're still here even if you close the tab.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => loadHistoryEntry(entry)}
                    style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.glassBorder}`, borderRadius: '8px', padding: '10px 12px', cursor: 'pointer', color: colors.textMain, fontFamily: fontStack }}
                  >
                    <div style={{ fontSize: '11px', color: colors.textFaint, marginBottom: '4px' }}>
                      {entry.timestamp} · {entry.direction === 'EN_TO_JA' ? 'EN → JA' : 'JA → EN'}
                    </div>
                    <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.inputText}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: space.xs, marginBottom: space.md }}>
          <button onClick={() => setDirection('EN_TO_JA')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${direction === 'EN_TO_JA' ? colors.accent : colors.glassBorder}`, background: direction === 'EN_TO_JA' ? 'rgba(56, 189, 248, 0.1)' : colors.glass, color: direction === 'EN_TO_JA' ? colors.accent : colors.textMuted, fontWeight: 600, cursor: 'pointer', fontFamily: fontStack }}>
            English ➔ Japanese Business
          </button>
          <button onClick={() => setDirection('JA_TO_EN')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1px solid ${direction === 'JA_TO_EN' ? colors.accent : colors.glassBorder}`, background: direction === 'JA_TO_EN' ? 'rgba(56, 189, 248, 0.1)' : colors.glass, color: direction === 'JA_TO_EN' ? colors.accent : colors.textMuted, fontWeight: 600, cursor: 'pointer', fontFamily: fontStack }}>
            Japanese ➔ Executive English
          </button>
        </div>

        <div style={{ ...glassPanel, padding: space.md }}>
          <div style={{ marginBottom: space.md }}>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: space.xs }}>
              {isEnToJa ? 'English Draft Input' : 'Japanese Text Input'}
            </label>
            <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder={isEnToJa ? 'Enter message to convert into formal business Japanese...' : 'Enter Japanese corporate text to decode...'}
              style={{ width: '100%', background: 'rgba(5, 11, 24, 0.7)', border: `1px solid ${colors.glassBorder}`, borderRadius: '10px', padding: '12px', color: colors.white, fontFamily: fontStack, fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Settings toggle now sits above the button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: colors.textFaint, fontSize: '12px', cursor: 'pointer', fontFamily: fontStack, padding: '4px 0', textAlign: 'center', marginBottom: space.sm }}
          >
            {showSettings ? '▲ Hide translation settings' : '▼ Show translation settings (Intent, Role, Glossary...)'}
          </button>

          {showSettings && (
            <div>
              <div style={{ marginBottom: space.sm }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Communication Intent</label>
                <select value={intent} onChange={(e) => setIntent(e.target.value)} style={selectStyle}>
                  <option value="General Update">General Update</option>
                  <option value="Request">Request</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Apology">Apology</option>
                  <option value="Declining an Offer">Declining an Offer</option>
                  <option value="Negotiation Opening">Negotiation Opening</option>
                  <option value="Scheduling a Meeting">Scheduling a Meeting</option>
                  <option value="Delivering Bad News">Delivering Bad News</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.sm, marginBottom: space.sm }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Medium</label>
                  <select value={medium} onChange={(e) => setMedium(e.target.value)} style={selectStyle}>
                    <option value="Email">Email</option>
                    <option value="Slack / Chat">Slack / Chat</option>
                    <option value="Formal Memo">Formal Memo</option>
                    <option value="Contract Clause">Contract Clause</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Keigo Style</label>
                  <select value={keigoType} onChange={(e) => setKeigoType(e.target.value)} style={selectStyle}>
                    <option value="Keigo (Standard Business)">Keigo (Standard Business)</option>
                    <option value="Sonkeigo (Respectful/Upward)">Sonkeigo (Respectful/Upward)</option>
                    <option value="Kenjougo (Humble/Self-Deprecating)">Kenjougo (Humble)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.sm, marginBottom: space.sm }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Your Role</label>
                  <select value={yourRole} onChange={(e) => setYourRole(e.target.value)} style={selectStyle}>
                    <option value="Executive">Executive</option>
                    <option value="Mid-Level / Peer">Mid-Level / Peer</option>
                    <option value="Junior Staff">Junior Staff</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Recipient Role</label>
                  <select value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)} style={selectStyle}>
                    <option value="Client / Stakeholder">Client / Stakeholder</option>
                    <option value="C-Suite Executive">C-Suite Executive</option>
                    <option value="Internal Team Member">Internal Team Member</option>
                    <option value="Government Official">Government Official</option>
                    <option value="Vendor / Supplier">Vendor / Supplier</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: space.xs, cursor: 'pointer', fontSize: '13px', color: colors.textMuted, marginBottom: space.sm }}>
                <input type="checkbox" checked={politenessSofteners} onChange={(e) => setPolitenessSofteners(e.target.checked)} style={{ accentColor: colors.accent, width: '15px', height: '15px' }} />
                {isEnToJa ? 'Auto-add politeness softeners' : 'Flag politeness softeners in breakdown'}
              </label>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Brand & Term Glossary (optional)</label>
                <input type="text" value={glossary} onChange={(e) => setGlossary(e.target.value)} placeholder="e.g. Project Apex -> プロジェクト・エイペックス"
                  style={{ width: '100%', background: 'rgba(10, 15, 30, 0.6)', border: `1px solid ${colors.glassBorder}`, borderRadius: '8px', padding: '10px', color: colors.textMain, fontFamily: fontStack, fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          <button onClick={handleTranslate} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: loading ? colors.textFaint : colors.accent, color: '#001018', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: fontStack, transition: 'opacity 0.2s' }}>
            {loading ? 'Processing translation...' : 'Execute Professional Translation'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: space.sm, padding: space.sm, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {outputBlocks.length > 0 && (
          <div style={{ marginTop: space.md, display: 'flex', flexDirection: 'column', gap: space.sm }}>
            {outputBlocks.map((block, i) => {
              const isConfidence = block.label.includes('Confidence');
              return (
                <div key={i} style={{ ...glassPanel, padding: space.md, ...(isConfidence ? { border: `1px solid ${riskColor(block.content)}` } : {}) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
                    <h3 style={{ fontSize: '13px', color: isConfidence ? riskColor(block.content) : colors.accent, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      {block.label}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {block.speak && (
                        <button onClick={() => handleTTS(block.content, isEnToJa ? 'ja-JP' : 'en-US')} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.glassBorder}`, color: colors.white, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>▶ Listen</button>
                      )}
                      {block.speak && (
                        <button onClick={() => handleCopyForEmail(block.content)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.glassBorder}`, color: colors.white, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                          {copiedSection === 'email' ? '✓ Copied' : '📧 Copy for Email'}
                        </button>
                      )}
                      <button onClick={() => handleCopy(block.content, `block-${i}`)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.glassBorder}`, color: colors.white, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                        {copiedSection === `block-${i}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap', fontFamily: fontStack, fontSize: isConfidence ? '16px' : '14px', fontWeight: isConfidence ? 700 : 400, color: isConfidence ? riskColor(block.content) : colors.textMain, margin: 0, lineHeight: 1.6 }}>
                    {block.content}
                  </p>
                </div>
              );
            })}

            <div style={{ textAlign: 'center', marginTop: space.xs }}>
              <p style={{ fontSize: '11px', color: colors.textFaint, marginBottom: '6px' }}>
                ⚠️ AI-generated translation. Not a certified legal translation. Review before use in contracts.
              </p>
              <a href={`mailto:aditimandiya11@gmail.com?subject=Translation Review Request&body=${encodeURIComponent(output)}`} style={{ fontSize: '12px', color: colors.accent, textDecoration: 'underline' }}>
                Request human review of this translation
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}