/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'vcard';

export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' | 'wave' | 'cherry';
export type CornerStyle = 'square' | 'dot' | 'rounded' | 'extra-rounded';

export type QRStyle = 
  | 'minimal' | 'soft-glow' | 'glass' | 'paper' | 'matte-dark' | 'subtle-gradient'
  | 'neon-night' | 'retro-vapor' | 'royal-gold' | 'emerald-city' | 'midnight-oak'
  | 'sunset-bliss' | 'lavender-dream' | 'cyberpunk' | 'industrial' | 'arctic-ice'
  | 'crimson-edge' | 'oceanic-deep' | 'desert-sand' | 'forest-moss' | 'slate-stone'
  | 'coffee-cream' | 'berry-punch' | 'mint-fresh' | 'lemon-zest' | 'galaxy-void'
  | 'luxury-onyx' | 'pink-lemonade' | 'autumn-warmth' | 'deep-purple';

export interface QRConfig {
  content: string;
  type: QRType;
  // WiFi specific
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
  // Email specific
  email?: string;
  subject?: string;
  body?: string;
  // Phone specific
  phone?: string;
  // vCard specific
  firstName?: string;
  lastName?: string;
  organization?: string;
  vCardPhone?: string;
  vCardEmail?: string;
  vCardUrl?: string;
  // Design
  style: QRStyle;
  dots: {
    type: DotStyle;
    color: string;
    gradient?: {
      enabled: boolean;
      type: 'linear' | 'radial';
      color1: string;
      color2: string;
      rotation: number;
    };
  };
  background: {
    color: string;
    transparent: boolean;
  };
  corners: {
    type: CornerStyle;
    color: string;
  };
  logo?: {
    src: string;
    size: number;
    margin: number;
    hideBackgroundDots: boolean;
  };
  label: {
    enabled: boolean;
    text: string;
    color: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    letterSpacing: number;
    alignment: 'left' | 'center' | 'right';
  };
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  contentType: string;
  value: string;
  thumbnail: string;
  config: QRConfig;
}
