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
  content: 'https://qube.example',
  type: 'url',
  style: 'minimal',
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
  label: {
    enabled: true,
    text: 'SCAN ME',
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Inter',
    fontWeight: '700',
    letterSpacing: 1,
    alignment: 'center',
  },
  size: 512,
  margin: 10,
  errorCorrectionLevel: 'H',
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

export const QR_TYPES = [
  { id: 'url', label: 'URL', icon: 'Link' },
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'wifi', label: 'WiFi', icon: 'Wifi' },
  { id: 'email', label: 'Email', icon: 'Mail' },
  { id: 'phone', label: 'Phone', icon: 'Phone' },
  { id: 'vcard', label: 'Contact', icon: 'User' },
];

export const STYLE_PRESETS = [
  { 
    id: 'minimal', label: 'Minimal Clean', icon: 'Square',
    config: { background: '#ffffff', color: '#000000', dotType: 'square', cornerType: 'square' }
  },
  { 
    id: 'soft-glow', label: 'Soft Glow', icon: 'Sparkles',
    config: { background: '#ffffff', color: '#000000', dotType: 'rounded', cornerType: 'rounded' }
  },
  { 
    id: 'glass', label: 'Frosted Glass', icon: 'Layout',
    config: { background: '#ffffff', color: '#000000', dotType: 'dots', cornerType: 'rounded' }
  },
  { 
    id: 'paper', label: 'Organic Paper', icon: 'Waves',
    config: { background: '#fefae0', color: '#283618', dotType: 'classy', cornerType: 'rounded' }
  },
  { 
    id: 'matte-dark', label: 'Matte Dark', icon: 'Moon',
    config: { background: '#111111', color: '#ffffff', dotType: 'extra-rounded', cornerType: 'extra-rounded' }
  },
  { 
    id: 'subtle-gradient', label: 'Subtle Aura', icon: 'Sun',
    config: { 
      background: '#ffffff', color: '#000000', dotType: 'classy-rounded', cornerType: 'extra-rounded',
      gradient: { enabled: true, type: 'linear', color1: '#477f88', color2: '#00ffcc', rotation: 45 }
    }
  },
  { 
    id: 'neon-night', label: 'Neon Night', icon: 'Zap',
    config: { 
      background: '#0a0a0a', color: '#00ffcc', dotType: 'extra-rounded', cornerType: 'extra-rounded',
      gradient: { enabled: true, type: 'linear', color1: '#00ffcc', color2: '#0066ff', rotation: 90 }
    }
  },
  { 
    id: 'retro-vapor', label: 'Vaporwave', icon: 'Music',
    config: { 
      background: '#2d1b4e', color: '#ff71ce', dotType: 'classy', cornerType: 'rounded',
      gradient: { enabled: true, type: 'linear', color1: '#ff71ce', color2: '#01cdfe', rotation: 45 }
    }
  },
  { 
    id: 'royal-gold', label: 'Royal Gold', icon: 'Trophy',
    config: { background: '#ffffff', color: '#b8860b', dotType: 'classy', cornerType: 'rounded' }
  },
  { 
    id: 'emerald-city', label: 'Emerald City', icon: 'Trees',
    config: { background: '#f0fff0', color: '#008037', dotType: 'rounded', cornerType: 'rounded' }
  },
  { 
    id: 'midnight-oak', label: 'Midnight Oak', icon: 'Target',
    config: { background: '#1a1a1a', color: '#d4d4d4', dotType: 'square', cornerType: 'square' }
  },
  { 
    id: 'sunset-bliss', label: 'Sunset Bliss', icon: 'Sunrise',
    config: { 
      background: '#fff5f5', color: '#ff5f6d', dotType: 'rounded', cornerType: 'rounded',
      gradient: { enabled: true, type: 'linear', color1: '#ff5f6d', color2: '#ffc371', rotation: 0 }
    }
  },
  { 
    id: 'lavender-dream', label: 'Lavender Dream', icon: 'Cloud',
    config: { background: '#f9f5ff', color: '#7f56d9', dotType: 'extra-rounded', cornerType: 'rounded' }
  },
  { 
    id: 'cyberpunk', label: 'Cyberpunk', icon: 'Cpu',
    config: { 
      background: '#000000', color: '#fcee0a', dotType: 'square', cornerType: 'square',
      gradient: { enabled: true, type: 'linear', color1: '#fcee0a', color2: '#00ffcc', rotation: 135 }
    }
  },
  { 
    id: 'industrial', label: 'Industrial', icon: 'Settings',
    config: { background: '#2c3e50', color: '#bdc3c7', dotType: 'square', cornerType: 'square' }
  },
  { 
    id: 'arctic-ice', label: 'Arctic Ice', icon: 'Snowflake',
    config: { 
      background: '#f0f8ff', color: '#00d2ff', dotType: 'dots', cornerType: 'rounded',
      gradient: { enabled: true, type: 'radial', color1: '#00d2ff', color2: '#3a7bd5', rotation: 0 }
    }
  },
  { 
    id: 'crimson-edge', label: 'Crimson Edge', icon: 'Flame',
    config: { background: '#1a0000', color: '#ff0000', dotType: 'square', cornerType: 'square' }
  },
  { 
    id: 'oceanic-deep', label: 'Oceanic Deep', icon: 'Waves',
    config: { 
      background: '#001f3f', color: '#7fdbff', dotType: 'rounded', cornerType: 'rounded',
      gradient: { enabled: true, type: 'linear', color1: '#0074d9', color2: '#7fdbff', rotation: 180 }
    }
  },
  { 
    id: 'desert-sand', label: 'Desert Sand', icon: 'Sun',
    config: { background: '#f4a460', color: '#8b4513', dotType: 'classy', cornerType: 'rounded' }
  },
  { 
    id: 'forest-moss', label: 'Forest Moss', icon: 'Trees',
    config: { background: '#2d5a27', color: '#e0e0e0', dotType: 'rounded', cornerType: 'rounded' }
  },
  { 
    id: 'slate-stone', label: 'Slate Stone', icon: 'Layout',
    config: { background: '#334155', color: '#f1f5f9', dotType: 'square', cornerType: 'rounded' }
  },
  { 
    id: 'coffee-cream', label: 'Coffee Cream', icon: 'Coffee',
    config: { background: '#f5ebe0', color: '#603808', dotType: 'classy-rounded', cornerType: 'rounded' }
  },
  { 
    id: 'berry-punch', label: 'Berry Punch', icon: 'Zap',
    config: { background: '#fff0f3', color: '#c9184a', dotType: 'extra-rounded', cornerType: 'rounded' }
  },
  { 
    id: 'mint-fresh', label: 'Mint Fresh', icon: 'Leaf',
    config: { background: '#e0fbf2', color: '#00a86b', dotType: 'rounded', cornerType: 'rounded' }
  },
  { 
    id: 'lemon-zest', label: 'Lemon Zest', icon: 'Sun',
    config: { background: '#fff9db', color: '#fcc419', dotType: 'rounded', cornerType: 'rounded' }
  },
  { 
    id: 'galaxy-void', label: 'Galaxy Void', icon: 'Sparkles',
    config: { 
      background: '#020617', color: '#ffffff', dotType: 'dots', cornerType: 'rounded',
      gradient: { enabled: true, type: 'radial', color1: '#8b5cf6', color2: '#020617', rotation: 0 }
    }
  },
  { 
    id: 'luxury-onyx', icon: 'Diamond', label: 'Luxury Onyx',
    config: { background: '#000000', color: '#d4af37', dotType: 'classy', cornerType: 'rounded' }
  },
  { 
    id: 'pink-lemonade', label: 'Pink Lemonade', icon: 'GlassWater',
    config: { background: '#fff5f7', color: '#ff4d6d', dotType: 'rounded', cornerType: 'rounded' }
  },
  { 
    id: 'autumn-warmth', label: 'Autumn Warmth', icon: 'Wind',
    config: { background: '#fff4e6', color: '#d9480f', dotType: 'classy', cornerType: 'rounded' }
  },
  { 
    id: 'deep-purple', label: 'Deep Purple', icon: 'Ghost',
    config: { background: '#12002b', color: '#b197fc', dotType: 'extra-rounded', cornerType: 'extra-rounded' }
  },
];

