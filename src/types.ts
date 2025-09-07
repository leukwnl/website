export type Grid = number[][];
export interface Player {
  x: number;
  y: number;
  path: [number, number][];
}

export interface Project {
  id: string;
  slug: string; // for /:slug routing
  name: string;
  summary?: string; // 1-2 lines for card
  desc?: string; // longer body
  role?: string;
  company?: string;
  location?: string;
  date?: string;
  url?: string;
  tags?: string[];
  heroImage?: string;
}

export interface Category {
  id: string;
  name: string;
  projectIds: string[];
  x: number;
  y: number; // anchor on grid
  spawnRadius?: number;
  minSpacing?: number;
  rerollOnStep?: boolean;
}

export interface World {
  grid: Grid;
  player: Player;
  projects: Project[];
  categories: Category[];
  heroTile: [number, number];
  npcs: NPC[];
  interactables: Interactable[];
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export type WorldContent = Partial<
  Pick<World, "grid" | "projects" | "categories" | "heroTile">
>;

export interface AboutContent {
  title: string;
  photoUrl: string;
  html?: string; // optional preformatted HTML
  paragraphs?: string[]; // or plain paragraphs
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
  icon?: string;
}

export interface Interactable {
  id: string;
  name: string;
  x: number;
  y: number;
  kind: "sign" | "bench" | "door" | "object";
  text?: string;
  icon?: string;
}

export interface PinLayoutEntry {
  id: string; // project id
  x: number; // px from left
  y: number; // px from top
  rot?: number; // degrees
  w?: number; // optional width in px
  h?: number; // optional height in px
}
