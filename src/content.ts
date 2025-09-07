import type {
  Project,
  Category,
  WorldContent,
  AboutContent,
  NPC,
  Interactable,
  PinLayoutEntry,
} from "./types";

export const PROJECTS: Project[] = [
  {
    id: "trigger-happy",
    slug: "trigger-happy",
    name: "Trigger Happy",
    summary: "CUGL-based cross-platform multiplayer with predictive aiming.",
    desc: "Built networking, predictive aiming, and spline movement; stress-tested for runtime stability; showcased internal playtests.",
    role: "Lead Systems",
    tags: ["C++", "Networking", "Gameplay"],
    date: "2024–2025",
    url: "https://lukeleh.com/trigger-happy",
  },
  {
    id: "setel-copilot",
    slug: "setel-copilot",
    name: "Setel Copilot (RAG)",
    summary: "Prod-grade RAG platform with Azure Functions & Cognitive Search.",
    desc: "Designed serverless ingestion + embeddings, <200ms p95 latency via caching/observability; used by 700+ employees.",
    role: "Platform Eng",
    tags: ["Azure", "RAG", "Python", "Kafka"],
    date: "2025",
    url: "https://lukeleh.com/setel-copilot",
  },
  {
    id: "loop",
    slug: "loop",
    name: "Loop",
    summary: "Unity prototype with yarn-trail physics & enemy AI.",
    desc: "2D/3D top-down gameplay with physics trails; modular enemy behaviors; rapid iteration tools.",
    role: "Gameplay",
    tags: ["Unity", "C#", "AI"],
    date: "2024",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "projects",
    name: "Projects",
    projectIds: ["setel-copilot"],
    x: 6,
    y: 4,
    spawnRadius: 4,
    minSpacing: 2,
  },
  {
    id: "games",
    name: "Games",
    projectIds: ["trigger-happy", "loop"],
    x: 9,
    y: 8,
    spawnRadius: 4,
    minSpacing: 2,
  },
  {
    id: "experience",
    name: "Experience",
    projectIds: [],
    x: 12,
    y: 4,
    spawnRadius: 3,
    minSpacing: 2,
  },
];

export const WORLD_CONTENT: WorldContent = {
  projects: PROJECTS,
  categories: CATEGORIES,
  heroTile: [3, 3],
};

export const ABOUT: AboutContent = {
  title: "Who's Luke",
  photoUrl: "https://picsum.photos/seed/luke/420/560",
  paragraphs: [
    "I build stages where collaborators improvise in real time.",
    "Focus: real-time multiplayer, gameplay tools, systems design.",
    "Stack: Unity/CUGL, TypeScript, Python, Azure, Kafka.",
  ],
};

export const NPCS: NPC[] = [
  {
    id: "guide",
    name: "Friendly Guide",
    x: 5,
    y: 5,
    lines: [
      "Welcome! Step on a category tile to preview its goodies.",
      "Click the hero to open the About panel.",
    ],
  },
  {
    id: "dev",
    name: "Dev NPC",
    x: 10,
    y: 3,
    lines: ["I'm here to test dialogue trees.", "Come back later for more."],
  },
];

export const INTERACTABLES: Interactable[] = [
  {
    id: "sign-1",
    name: "Signpost",
    x: 4,
    y: 7,
    kind: "sign",
    text: "Projects →",
  },
  {
    id: "bench-1",
    name: "Bench",
    x: 8,
    y: 8,
    kind: "bench",
    text: "Take a rest.",
  },
];

// Optional: pin-board layouts per category id
export const PIN_LAYOUTS: Record<string, PinLayoutEntry[]> = {
  projects: [{ id: "setel-copilot", x: 20, y: 10, rot: -2.5 }],
  games: [
    { id: "trigger-happy", x: 0, y: 0, rot: 1.5 },
    { id: "loop", x: 240, y: 40, rot: -3 },
  ],
  experience: [],
};
