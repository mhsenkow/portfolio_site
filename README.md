# I Build Machines - A 3D Particle-Based Portfolio

An immersive, interactive 3D portfolio that visualizes a designer's career journey through dynamic particle formations. As users navigate through different eras via a timeline, thousands of particles transform smoothly between themed shapes, creating a narrative experience.

![I Build Machines Portfolio](./docs/portfolio-preview.png)

## Features

- **Dynamic 3D Particle Visualizations**: Thousands of individual particles that form different shapes for each career era
- **Smooth Transitions**: Particles morph organically between shapes with custom easing and staggered movements
- **Interactive Timeline**: Scrub through different career eras with buttons and a slider control
- **Responsive Design**: Adapts to different screen sizes while maintaining performance
- **Interactive Controls**: Click and drag to explore the 3D space from different angles
- **Thematic Styling**: Each era has its own color scheme, camera angle, and atmosphere

## Era Shapes

Each career era is represented by a unique particle formation:

- **Origin**: Sphere - representing the beginning point
- **Grad School**: Double Helix - representing academic research
- **Apple**: Cube - representing minimalist design
- **IBM**: 8-Bar Logo Structure - representing IBM's iconic design
- **Microsoft**: Windows Layout - inspired by the Windows logo
- **Meta**: Torus Ring - representing the metaverse concept
- **Sleeping Ox**: Möbius Strip - representing infinite possibility
- **Now**: Wave Pattern - representing dynamic, fluid work

## Technical Implementation

### Core Technologies

- **React & Next.js**: Frontend framework and rendering
- **Three.js (via @react-three/fiber)**: 3D rendering
- **@react-three/drei**: Helper components for Three.js
- **InstancedMesh**: For efficient rendering of thousands of particles
- **GSAP**: Smooth animations and transitions
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Styling and responsive design

### Architecture

The application is built with a component-based architecture:

```
src/
├── app/                # Next.js app router
│   ├── page.tsx        # Main portfolio page
│   └── layout.tsx      # Root layout with metadata
├── components/         # React components
│   ├── CubeField.tsx   # 3D particle field renderer
│   ├── TimelineControl.tsx # Timeline UI and controls
│   ├── CameraController.tsx # Camera transition handler
│   └── GhostNarrative.tsx  # Floating narrative text
├── data/               # Data files
│   ├── eras.json       # Career timeline and visual settings
│   └── eras-schema.md  # Documentation for data structure
└── store/              # State management
    └── eraStore.ts     # Zustand store for era state
```

### Performance Considerations

- **InstancedMesh**: Used for efficient rendering of thousands of cubes with a single draw call
- **Optimized Transitions**: Calculated only when era changes
- **Progressive Staggering**: Particles transition in waves to distribute computation
- **Memory Management**: Proper cleanup of animations and event listeners

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customization

You can modify the career eras and their visual properties by editing the `src/data/eras.json` file. Each era has properties for:

- Time period and narrative text
- Camera position
- Color schemes
- Particle behavior
- Shape type and scale

See `src/data/eras-schema.md` for detailed documentation of all properties.

## Credits

This project combines 3D visualization techniques with narrative storytelling to create an immersive portfolio experience. It draws inspiration from data visualization, generative art, and interactive storytelling.

## License

MIT 