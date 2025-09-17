# Case Study


>This case study is split up into 3 sections, diving deep into game design, UX design and engineering respectively. I recommend reading the whole thing, but the **Contents** on the left lets you jump to wherever you like!


## Overview

Trigger Happy is a six-player, real-time, deck-based mobile card game, inspired by (link)Bang! and the schoolyard game, (link)War or 007. Players draw cards and take actions on a timer, to shoot and steal their way through a rapid-fire showdown in a feral 1920s Chicago. We won Audience Favorite at the Game Design Initiative at Cornell (GDIAC) Annual Showcase.

You can download the game here:

(image) (image)

I was UX Lead & Programmer, and wore whatever hats were needed to ship, which included: music, storyboarding and technical writing. The game was built with nine other talented folks:

Amber Min, Caroline Hohner, Elaine Ran, Ireanne Cao, Jacob Seto, Linda Hu, Pedro Pontes García, Phoebe An and Shirley Li. 

Some of whom I've come to still make games with till this day.

## Goals

We had 12 weeks to showcase, and had that time to ship the mobile party game. I was particularly interested in pushing netcode and designing multiplayer gameplay, but the platform itself proved to be a challenge to work with. Limited screen real-estate, led to some unique and new opportunities that we'll talk about below. The target audience we chose were casual players, emphasizing the frictionless pick-up-and-play, and freshness over multiple sessions.

## Highlights

1. Card ecosystem & decks. I balanced resources and defined deck archetypes so players can express themselves without slowing the tempo.
2. Mobile UI. Designing intuitive, immersive, touch-first interfaces that respect information hierarchy under tight space.
3. Engineering. A haptics library for Cornell’s in-house engine (CUGL) and a lightweight networking controller to support real-time play.

## Game Design

### The Game
To reiterate,*Trigger Happy* is a multiplayer card game for 4-6 players. Each player starts with 5 hearts (health) and 3 ammo. During the Turn Phase, the player draws in hands of 4 cards from a 12-card deck, and plays one card per round on an accelerating timer. Each turn, the player can choose to redraw their entire hand, or exhaust all cards and redraw 4 new cards for their hand. Card actions play out in the Action Phase, and hits convert to damage at the end of the round. The last player standing wins.

We wanted to build a fast and chaotic party game, such that while it is easy to pick up and play, it still gave players meaningful choices every round. In particular, we wanted a system where:

- No strategy dominates
- Every card has a fair cost
- The player's strategy determines their survival
- Each match accelerates naturally to not leave dead players idle for long.

Paying special attention to the last point above, this meant that we do not have any heal, or net-neutral stalls in the game; every card should push state toward resolution (or shift advantage).

### Card Design and Balance
#### Interaction Schema
At the heart of *Trigger Happy* is a Rock-Paper-Scissors inspired loop:
- Applier (Rock) Cards that apply hits (e.g. Shoot, Split Shot). These are proactive, aggressive plays.
- Negator (Paper) Cards that disrupt events and actions (e.g. Steal, Reflect). These defend against aggression.
- Resource (Scissors) Cards that build future advantage (Reload, Dark Deal). These take advantage of other players' inaction to ramp and fuel bigger plays later.

This schema is intended to ensure **no single strategy dominates**. Instead, players must each adapt to the situation and playstyles of their enemies: aggression is punished by defense, defense is outpaced by greed, and greed is crushed by aggression.

We further enforce the deterministic outcomes of our schema with **Speed tiers**, which determine the resolution order of actions:
- Speed I: Pre-emptive plays like Steal
- Speed II: Mainline plays like Shoot, Split Shot, and Dark Deal
- Speed III: Reactive plays like Reflect.

Spelling these priorities out and tutorializing them were key to helping players understand and formulate strategy, as well as feel the impact of their choices, given that they always know exactly what beats what, and how they can move into an advantage state based on an enemy player's deck and playstyle.

#### Balance Levers

Two major levers kept this schema fair and interesting, and allowed the game to keep pushing forward without devolving into clear winning strategies. At a high level, intransitive mechanics are about who beats who (interaction patterns, like Rock–Paper–Scissors), while transitive mechanics are about how much something is worth (cost/benefit comparisons along a shared baseline).

**First, intransitive balance (interaction based):**  This refers to the interaction schema we outlined prior. Having a clear definition of what beats what, helps us prevent dominant strategies by ensuring every play has a counter. This was incredibly useful for designing at the strategy layer, especially when we were defining **deck archetypes**. 

**Second, transitive balance (cost/benefit-based):** Each card effect/action is measured against a baseline: 1 ammo ≈ 1 hit ≈ 1 health lost, with risk/negation variance around that baseline. This means that stronger effects must carry heavier costs, which can manifest in different ways such as a different ammo spend, losing card advantage through discard or being a dead card in some situations. In contrast to the intransitive lever, this helped with designing at the individual card layer through having a shared baseline to compare to, and a power-budget for each card to work with.


### Resources and Economy
Next, a brief outline of economy. There are two explicit resources, which are *Ammo* and *Health*. *Ammo* is the only currency that has a straightforward conversion to damage (via Shoot/Split Shot); *Health* represents the loss condition, and all systems ultimately reference progress against it. All effects and actions relate back to *Health* as a central value, and thus we can compare effects on a common scale. Finally, there is the implicit resource, *Cards in Hand*, which is the player's action bandwidth going into the round. This means that choosing when to discard or redraw cards to cycle through the deck may benefit or hurt a player's tempo and future-value.

### Decks

## User Experience

### Designing for Touch

## Engineering

### Networking

### Haptics

## Concepts

## Trigger Happy v2
