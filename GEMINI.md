# QR Aura - Developer Instructions

## Project Intent
To create the most visually stunning and design-accurate QR code generator. The app should feel like a specialized creative tool rather than a generic utility.

## Key Implementation Rules
1. **Strict Preview Isolation**: Styles applied to the QR code (skins, frames) must NEVER leak into the app's main UI.
2. **Deterministic Layouts**: Always use the defined constants for default configurations.
3. **High Contrast Interaction**: In dark mode (default), use `bg-slate-900` for inputs with `text-white` and `primary` accents.
4. **Resilient Export**: Use `html2canvas` with the specific configurations found in `handleExport` and `handleCopy` to maintain design fidelity.
5. **Real-time Feedback**: Every config change must trigger a seamless update in the QR engine and any active skin effects.

## Module Map
- `App.tsx`: State hub and main composition.
- `constants.ts`: Design tokens and semantic defaults.
- `EnhancedUI.tsx`: Custom interactive components with complex hover/active states.
- `types.ts`: Schema for the QR configuration state.
