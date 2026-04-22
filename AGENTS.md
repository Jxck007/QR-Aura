# QR Aura - Project Summary for AI Agent

QR Aura is a premium, high-end QR code generator built with React 18, Vite, and Tailwind CSS. It focuses on design accuracy, visual separation, and a "dark-first" aesthetic.

## Core Architecture
- **Framework**: React (using functional components and hooks).
- **Styling**: Tailwind CSS (mobile-first, responsive, custom utility classes).
- **QR Engine**: `qr-code-styling` for generating vector and raster QR codes.
- **Capture**: `html2canvas` for precise image capture of the styled QR container.
- **Backend**: None (Local-first, using `localStorage` for history).
- **Animations**: `framer-motion` (motion/react) for all transitions and micro-interactions.

## Key Features
- **Advanced Frame Customization**: Modular controls for frame background, border (color, width, radius), padding, and shadows.
- **Skins**: Atmospheric background effects (Cherry Blossom, Aurora, Cyberpunk, etc.) applied strictly inside the QR container.
- **Smart Content Detection**: Automatically detects QR type (URL, Email, WiFi, etc.) from user input.
- **High-Res Export**: PNG (Standard/HD) and SVG (Vector) exports.
- **History System**: Users can save and revisit generated QR codes; saved locally via `localStorage`.

## Design Principles
- **Atmospheric Isolation**: The QR preview exists in a "design layer" independent from the app UI.
- **Interactive Feedback**: Heavy use of hover states, transitions, and typewriter effects.
- **Typography-First**: Uses "Inter" for interface and "Space Grotesk" for branding.

## File Organization
- `src/App.tsx`: Main logic, state management, and primary UI layout.
- `src/components/EnhancedUI.tsx`: Reusable design-focused components (ConicButton, SmoothTabs, InputGroup).
- `src/constants.ts`: Default configuration, type options, colors, and font lists.
- `src/types.ts`: TypeScript interfaces for the application configuration.
- `src/lib/utils.ts`: Tailwind class merger utility.
