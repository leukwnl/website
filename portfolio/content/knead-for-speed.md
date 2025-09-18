# Case Study

> This case study is a living write-up. It mirrors the Trigger Happy page structure and will evolve as I add diagrams, captures, and notes.

## Overview

Knead for Speed is a top-down stealth-puzzler made with Java/LibGDX. You play as a cookie trying to escape a bakery—slipping past patrolling bakers, noisy floor tiles, and scent cones.

## Goals

- Tight stealth core with readable telegraphs and fair fail states
- Rapid iteration on levels via data-driven definitions
- Lightweight art pipeline compatible with a tiny team

## Highlights

1. Patrol + vision cone system with line-of-sight occlusion
2. Sound propagation and "scent" hints to teach stealth affordances
3. Tiled-map–based level authoring; hot-reload during development

## Design Notes

- Pacing alternates between route-planning and quick execution bursts
- Failures communicate cause: last-seen marker, sound ping, and cone flash

## Technical Breakdown

- Engine: LibGDX; desktop target build
- Level data: Tiled JSON with custom layer tags
- Systems: ECS-lite, deterministic update tick, fixed-step physics

## Next Steps

- Add short GIF captures to illustrate guard cones and sound pings
- Write mini postmortem on tutorialization and late-scope cuts

