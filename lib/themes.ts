export interface Theme {
  name: string;
  bg: string;
  fg: string;
  solid: string;
  stops?: [string, string];
}

export const THEMES: Theme[] = [
  // Signature Cobalt & Cream Palette (Cool Cats Aesthetic)
  { name: 'Cobalt', bg: '#052BA8', fg: '#FAF5EE', solid: '#052BA8' },
  { name: 'Vanilla Cream', bg: '#FAF4EB', fg: '#052BA8', solid: '#FAF4EB' },
  { name: 'Matcha', bg: '#DFE8D3', fg: '#1C3520', solid: '#DFE8D3' },
  { name: 'Terracotta', bg: '#F5D3C4', fg: '#4A1D0E', solid: '#F5D3C4' },
  { name: 'Buttercup', bg: '#FBF0B9', fg: '#3B3004', solid: '#FBF0B9' },
  { name: 'Sky Paper', bg: '#D6E6F8', fg: '#092A54', solid: '#D6E6F8' },
  { name: 'Berry Rose', bg: '#F7D4DD', fg: '#451020', solid: '#F7D4DD' },
  {
    name: 'Electric Cobalt',
    bg: 'linear-gradient(145deg, #052BA8, #1848D6)',
    fg: '#FAF5EE',
    solid: '#052BA8',
    stops: ['#052BA8', '#1848D6'],
  },
  {
    name: 'Warm Paper',
    bg: 'linear-gradient(145deg, #FAF4EB, #EFE4D2)',
    fg: '#052BA8',
    solid: '#FAF4EB',
    stops: ['#FAF4EB', '#EFE4D2'],
  },
  {
    name: 'Sunset Haze',
    bg: 'linear-gradient(150deg, #F5D3C4, #FBF0B9)',
    fg: '#421C06',
    solid: '#F8E2BE',
    stops: ['#F5D3C4', '#FBF0B9'],
  },
  {
    name: 'Oasis Mint',
    bg: 'linear-gradient(150deg, #D6E6F8, #DFE8D3)',
    fg: '#0A314D',
    solid: '#DBE7E6',
    stops: ['#D6E6F8', '#DFE8D3'],
  },
];
