/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'vcard' | 'file' | 'image';

export type DotStyle = 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' | 'wave' | 'cherry';
export type CornerStyle = 'square' | 'dot' | 'rounded' | 'extra-rounded';

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
  frame: {
    style: 'none' | 'border' | 'card';
    text: string;
    fontSize: number;
    color: string;
    fontFamily: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    shadowColor: string;
    shadowIntensity: number;
    padding: number;
  };
  size: number;
  margin: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  skin?: 'none' | 'cherry' | 'wave' | 'aurora' | 'cyberpunk' | 'midnight' | 'sunset' | 'forest';
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  contentType: string;
  value: string;
  thumbnail: string;
  config: QRConfig;
}
