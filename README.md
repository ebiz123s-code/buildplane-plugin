# Buildplane

Buildplane turns a plain-English description of what you want built into a plan you can
read before anything happens — then builds it one step at a time into your Estage project,
with every step proving itself before it counts.

This repository is the **plugin distribution** for [Buildplane](https://ebiz123s.com/apps/buildplane).
It contains the skill, the recipes and the scripts that run on your own computer. There is
nothing to configure here.

## Install

Inside Claude Code:

```
/plugin marketplace add ebiz123s-code/buildplane-plugin
/plugin install buildplane@ebiz123s
```

Then open your dashboard at [ebiz123s.com/apps/buildplane](https://ebiz123s.com/apps/buildplane),
create a licence key, and save it as `{"key":"bl_..."}` in `~/.claude/buildplane/license.json`.

## Use

```
/buildplane plan --project <your project id>
/buildplane next
```

`plan` reads the brief from your dashboard and writes a plan back to it. `next` builds the
next step you queued. You can queue steps with the buttons on the dashboard.

## What runs where

Building happens on your computer, on your own Claude plan — Buildplane never runs the model
for you at this tier, and your Estage access token stays on your machine.

A Buildplane licence is required. See [ebiz123s.com](https://ebiz123s.com/apps/buildplane).
