import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const {
      prompt,
      direction = 'EN_TO_JA',
      medium,
      yourRole,
      recipientRole,
      keigoType,
      politenessSofteners,
      glossary,
      intent,
    } = await req.json();

    const contents =
      direction === 'JA_TO_EN'
        ? `You are an expert executive Japanese-to-English business translator.
Translate the following Japanese text into clear, executive-level English business prose.

Context parameters:
- Content Medium: ${medium}
- Original Sender Role: ${yourRole}
- Original Recipient Role: ${recipientRole}
- Source Keigo Style (as written): ${keigoType}
- Communication Intent: ${intent || 'Not specified'}
- Custom Glossary: ${glossary || 'None'}

Japanese text: "${prompt}"

Business executives are busy. Keep the output EXTREMELY concise and scannable. Do NOT use tables. Use this exact format:

**🇺🇸 English Translation:**
[Natural, executive-level English translation]

**🎌 Tone Breakdown:**
[1-2 sentences on the politeness level used and what it signals]

**⚠️ Confidence:**
[One word only: Low, Medium, or High]

**💡 Business Context:**
[1-2 sentences on what this means practically for the recipient's response or next step]`
        : `You are an expert executive Japanese corporate translator.
Translate the following draft into executive-level Japanese based on these parameters:
- Medium: ${medium} | Sender: ${yourRole} | Recipient: ${recipientRole}
- Style: ${keigoType} | Softeners: ${politenessSofteners} | Glossary: ${glossary || 'None'}
- Communication Intent: ${intent || 'Not specified'} — let this shape word choice and structure (e.g. a "Declining an offer" intent should sound apologetic and indirect per Japanese business norms; a "Negotiation opening" should sound confident but humble; a "Follow-up" should sound light, not pushy)

Draft: "${prompt}"

Business executives are busy. Keep the output EXTREMELY concise and easy to scan. Do NOT use tables. Use this exact format:

**🇯🇵 Translation:**
[The Japanese text]

**🗣️ Romaji (Pronunciation):**
[The Romaji]

**🔍 Literal Meaning Check:**
[A plain English gloss of what the Japanese literally says]

**⚠️ Confidence:**
[One word only: Low, Medium, or High]

**💡 Quick Context:**
[1-2 sentences explaining why this tone and phrasing fits the stated intent]`;

    const response = await ai.models.generateContent({
      model: 'models/gemini-3.6-flash',
      contents,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}