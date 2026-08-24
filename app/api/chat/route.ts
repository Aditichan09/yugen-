import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
  }
  
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
    } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 });
    }

    const glossaryInstruction = glossary ? `Mandatory Glossary Compliance: You MUST use the following term mapping strictly: ${glossary}.` : '';

    const contents =
      direction === 'JA_TO_EN'
        ? `You are an elite corporate Japanese-to-English executive translator. Translate the following Japanese text into clear, precise executive-level English. ${glossaryInstruction}
          - Content Medium: ${medium}
          - Original Sender Role: ${yourRole}
          - Original Recipient Role: ${recipientRole}
          - Source Keigo Style: ${keigoType}
          Japanese text: "${prompt}"
          Provide output using these exact bold headers:
          **English Translation:** [Insert translation]
          **Tone Breakdown:** [Insert breakdown]
          **Business Context:** [Insert context]`
        : `You are an elite corporate English-to-Japanese executive translator. Translate the following draft into executive-level Japanese. ${glossaryInstruction}
          - Content Medium: ${medium}
          - Sender Role: ${yourRole}
          - Recipient Role: ${recipientRole}
          - Target Keigo Style: ${keigoType}
          - Politeness Softeners: ${politenessSofteners}
          English Draft: "${prompt}"
          Provide output using these exact bold headers:
          **Translation:** [Insert Japanese text]
          **Romaji:** [Insert Romaji]
          **Quick Context:** [Insert context]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}