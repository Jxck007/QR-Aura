/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QRConfig } from './types';

export const COLORS = {
  primary: '#477f88', // Deep Teal
  secondary: '#667b7e', // Mid-Greyish Teal
  background: '#757778', // Base Background
  surface: '#f9f9fb',
  surfaceContainerLow: '#f3f3f5',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#202222',
  onSurfaceVariant: '#8e9090',
  outlineVariant: '#a0a2a2',
  error: '#ba1a1a',
  tertiary: '#673d1b', // For "Pro" features
};

export const DEFAULT_CONFIG: QRConfig = {
  content: 'https://lucidqr.com',
  type: 'url',
  dots: {
    type: 'rounded',
    color: '#ffffff',
    gradient: {
      enabled: false,
      type: 'linear',
      color1: '#ffffff',
      color2: '#477f88',
      rotation: 0,
    }
  },
  background: {
    color: '#ffffff',
    transparent: true,
  },
  corners: {
    type: 'rounded',
    color: '#ffffff',
  },
  frame: {
    style: 'none',
    text: 'SCAN ME',
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter',
  },
  size: 512,
  margin: 10,
  errorCorrectionLevel: 'H',
  skin: 'midnight',
  logo: {
    src: '/logo.png',
    size: 25,
    margin: 10,
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
