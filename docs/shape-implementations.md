# Shape Implementation Details

This document provides a technical overview of how each shape in the portfolio is implemented in the `CubeField` component.

## Sphere (Origin)

The sphere uses a Fibonacci distribution algorithm to place particles evenly across the surface of a sphere. This algorithm generates points that are approximately equally spaced on a sphere, avoiding clustering at the poles that would occur with a simple polar coordinate approach.

```typescript
// Fibonacci sphere distribution
x = scale * Math.cos(theta) * Math.sin(phi);
y = scale * Math.sin(theta) * Math.sin(phi);
z = scale * Math.cos(phi);
```

## Helix (Grad School)

The helix implementation creates a double helix structure reminiscent of DNA, appropriate for the academic research era. It uses parametric equations to generate two intertwined helices with occasional "rungs" connecting them.

```typescript
// Double helix
if (i % 2 === 0) {
  x = radius * Math.cos(helixT);
  z = radius * Math.sin(helixT);
  y = (helixT - Math.PI * 5) * scale / 10;
} else {
  x = radius * Math.cos(helixT + Math.PI);
  z = radius * Math.sin(helixT + Math.PI);
  y = (helixT - Math.PI * 5) * scale / 10;
}
```

## Cube (Apple)

The cube implementation places particles primarily on the shell of a cube to create a minimalist, precise appearance that aligns with Apple's design aesthetic. It preferentially places particles on the faces of the cube.

```typescript
// Cube shell distribution
const face = Math.floor(Math.random() * 6);
switch (face) {
  case 0: x = scale/2; break;
  case 1: x = -scale/2; break;
  case 2: y = scale/2; break;
  case 3: y = -scale/2; break;
  case 4: z = scale/2; break;
  case 5: z = -scale/2; break;
}
```

## Grid (IBM)

The IBM-inspired shape creates three sets of 8 bars (24 total) forming a cube-like structure, reminiscent of IBM's iconic 8-bar logo. The bars are arranged along the X, Y, and Z axes.

```typescript
// Calculate base position based on which bar set and which bar in the set
switch (barSet) {
  case 0: // X-oriented bars (horizontal, varying in Z)
    x = -outerSize/2 + positionInBar * outerSize;
    y = -outerSize/2 + barWithinSet * barSpacing + barSpacing/2;
    z = outerSize/2 - barThickness/2;
    break;
    
  // Additional cases for Y and Z oriented bars
}
```

## Windows (Microsoft)

The Windows shape creates a structure inspired by the Microsoft Windows logo, with particles arranged in four quadrants to form a window-like pattern.

```typescript
// Offset based on quadrant (like Windows logo)
if (quadrant === 1 || quadrant === 3) x += scale * 0.6;
if (quadrant === 2 || quadrant === 3) z += scale * 0.6;
```

## Torus (Meta)

The Meta shape creates a ring/torus structure representing the metaverse concept. It uses standard parametric equations for a torus and adds some particles in the center to suggest connection.

```typescript
// Torus parametric equations
x = (torusR + tubeR * Math.cos(torusV)) * Math.cos(torusU);
z = (torusR + tubeR * Math.cos(torusV)) * Math.sin(torusU);
y = tubeR * Math.sin(torusV);
```

## Möbius Strip (Sleeping Ox)

The Möbius strip creates a single-sided surface with a half-twist, symbolizing infinite possibility. It uses parametric equations for the strip and adds variation in distribution and width for a more organic look.

```typescript
// Möbius strip parametric equations
x = (mobiusR + varyingWidth * mobiusV * Math.cos(mobiusU / 2)) * Math.cos(mobiusU);
z = (mobiusR + varyingWidth * mobiusV * Math.cos(mobiusU / 2)) * Math.sin(mobiusU);
y = varyingWidth * mobiusV * Math.sin(mobiusU / 2);
```

## Wave (Now)

The wave pattern creates a dynamic, fluid surface that represents ongoing work. It uses sine functions to create wave patterns and adds flowing animations for a sense of movement.

```typescript
// Wave function
y = Math.sin(x * 0.5 + z * 0.5) * scale * 0.2;

// Add flowing appearance
if (i % 3 === 0) {
  y += Math.sin(waveT) * scale * 0.1;
}
```

## Transition Animation

All shapes transition smoothly between each other using:

1. **Cubic Bezier Easing**: For natural acceleration and deceleration
2. **Staggered Movement**: Particles start and end their transitions at slightly different times
3. **Arc Motion**: Particles follow curved paths rather than straight lines
4. **Scale Animation**: Subtle scaling during transitions
5. **Rotation Boosts**: Additional rotation during transitions for more dynamic movement

```typescript
// Cubic bezier interpolation
const ease = t < 0.5 
  ? 4 * t * t * t 
  : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Staggered movement
const staggerOffset = (index % 200) / 200 * 0.2;
const staggeredEase = Math.max(0, Math.min(1, (t - staggerOffset) * 1.2));

// Arc motion
const arcHeight = staggerFactor * 0.5;
const arcOffset = Math.sin(staggeredEase * Math.PI) * arcHeight;
position.y += arcOffset * (1 + (index % 5) * 0.1);
``` 