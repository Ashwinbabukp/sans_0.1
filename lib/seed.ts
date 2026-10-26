import type { FontKey, Mood, Quote } from './types';

const q = (
  id: number, text: string, author: string, theme: number, font: FontKey, likes: number,
  mood: Mood, tags: string[], extra: Partial<Quote> = {},
): Quote => ({
  id: String(id), text, author, theme, font, likes, mood, tags, liked: false, collection: null,
  align: 'left', size: 'm', textColor: 'auto', sticker: null, comments: [], ...extra,
});

export const SEED_QUOTES: Quote[] = [
  q(1, 'Start before you feel ready. Ready is a story we tell ourselves.', 'meera.writes', 0, 'serif', 128, 'motivation', ['startnow', 'motivation'], {
    comments: [
      { id: 'c1', author: 'arjun_codes', text: 'Needed this today.' },
      { id: 'c2', author: 'sana.k', text: 'Saving this one 🤍' },
    ],
  }),
  q(2, 'Slow progress is still progress.', 'arjun_codes', 1, 'poster', 342, 'motivation', ['motivation', 'progress']),
  q(3, 'The best view comes after the hardest climb, so keep walking.', 'nadiya', 2, 'type', 87, 'motivation', ['keepwalking', 'motivation']),
  q(4, 'Be soft in a world that rewards sharp edges.', 'sana.k', 7, 'script', 215, 'calm', ['softness', 'calm'], { align: 'center', sticker: '🌸' }),
  q(5, 'Nobody remembers the bugs you fixed quietly at 2 a.m.', 'devika', 4, 'marker', 410, 'funny', ['devlife', 'funny'], {
    comments: [{ id: 'c3', author: 'meera.writes', text: 'So true 😂' }],
  }),
  q(6, 'Write the sentence you’re afraid of first.', 'meera.writes', 5, 'serif', 64, 'motivation', ['writing', 'motivation']),
  q(7, 'Tea first. Then the world.', 'meera.writes', 2, 'hand', 151, 'calm', ['tea', 'calm'], { sticker: '☕' }),
  q(8, 'Small joys count too.', 'meera.writes', 3, 'round', 98, 'love', ['gratitude', 'joy']),
  q(9, 'Let the quiet days teach you.', 'meera.writes', 9, 'elegant', 73, 'calm', ['calm', 'life'], { align: 'center', sticker: '🌿' }),
  q(10, 'You are allowed to bloom late.', 'meera.writes', 0, 'hand', 233, 'love', ['selflove', 'life']),
  q(11, 'തുടങ്ങാൻ ഒരു ചെറിയ ചുവട് മതി.', 'nadiya', 4, 'indic', 56, 'motivation', ['malayalam', 'motivation']),
  q(12, 'छोटे कदम भी मंज़िल तक पहुँचाते हैं।', 'devika', 2, 'indic', 44, 'motivation', ['hindi', 'motivation']),
  q(13, 'சின்ன முயற்சியும் பெரிய மாற்றத்தைத் தரும்.', 'arjun_codes', 5, 'indic', 39, 'calm', ['tamil', 'calm']),
];
