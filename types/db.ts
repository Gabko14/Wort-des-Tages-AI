export interface Wort {
  id: number;
  lemma: string;
  url: string;
  wortklasse: string;
  artikeldatum: string;
  artikeltyp: string;
  frequenzklasse: string;
}

export interface WortDesTages {
  id: number;
  fk_wort1: number;
  fk_wort2: number;
  fk_wort3: number;
  fk_wort4: number;
  fk_wort5: number;
  date: string;
}

export interface UserSettings {
  id: number;
  anzahl_woerter: number;
}