export const FONT_OPTIONS = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Poppins', label: 'Poppins' },
  { id: 'Montserrat', label: 'Montserrat' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'Open Sans', label: 'Open Sans' },
  { id: 'Lato', label: 'Lato' },
  { id: 'Oswald', label: 'Oswald' },
  { id: 'Playfair Display', label: 'Playfair Display' },
  { id: 'Raleway', label: 'Raleway' },
  { id: 'Nunito', label: 'Nunito' },
  { id: 'Bebas Neue', label: 'Bebas Neue' },
  { id: 'Ubuntu', label: 'Ubuntu' },
  { id: 'Merriweather', label: 'Merriweather' },
  { id: 'Quicksand', label: 'Quicksand' },
  { id: 'Cabin', label: 'Cabin' },
  { id: 'Work Sans', label: 'Work Sans' },
  { id: 'Josefin Sans', label: 'Josefin Sans' },
  { id: 'Anton', label: 'Anton' },
  { id: 'DM Sans', label: 'DM Sans' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { id: 'Space Grotesk', label: 'Space Grotesk' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono' },
];

export const FONT_WEIGHTS = [
  { id: '300', label: 'Light' },
  { id: '400', label: 'Regular' },
  { id: '500', label: 'Medium' },
  { id: '600', label: 'Semi-Bold' },
  { id: '700', label: 'Bold' },
  { id: '800', label: 'Extra-Bold' },
  { id: '900', label: 'Black' },
];
