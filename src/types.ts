export type Grid = number[][];

export interface Stat {
  label: string;
  value: string;
}
export interface Ability {
  label: string;
  detail?: string;
}

export interface Project {
  id: string;
  name: string;
  desc: string;
  url: string;
  x: number; // grid coords
  y: number;
  role?: string; // e.g., "Toolsmith", "Netcode"
  tags?: string[]; // e.g., ["RAG","Azure","Kafka"]
  company?: string;
  location?: string;
  date?: string;
}

export interface Player {
  x: number;
  y: number;
  path: [number, number][];
}

export interface Config {
  cols: number;
  rows: number;
  tileW: number;
  tileH: number;
  camOffsetX: number;
  camOffsetY: number;
}

export interface WorldContent {
  obstacles: [number, number][];
  playerStart: [number, number];
  heroTile: [number, number];
  categories: Category[];
  projects: Project[];
}

export interface Camera {
  x: number; // pixel offset from centered origin (screen space)
  y: number; // pixel offset from baseline origin (screen space)
  scale: number; // zoom factor (1 = 100%)
}

export interface Category {
  id: string;
  name: string;
  x: number;
  y: number;
  projectIds: string[];
  spawnRadius?: number;
  minSpacing?: number;
  rerollOnStep?: boolean;
}

export interface SpawnedMap {
  [projectId: string]: { x: number; y: number };
}

export interface World {
  grid: Grid;
  player: Player;
  projects: Project[];
  categories: Category[];
  heroTile: [number, number];
  activeCategoryId: string | null;
  spawned: SpawnedMap; // dynamic enemy positions when a category is active
}
