# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Observable Plot is a JavaScript library for exploratory data visualization built on D3. It follows a "grammar of graphics" approach with scales and layered marks. The library is distributed as `@observablehq/plot` on npm.

## Development Commands

### Core Development

- `yarn test` - Run complete test suite (mocha, TypeScript, ESLint, Prettier)
- `yarn test:mocha` - Run only Mocha unit tests
- `yarn test:coverage` - Generate test coverage report with c8

### Build and Distribution

- `yarn prepublishOnly` - Build distribution files in `dist/` (UMD bundles)
- `rollup -c` - Manual build using Rollup configuration

### Code Quality

- `yarn test:lint` - Run ESLint
- `yarn test:prettier` - Check Prettier formatting
- `yarn prettier --write .` - Format code with Prettier
- `yarn test:tsc` - TypeScript type checking

### Testing Individual Files

```bash
yarn run mocha --conditions=mocha --parallel --watch test/marks/bar-test.js
```

## Architecture Overview

### Core Components

**Marks** (`src/marks/`): Visual primitives that render data

- Base class: `Mark` in `src/mark.js`
- 22+ mark types: area, bar, line, dot, text, geo, contour, etc.
- Lifecycle: `initialize()` → `filter()` → `scale()` → `render()`

**Scales** (`src/scales/`): Map data values to visual properties

- Registry in `src/scales/index.js` manages available scale types
- Auto-scaling with domain and range inference
- Scale functions created by `createScaleFunctions()`

**Transforms** (`src/transforms/`): Data transformations applied before rendering

- Basic: filter, sort, reverse, shuffle
- Statistical: bin, group, stack, window, normalize
- Spatial: dodge, hexbin, centroid
- Advanced: repel, tree operations

**Channels** (`src/channel.js`): Bind data fields to visual properties (x, y, color, size)

### Rendering Pipeline

1. Mark processing and flattening
2. Faceting (small multiples)
3. Channel collection from marks
4. Scale creation based on channels
5. Mark initialization with facet/channel info
6. Scale finalization and auto-scaling
7. Value computation with scales/projections
8. SVG rendering with faceting
9. Legend generation

## Testing Strategy

### Unit Tests

- Location: `test/*-test.js` files
- Framework: Mocha
- Focus: Specific API behavior and helper methods

### Snapshot Tests

- Location: `test/plots/*.ts` files
- Registry: `test/plots/index.ts`
- Expected SVG/HTML output in `test/output/`
- Deterministic: Use seeded random generators (e.g., `d3.randomLcg`)

### Adding New Snapshot Tests

1. Create new file in `test/plots/`
2. Export function from `test/plots/index.ts`
3. Run tests to generate snapshots
4. Use `git add` for new snapshots

### Regenerating Snapshots

```bash
rm -rf test/output
yarn test
```

## File Structure

```
src/
├── index.js              # Main exports
├── plot.js               # Core plot() function
├── mark.js               # Base Mark class
├── channel.js            # Channel system
├── scales.js & scales/   # Scale system
├── marks/                # Mark implementations
├── transforms/           # Data transformations
├── interactions/         # Interaction handlers
└── legends/              # Legend generation

test/
├── plots/                # Snapshot tests
├── data/                 # Test datasets
├── output/               # Generated snapshots
└── *-test.js             # Unit tests
```

## Key Dependencies

- **d3** (v7.9.0): Core dependency for visualization primitives
- **interval-tree-1d**: Spatial data structures
- **isoformat**: Date formatting

## Development Workflow

1. Use `yarn dev` for live development with visual feedback
2. Write unit tests for API changes
3. Add snapshot tests for visual features
4. Run `yarn test` before committing
5. Format code with Prettier
6. Update TypeScript definitions in `.d.ts` files
7. Consider updating documentation and CHANGELOG.md

## Architecture Patterns

- **Grammar of Graphics**: Layered marks with shared scales
- **Channel-Scale Architecture**: Automatic scale creation from data mappings
- **Transform Pipeline**: Composable data transformations
- **Extensible Design**: Clear base classes for new mark types
