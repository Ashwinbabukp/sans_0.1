export interface Theme { name: string; bg: string; fg: string; solid: string; stops?: [string, string] }

export const THEMES: Theme[] = [
  { name: 'Lavender', bg: '#DCD6F7', fg: '#2D2552', solid: '#DCD6F7' },
  { name: 'Mint', bg: '#CDEBDD', fg: '#17382C', solid: '#CDEBDD' },
  { name: 'Peach', bg: '#FADDC9', fg: '#4A2A12', solid: '#FADDC9' },
  { name: 'Rose', bg: '#F7D0DB', fg: '#4A1626', solid: '#F7D0DB' },
  { name: 'Sky', bg: '#CFE4F8', fg: '#12304D', solid: '#CFE4F8' },
  { name: 'Butter', bg: '#F8F0C2', fg: '#3F3606', solid: '#F8F0C2' },
  { name: 'Sage', bg: '#DDE8C9', fg: '#2B3A14', solid: '#DDE8C9' },
  { name: 'Dreamy', bg: 'linear-gradient(135deg,#F7D0DB,#DCD6F7)', fg: '#3A2250', solid: '#EBD3EA', stops: ['#F7D0DB', '#DCD6F7'] },
  { name: 'Sunrise', bg: 'linear-gradient(160deg,#FADDC9,#F8F0C2)', fg: '#4A2A12', solid: '#F9E6C6', stops: ['#FADDC9', '#F8F0C2'] },
  { name: 'Lagoon', bg: 'linear-gradient(160deg,#CFE4F8,#CDEBDD)', fg: '#12304D', solid: '#CEEAE6', stops: ['#CFE4F8', '#CDEBDD'] },
  { name: 'Orchid', bg: 'linear-gradient(135deg,#DCD6F7,#CFE4F8)', fg: '#2D2552', solid: '#D5DDF8', stops: ['#DCD6F7', '#CFE4F8'] },
];
