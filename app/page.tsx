'use client';

import React, { useState, useRef, useEffect } from 'react';

// --- Theme Constants ---
const colors = {
  bg: '#0a0b0e',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderStrong: 'rgba(251, 191, 36, 0.3)',
  gold: '#fbbf24',
  textMain: '#f3f4f6',
  textMuted: '#9ca3af',
  textFaint: '#6b7280',
  white: '#ffffff',
};

const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const glassPanel = {
  background: colors.glass,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: `1px solid ${colors.glassBorder}`,
  borderRadius: '16px',
};

const space = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
};

// --- Ambient Audio Synthesizer Component ---
function AmbientAudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const toggleAmbient = () => {
    if (isPlaying) {
      oscillatorsRef.current.forEach((osc) => osc.stop());
      oscillatorsRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.02, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

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
    <button
      onClick={toggleAmbient}
      title={isPlaying ? 'Mute ambient lounge sound' : 'Enable soft ambient lounge sound'}
      style={{
        fontSize: '12px',
        color: isPlaying ? colors.gold : colors.textMuted,
        padding: '6px 14px',
        borderRadius: '20px',
        border: `1px solid ${isPlaying ? colors.glassBorderStrong : colors.glassBorder}`,
        background: isPlaying ? 'rgba(251, 191, 36, 0.1)' : colors.glass,
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: fontStack,
        transition: 'all 0.2s ease',
      }}
    >
      {isPlaying ? '🎧 Ambient Lounge: ON' : '🔈 Ambient Lounge: OFF'}
    </button>
  );
}

export default function Home() {
  const [direction, setDirection] = useState<'EN_TO_JA' | 'JA_TO_EN'>('EN_TO_JA');
  const [prompt, setPrompt] = useState('');
  const [medium, setMedium] = useState('Email');
  const [yourRole, setYourRole] = useState('Executive');
  const [recipientRole, setRecipientRole] = useState('Client / Stakeholder');
  const [keigoType, setKeigoType] = useState('Keigo (Standard Business)');
  const [politenessSofteners, setPolitenessSofteners] = useState(true);
  const [glossary, setGlossary] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Text-to-Speech Handler
  const handleTTS = (textToSpeak: string, langCode: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    window.speechSynthesis.speak(utterance);
  };

  // Quick Copy Handler
  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
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
        body: JSON.stringify({
          prompt,
          direction,
          medium,
          yourRole,
          recipientRole,
          keigoType,
          politenessSofteners,
          glossary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed.');
      setOutput(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.textMain,
        fontFamily: fontStack,
        padding: space.md,
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.lg, flexWrap: 'wrap', gap: space.sm }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: colors.white }}>
              ECLIPTIX <span style={{ color: colors.gold, fontSize: '14px', fontWeight: 400 }}>// Executive JP-EN Suite</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: space.xs, alignItems: 'center', flexWrap: 'wrap' }}>
            <AmbientAudioToggle />
            <span
              style={{
                fontSize: '12px',
                color: colors.gold,
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1px solid ${colors.glassBorderStrong}`,
                background: colors.glass,
                backdropFilter: 'blur(12px)',
                whiteSpace: 'nowrap',
              }}
            >
              🔒 Encrypted & enterprise secure
            </span>
          </div>
        </div>

        {/* Translation Mode Selector */}
        <div style={{ display: 'flex', gap: space.xs, marginBottom: space.md }}>
          <button
            onClick={() => setDirection('EN_TO_JA')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: `1px solid ${direction === 'EN_TO_JA' ? colors.gold : colors.glassBorder}`,
              background: direction === 'EN_TO_JA' ? 'rgba(251, 191, 36, 0.1)' : colors.glass,
              color: direction === 'EN_TO_JA' ? colors.gold : colors.textMuted,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fontStack,
            }}
          >
            English ➔ Japanese Business
          </button>
          <button
            onClick={() => setDirection('JA_TO_EN')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: `1px solid ${direction === 'JA_TO_EN' ? colors.gold : colors.glassBorder}`,
              background: direction === 'JA_TO_EN' ? 'rgba(251, 191, 36, 0.1)' : colors.glass,
              color: direction === 'JA_TO_EN' ? colors.gold : colors.textMuted,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: fontStack,
            }}
          >
            Japanese ➔ Executive English
          </button>
        </div>

        {/* Main Interface Box */}
        <div style={{ ...glassPanel, padding: space.md }}>
          
          {/* Text Input */}
          <div style={{ marginBottom: space.md }}>
            <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: space.xs }}>
              {direction === 'EN_TO_JA' ? 'English Draft Input' : 'Japanese Text Input'}
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={direction === 'EN_TO_JA' ? 'Enter message to convert into formal business Japanese...' : 'Enter Japanese corporate text to decode...'}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${colors.glassBorder}`,
                borderRadius: '10px',
                padding: '12px',
                color: colors.white,
                fontFamily: fontStack,
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* Configuration Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.sm, marginBottom: space.md }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Medium</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${colors.glassBorder}`, borderRadius: '8px', padding: '10px', color: colors.textMain, fontFamily: fontStack }}
              >
                <option value="Email">Email</option>
                <option value="Slack / Chat">Slack / Chat</option>
                <option value="Formal Memo">Formal Memo</option>
                <option value="Contract Clause">Contract Clause</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.textFaint, marginBottom: '4px' }}>Keigo Style</label>
              <select
                value={keigoType}
                onChange={(e) => setKeigoType(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${colors.glassBorder}`, borderRadius: '8px', padding: '10px', color: colors.textMain, fontFamily: fontStack }}
              >
                <option value="Keigo (Standard Business)">Keigo (Standard Business)</option>
                <option value="Sonkeigo (Respectful/Upward)">Sonkeigo (Respectful/Upward)</option>
                <option value="Kenjougo (Humble/Self-Deprecating)">Kenjougo (Humble)</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleTranslate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: loading ? colors.textFaint : colors.gold,
              color: '#000000',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: fontStack,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Processing translation...' : 'Execute Professional Translation'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ marginTop: space.sm, padding: space.sm, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Output Result Display */}
        {output && (
          <div style={{ ...glassPanel, padding: space.md, marginTop: space.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm }}>
              <h3 style={{ fontSize: '14px', color: colors.gold, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Translation Result
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleTTS(output, direction === 'EN_TO_JA' ? 'ja-JP' : 'en-US')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.glassBorder}`, color: colors.white, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  ▶ Listen
                </button>
                <button
                  onClick={() => handleCopy(output, 'all')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.glassBorder}`, color: colors.white, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  {copiedSection === 'all' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: fontStack, fontSize: '14px', color: colors.textMain, margin: 0, lineHeight: 1.6 }}>
              {output}
            </pre>
          </div>
        )}

        {/* About The Creator Section */}
        <div style={{ ...glassPanel, padding: space.md, marginTop: space.lg }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: colors.gold, marginBottom: space.sm, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            About The Creator
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.glassBorder}`, borderRadius: '12px', padding: space.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xs }}>
              <h3 style={{ fontSize: '15px', color: colors.white, margin: 0 }}>R N Meena</h3>
              <span style={{ fontSize: '11px', fontWeight: 600, color: colors.gold, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '12px', border: `1px solid ${colors.glassBorderStrong}` }}>
                Solo Architect & Developer
              </span>
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '8px 0 0 0', lineHeight: 1.6 }}>
              Built from the ground up to solve complex cross-border communication challenges. This platform combines modern full-stack engineering with advanced AI contextual modeling to streamline executive-level correspondence.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}