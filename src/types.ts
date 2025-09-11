export type Grid = number[][];

export interface Player {
  x: number;
  y: number;
  path: [number, number][];
}

export interface World {
  grid: Grid;
  player: Player;
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
}
