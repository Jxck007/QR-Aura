/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QRConfig } from './types';

export const COLORS = {
  primary: '#00ffcc', // Vibrant Cyan/Aura
  secondary: '#477f88', // Deep Teal
  background: '#020617', // Slate 950 (Premium Dark)
  surface: '#ffffff',
  surfaceContainerLow: '#f1f5f9',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#0f172a',
  onSurfaceVariant: '#64748b',
  outlineVariant: '#cbd5e1',
  error: '#ef4444',
  tertiary: '#f59e0b', // Gold for "Pro" feel
};

export const DEFAULT_CONFIG: QRConfig = {
  content: 'https://qraura.io',
  type: 'url',
  dots: {
    type: 'square',
    color: '#000000',
    gradient: {
      enabled: false,
      type: 'linear',
      color1: '#000000',
      color2: '#00ffcc',
      rotation: 0,
    }
  },
  background: {
    color: '#ffffff',
    transparent: false,
  },
  corners: {
    type: 'square',
    color: '#000000',
  },
  frame: {
    style: 'card', 
    text: 'SCAN ME',
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Space Grotesk',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 40,
    shadowColor: '#00000033',
    shadowIntensity: 0.5,
    padding: 32,
  },
  size: 512,
  margin: 10,
  errorCorrectionLevel: 'H',
  skin: 'none', 
  logo: {
    src: '',
    size: 25,
    margin: 5,
    hideBackgroundDots: true,
  }
};

export const DOT_STYLES = [
  { id: 'square', label: 'Square', icon: 'Square' },
  { id: 'rounded', label: 'Rounded', icon: 'Circle' },
  { id: 'extra-rounded', label: 'Extra Rounded', icon: 'CircleDot' },
  { id: 'dots', label: 'Dots', icon: 'Grid2X2' },
  { id: 'classy', label: 'Diamond', icon: 'Diamond' },
  { id: 'classy-rounded', label: 'Fluid Wave', icon: 'Waves' },
];

export const CORNER_STYLES = [
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Dot' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'extra-rounded', label: 'Extra Rounded' },
];

export const SKINS = [
  { id: 'none', label: 'Basic', icon: 'Square', color: '#f8fafc' },
  { id: 'cherry', label: 'Cherry Blossom', icon: 'Flower2', color: '#ffd1dc' },
  { id: 'wave', label: 'Ocean Wave', icon: 'Waves', color: '#00c6ff' },
  { id: 'aurora', label: 'Aurora Glow', icon: 'Sparkles', color: '#00ffcc' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: 'Zap', color: '#f0f' },
  { id: 'midnight', label: 'Midnight Space', icon: 'Moon', color: '#000000' },
  { id: 'sunset', label: 'Golden Sunset', icon: 'Sun', color: '#ff7e5f' },
  { id: 'forest', label: 'Emerald Forest', icon: 'Trees', color: '#2d5a27' },
];

export const QR_TYPES = [
  { id: 'url', label: 'URL', icon: 'Link' },
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'wifi', label: 'WiFi', icon: 'Wifi' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'phone', label: 'Phone', icon: 'Phone' },
  { id: 'vcard', label: 'Contact', icon: 'User' },
  { id: 'file', label: 'File', icon: 'FileText' },
  { id: 'image', label: 'Image', icon: 'Image' },
];

export const FONT_OPTIONS = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Space Grotesk', label: 'Space Grotesk' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
  { id: 'Playfair Display', label: 'Playfair Display' },
  { id: 'Arial', label: 'Arial' },
];
