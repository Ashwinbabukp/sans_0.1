import type { FontKey, Mood, Quote } from './types';

const q = (
  id: number, text: string, author: string, theme: number, font: FontKey, likes: number,
  mood: Mood, tags: string[], extra: Partial<Quote> = {},
): Quote => ({
  id: String(id), text, author, theme, font, likes, mood, tags, liked: false, collection: null,
  align: 'left', size: 'm', textColor: 'auto', sticker: null, comments: [], ...extra,
});

export const SEED_QUOTES: Quote[] = [
  q(1, 'GOOD THINGS TAKE TIME', 'sunny.days', 1, 'poster', 1240, 'calm', ['goodthings', 'vibes', 'patience'], {
    sticker: 'cat',
    comments: [
      { id: 'c1', author: 'meera.writes', text: 'This is my daily reminder ☕' },
      { id: 'c2', author: 'arjun_codes', text: 'Patience always pays off.' },
      { id: 'c3', author: 'sana.k', text: 'Small words, big vibes ✨' },
    ],
  }),
  q(2, 'Start before you feel ready. Ready is a story we tell ourselves.', 'meera.writes', 0, 'serif', 128, 'motivation', ['startnow', 'motivation'], {
    comments: [
      { id: 'c4', author: 'arjun_codes', text: 'Needed this today.' },
      { id: 'c5', author: 'sana.k', text: 'Saving this one 🤍' },
    ],
  }),
  q(3, 'Slow progress is still progress.', 'arjun_codes', 1, 'poster', 342, 'motivation', ['motivation', 'progress']),
  q(4, 'The best view comes after the hardest climb, so keep walking.', 'nadiya', 7, 'type', 87, 'motivation', ['keepwalking', 'motivation']),
  q(5, 'Be soft in a world that rewards sharp edges.', 'sana.k', 6, 'script', 215, 'calm', ['softness', 'calm'], { align: 'center' }),
  q(6, 'Nobody remembers the bugs you fixed quietly at 2 a.m.', 'devika', 4, 'marker', 410, 'funny', ['devlife', 'funny'], {
    comments: [{ id: 'c6', author: 'meera.writes', text: 'So true 😂' }],
  }),
  q(7, 'Write the sentence you’re afraid of first.', 'meera.writes', 3, 'serif', 64, 'motivation', ['writing', 'motivation']),
  q(8, 'Tea first. Then the world.', 'meera.writes', 2, 'hand', 151, 'calm', ['tea', 'calm']),
  q(9, 'Small joys count too.', 'meera.writes', 1, 'round', 98, 'love', ['gratitude', 'joy']),
  q(10, 'Let the quiet days teach you.', 'meera.writes', 0, 'elegant', 73, 'calm', ['calm', 'life'], { align: 'center' }),
  q(11, 'You are allowed to bloom late.', 'meera.writes', 9, 'hand', 233, 'love', ['selflove', 'life']),
  q(12, 'തുടങ്ങാൻ ഒരു ചെറിയ ചുവട് മതി.', 'nadiya', 0, 'indic', 56, 'motivation', ['malayalam', 'motivation']),
  q(13, 'छोटे कदम भी मंज़िल तक पहुँचाते हैं।', 'devika', 2, 'indic', 44, 'motivation', ['hindi', 'motivation']),
  q(14, 'சின்ன முயற்சியும் பெரிய மாற்றத்தைத் தரும்.', 'arjun_codes', 3, 'indic', 39, 'calm', ['tamil', 'calm']),
];
