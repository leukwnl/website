import type { WorldContent, Project, Category } from "../types";

export const PROJECTS: Project[] = [
  {
    id: "proj1",
    name: "RAG Platform",
    desc: "Serverless ingestion + retrieval augmented generation used by 700+ employees.",
    url: "#",
    role: "Toolsmith",
    tags: ["Azure", "Kafka", "RAG"],
    stats: [
      { label: "Latency (p95)", value: "<200ms" },
      { label: "Users", value: "700+" },
      { label: "Uptime", value: "99.9%" },
    ],
    abilities: [
      { label: "Ingestion & Embeddings", detail: "Azure Functions, chunking" },
      { label: "Observability", detail: "Dashboards + logging" },
    ],
    // x,y not required anymore—spawned dynamically by category
    x: 0,
    y: 0,
  },
  {
    id: "proj2",
    name: "Trigger Happy",
    desc: "Multiplayer shooter with predictive aiming + reconciliation.",
    url: "#",
    role: "Netcode",
    tags: ["CUGL", "Prediction", "Rollback-lite"],
    stats: [
      { label: "Client drift", value: "<3 frames" },
      { label: "Tick rate", value: "60 Hz" },
    ],
    abilities: [
      { label: "Prediction", detail: "input buffering + reconciliation" },
      { label: "Perf", detail: "pooling + collision opts" },
    ],
    x: 0,
    y: 0,
  },
  {
    id: "proj3",
    name: "Transit Dashboard",
    desc: "Geospatial filtering + schedule analytics for planners.",
    url: "#",
    role: "Systems Design",
    tags: ["Geo", "Streamlit", "ETL"],
    stats: [
      { label: "Filter latency", value: "<2s" },
      { label: "Datasets", value: "300+ daily reports" },
    ],
    abilities: [
      { label: "ETL", detail: "Python/Docker replatforming" },
      { label: "UX", detail: "schema-driven rendering" },
    ],
    x: 0,
    y: 0,
  },
];

const CATEGORIES: Category[] = [
  {
    id: "cat-systems",
    name: "Systems/Tools",
    x: 6,
    y: 2,
    spawnRadius: 4,
    minSpacing: 2,
    rerollOnStep: false,
    projectIds: ["proj1"],
  },
  {
    id: "cat-netcode",
    name: "Networking",
    x: 2,
    y: 8,
    spawnRadius: 5,
    minSpacing: 3,
    rerollOnStep: false, // step again = toggle off
    projectIds: ["proj2"],
  },
  {
    id: "cat-geo",
    name: "Geo/Analytics",
    x: 9,
    y: 7,
    spawnRadius: 4,
    projectIds: ["proj3"],
  },
];

export const WORLD_CONTENT: WorldContent = {
  obstacles: [
    [5, 5],
    [5, 6],
    [5, 7],
    [6, 7],
    [7, 7],
  ],
  playerStart: [2, 2],
  heroTile: [1, 1], // ← stepping onto this shows your hero panel
  categories: CATEGORIES,
  projects: PROJECTS,
};
