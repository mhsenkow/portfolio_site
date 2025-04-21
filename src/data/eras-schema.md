# Era Data Schema

This document outlines the structure and properties of the era data used in the portfolio visualization.

## Overview

Each object in the `eras.json` array represents a career era with specific properties that control how it appears in the visualization.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the era |
| `name` | string | Display name shown in the timeline |
| `year` | string | Time period text |
| `cameraPos` | [number, number, number] | 3D camera position [x, y, z] |
| `bgColor` | string | Background color in hex format |
| `fogDensity` | number | Density of fog effect (0-1) |
| `cubeColor` | string | Color of particle cubes in hex format |
| `noiseFactor` | number | How much noise affects particle movement |
| `noiseSpeed` | number | Speed of particle movement |
| `narrative` | string | Text description of the era |
| `shape` | string | 3D shape formation pattern |
| `shapeScale` | number | Size scale of the shape formation |

## Shape Types

The following shape types are supported:

- `sphere` - Particles form a spherical shape
- `helix` - Particles form a double helix (DNA-like) structure
- `cube` - Particles form a cube with concentration on edges
- `grid` - Particles form an IBM-inspired 8-bar logo structure
- `windows` - Particles form a Microsoft Windows-inspired layout
- `torus` - Particles form a ring/torus (Meta/Metaverse)
- `mobius` - Particles form a Möbius strip (Sleeping Ox)
- `wave` - Particles form a dynamic wave pattern (Now)

## Example

```json
{
  "id": "example",
  "name": "Example Era",
  "year": "20XX-20XX",
  "cameraPos": [0, 5, 10],
  "bgColor": "#123456",
  "fogDensity": 0.02,
  "cubeColor": "#ABCDEF",
  "noiseFactor": 1.0,
  "noiseSpeed": 0.2,
  "narrative": "This is an example narrative text",
  "shape": "sphere",
  "shapeScale": 8
}
``` 