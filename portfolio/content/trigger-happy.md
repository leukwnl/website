# Case Study


>This case study is split up into 3 sections, diving deep into game design, UX design and engineering respectively. I recommend reading the whole thing, but the **Contents** on the left lets you jump to wherever you like!


## Overview

Trigger Happy is a six-player, real-time, deck-based mobile card game, inspired by (link)Bang! and the schoolyard game, (link)War or 007. Players draw cards and take actions on a timer, to shoot and steal their way through a rapid-fire showdown in a feral 1920s Chicago. We won Audience Favorite at the Game Design Initiative at Cornell (GDIAC) Annual Showcase.

I was UX Lead & Programmer, and wore whatever hats were needed to ship, which included: music, storyboarding and technical writing. 

The game was built with nine other talented folks, some of whom I've come to still make games with till this day:

<figure>
  <img src="/public/images/th/th-team.jpg"
       alt="Lovely people"
       loading="lazy"
       style="width:50%; max-width:480px; height:auto; display:block; margin:0 auto;" />
  <figcaption>Left to Right:
  Elaine Ran, Shirley Li, Ireanne Cao, Jacob Seto, Caroline Hohner, Pedro Pontes García, Phoebe An, Luke Leh, Amber Min, Linda Hu</figcaption>
</figure>

You can download the game here:

<figure>
  <img src="/public/images/th/links.png" alt="Trigger Happy overview diagram" loading="lazy" />
</figure>

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

<figure>
  <img src="/public/images/th/triangle.png" alt="Card Intransitive Interation Loop" loading="lazy" />
  <figcaption>Figure 1. The core intransitive relationship of cards.</figcaption>
</figure>

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

### Design Challenges
#### Challenge 1: Reloads Stalling the Game

Reload, in its original form, consumed turns without interaction. Players hated drawing it, but without it the ammo supply dried up. This created two degenerate states:

- Endless **Steal loops** where bullets just circulated between players.
- **Dead turns** where players stalled instead of progressing the game.

On average, fewer than half the players took damage each round, breaking our goal of **monotonic pacing** (games accelerating naturally toward an end).

We tried two designs to remedy this. First, a **free reload each round** that gave everyone +1 ammo automatically. We quickly found that this didn't work, as it removed all tension from the game; everyone always had ammo, making Steal irrelevant. Next, we tried a **partial reload** such that discarding a card gain 1 ammo. This was also tested briefly, but often would slow down tempo as well and cluttered decision making as players would lose card/action economy.

Finally, we landed on a balanced solution. Players would **auto reload on hand exhaustion**, where finishing all 4 cards in hand refreshed your hand and gave you 1 ammo. This really rewarded proactive play, and removed the "dead turn" problem.

At the same time, players also had the option of a **voluntary redraw**, which would skip the player's action, rendering them vulnerable to attacks, but allows the player to redraw 4 new cards and +1 ammo, essentially paying a visible tempo cost to secure future agency.

These changes immediately showed positive results. Observing play testers, games finished faster and stopped dragging, and there were fewer "brick" turns where no players lost health, and more visible damage earlier. Often times, disadvantaged players would use redraw/auto-reload as comeback tool instead of giving up. 

The pacing finally matched the game's party game feel, with early and midgame favoring aggression over stalling. Naturally, this also solved the resource scarcity problem in the game, and made steal a much more situational card rather than a toxic staple in the meta.

#### Challenge 2: Nerfing Reflect and Rationing Its Presence

*Reflect* was designed as the defensive counter in our Rock-Paper-Scissors loop. In its original rendition, *Reflect* let players:

- Choose which opponent to bounce a shot back to
- Negate all damage in a given round, and worked against multiple attackers

Aggression became really unattractive, because why risk shooting if Reflect could punish you harder than you attacked? This version of *Reflect* essentially invalidated all form of aggression. Players would sit safely behind *Reflects*, knowing that they could neutralize and stall out any attack, and punish once an enemy runs out of bullets. Players who had aggressive decks and games became draggy due to turtling.

We noticed a few things from our initial playtesting. *Reflect* based decks were chosen by almost all players after the first match of playing our game. Next, games with multiple Reflect based decks would actually dominate and win most games they were in, with the most degenerate case being a deck consisting of 8 reflects, 3 reloads, and 1 shoot winning quite often. 

Indeed, thinking of what Reflect in its current state does, it replaces *Shoot* in the Rock-Paper-Scissors loop, by essentially allowing a player to apply damage without the downside of vulnerability. With enough bullets flying around in the early game, *Reflect* becomes a dominant strategy. In games where majority of players have reflect in their hand, the Nash equilibrium was that *everyone plays Reflect*.

We tested a few variations of reflect:

- Reflect v1 had Universal bounce towards any number of attackers with the free choice of target. This proved to be too powerful and warped the meta around defense.
- Reflect v2 was limited to returning damage to an attacker without a player-chosen target. This unfortunately still felt unfair as attackers couldn’t predict who would get punished when race conditions happened (two players attacking the same enemy).
- Reflect v3 (final) worked as so: if hit by **exactly 1 bullet**, cancel it and bounce it **back at the shooter**. This meant that attackers could now “play around” Reflect by coordinating multiple shots or by baiting. If hit by more, reflect fails.

These changes made aggression viable again, and reflect no longer serves as a universal "get out of jail free" card, and defensive strategies still had a role but no longer dominated all beats of a game.

### Payoff: Power Curves

Before the fixes to Reload and Reflect, we often received feedback that it didn’t feel like player choices mattered much—winning or losing seemed largely dependent on RNG. The first few rounds felt exactly like the last, where defensive cards were spammed and aggression rarely paid off. Eliminations on the other hand, came down to random focus fire, especially towards the first 3 players, as they were often by default the first enemies shown on screen. Without a shifting balance of power over time, matches stalled and felt flat.

But once we solved Reload and Reflect, we realized we had also carved out distinct phases of play. The Reload redesign ensured ammo flow and kept offense viable across the whole game. The Reflect nerf meant defense was strongest in volatile early rounds with many players, but its utility tapered into more of a mind game during duels. We also added a 1-damage-per-round cap that helped stop early dogpiling.

Together, these changes produced a clear power curve:

- Early game was about survival, where negator cards were stronger. Balancing that with bursts of aggression was key for players to thin out the crowd.
- Mid game resource spikes like *Dark Deal* paid off, as the ability to ramp quickly during an enemy's ammo downtime was crucial.
- Late game allowed space for Appliers (*Shoot*, *Split Shot*) to dominate as there was less space and opportunity to go for ramping plays with resource cards. The negator cards also shifted into situational reads instead of universal defenses.

This curve gave matches a sense of escalation and climax, which aligned with our design goals, rather than the flat, repetitive pacing we started with.