
export interface GameHistory {
  guess: number;
  hint: string;
  timestamp: number;
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  INITIAL = 'INITIAL'
}
