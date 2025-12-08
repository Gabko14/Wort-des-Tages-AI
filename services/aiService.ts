import { supabase } from '@/config/supabase';
import { Wort } from '@/services/database';
import { EnrichedWord } from '@/types/ai';

import { getDeviceId } from './deviceService';

export async function enrichWords(
  words: Wort[]
): Promise<EnrichedWord[] | null> {
  const deviceId = await getDeviceId();

  const payload = {
    deviceId,
    words: words.map((w) => ({
      id: w.id,
      lemma: w.lemma,
      wortklasse: w.wortklasse,
    })),
  };

  const { data, error } = await supabase.functions.invoke('ai-enrich', {
    body: payload,
  });

  if (error) {
    return null;
  }

  return (data?.enrichedWords as EnrichedWord[]) ?? null;
}
