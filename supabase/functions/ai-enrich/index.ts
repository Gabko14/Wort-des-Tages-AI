// @ts-nocheck
/* eslint-disable import/no-unresolved */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase-Umgebungsvariablen fehlen');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

type Entitlement = {
  device_id: string;
  is_premium: boolean;
  premium_source: string | null;
};

type Wort = {
  id: number;
  lemma: string;
  wortklasse?: string;
};

const openAiKey = Deno.env.get('OPENAI_API_KEY');

if (!openAiKey) {
  throw new Error('OPENAI_API_KEY fehlt');
}

type QuizOption = {
  id: string;
  text: string;
};

type Quiz = {
  question: string;
  options: QuizOption[];
  correctOptionId: string;
};

type EnrichedWord = {
  wordId: number;
  definition: string;
  exampleSentences: string[];
  quiz: Quiz;
  stattXSagY: string;
  collocations: string[];
  register: string;
};

async function isPremium(deviceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from<Entitlement>('entitlements')
    .select('is_premium')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.is_premium ?? false;
}

async function enrichWords(words: Wort[]): Promise<EnrichedWord[]> {
  const systemPrompt = `Du bist ein Sprachcoach fuer gehobenes Deutsch. Ziel: Nutzer sollen Woerter RICHTIG einsetzen - nicht nur verstehen.

Liefere JSON mit diesem Schema:
{
  "enrichedWords": [
    {
      "wordId": number,
      "stattXSagY": "Statt 'X' sag 'Y'",
      "definition": "kurze Erklaerung",
      "register": "gehoben" | "formell" | "neutral" | "umgangssprachlich",
      "collocations": ["Verbindung 1", "Verbindung 2"],
      "exampleSentences": ["Satz 1", ...],
      "quiz": { "question": "...", "options": [...], "correctOptionId": "a" }
    }
  ]
}

=== BEISPIELSAETZE (ADAPTIV) ===
Passe die Anzahl an das Wort an:
- Nischenwort (enger Kontext) → 1 Satz
- Standardwort → 2 Saetze
- Vielseitiges Wort (viele Kontexte) → 3-4 Saetze

=== QUIZ: FALLSTRICKE TESTEN ===
NICHT: "Was bedeutet X?" (zu einfach)
SONDERN: "Kann der Nutzer typische FEHLER vermeiden?"

Frage-Format: "In welchem Satz ist '[Wort]' KORREKT verwendet?"

Falsche Optionen muessen VERLOCKEND sein:
- Saetze die fast richtig klingen, aber falsch sind
- Typische Anfaengerfehler (falsches Register, falsche Kollokation)
- Verwechslungen mit aehnlichen Woertern

=== BEISPIEL: "erlesen" (Adjektiv) ===

{
  "stattXSagY": "Statt 'ausgewaehlt' sag 'erlesen'",
  "definition": "Von hoechster Qualitaet, mit Sorgfalt ausgewaehlt. Impliziert Exklusivitaet und Kennerschaft.",
  "register": "gehoben",
  "collocations": ["erlesene Weine", "erlesener Geschmack", "erlesene Gesellschaft"],
  "exampleSentences": [
    "Das Restaurant ist fuer seine erlesene Weinkarte bekannt.",
    "Sie pflegt einen erlesenen Musikgeschmack."
  ],
  "quiz": {
    "question": "In welchem Satz ist 'erlesen' KORREKT verwendet?",
    "options": [
      { "id": "a", "text": "Die erlesene Auswahl an Kaesesorten beeindruckte die Gaeste." },
      { "id": "b", "text": "Ich habe das Buch in einer Nacht erlesen." },
      { "id": "c", "text": "Die erlesene Menge betrug genau 50 Stueck." },
      { "id": "d", "text": "Er hat sich erlesen, morgen frueh zu kommen." }
    ],
    "correctOptionId": "a"
  }
}

Erklaerung (nicht im Output): B verwechselt mit "durchlesen", C verwechselt mit "abgelesen/gemessen", D verwechselt mit "entschlossen".

=== BEISPIEL: "ins Gewicht fallen" (Mehrwortausdruck) ===

{
  "stattXSagY": "Statt 'wichtig sein' sag 'ins Gewicht fallen'",
  "definition": "Bedeutsam sein, einen spuerbaren Unterschied machen. Oft bei Entscheidungen oder Vergleichen.",
  "register": "neutral",
  "collocations": ["schwer ins Gewicht fallen", "kaum ins Gewicht fallen", "nicht ins Gewicht fallen"],
  "exampleSentences": [
    "Bei der Befoerderung fiel seine Erfahrung schwer ins Gewicht.",
    "Die Mehrkosten fallen bei diesem Budget kaum ins Gewicht.",
    "Solche Kleinigkeiten sollten nicht ins Gewicht fallen."
  ],
  "quiz": {
    "question": "In welchem Satz ist 'ins Gewicht fallen' KORREKT verwendet?",
    "options": [
      { "id": "a", "text": "Seine Argumente fielen bei der Jury schwer ins Gewicht." },
      { "id": "b", "text": "Der Koffer fiel mit seinem Gewicht auf den Boden." },
      { "id": "c", "text": "Sie fiel ins Gewicht, als sie die Waage betrat." },
      { "id": "d", "text": "Das Gewicht fiel ihm auf die Schultern." }
    ],
    "correctOptionId": "a"
  }
}

Erklaerung (nicht im Output): B/C/D interpretieren "Gewicht" woertlich statt idiomatisch.`;

  const userPrompt = JSON.stringify({
    words: words.map((w) => ({
      wordId: w.id,
      lemma: w.lemma,
      wortklasse: w.wortklasse ?? null,
    })),
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.2', // DO NOT CHANGE THE MODEL!!!
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('openai_error');
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('openai_no_content');
  }

  const parsed = JSON.parse(content) as { enrichedWords?: EnrichedWord[] };
  return parsed.enrichedWords ?? [];
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let deviceId: string | undefined;
  let words: Wort[] | undefined;

  try {
    const body = await req.json();
    deviceId = body?.deviceId;
    words = body?.words;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!deviceId || typeof deviceId !== 'string') {
    return new Response(JSON.stringify({ error: 'missing_device_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!Array.isArray(words)) {
    return new Response(JSON.stringify({ error: 'missing_words' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const premium = await isPremium(deviceId);
  if (!premium) {
    return new Response(JSON.stringify({ error: 'not_premium', message: 'Premium erforderlich' }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const enrichedWords = await enrichWords(words);
    return new Response(JSON.stringify({ enrichedWords }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'ai_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
