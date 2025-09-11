# Trigger Happy — Case Study

> description

## Overview

Trigger Happy is a real-time card shooter designed for phones.

## Goals

- Haptics and readable VFX that scale with device performance

## Highlights

1. **Client prediction + reconciliation** for snappy feel without desyncs

## Technical Breakdown

Networking follows a tick-based model with server-side authority. Clients predict their own movement and fire events, then reconcile on authoritative state. Lag-compensation is applied to hit scan resolution.

## Next Steps

- Playtest notes and telemetry plots