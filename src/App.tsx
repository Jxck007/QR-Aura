// LucidQR v2.0 — Generated with AI Studio
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  QrCode, 
  Download,
  Copy,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Link as LinkIcon,
  Type as FontIcon,
  Palette as ColorsIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Zap,
  Moon,
  Sun,
  Trophy,
  Trees,
  Cloud,
  Cpu,
  Settings,
  Snowflake,
  Flame,
  Coffee,
  Leaf,
  GlassWater,
  Wind,
  Ghost,
  Music,
  Sunrise,
  Target,
  Type,
  Wifi,
  Mail,
  Phone,
  User,
  Palette,
  Image as ImageIcon,
  Square,
  Circle,
  CircleDot,
  Grid2X2,
  Diamond,
  Waves,
  Flower2,
  Sparkles,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layout,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCodeStyling from 'qr-code-styling';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { cn } from './lib/utils';
import { QRConfig, QRType, DotStyle, CornerStyle, HistoryEntry, QRStyle } from './types';
import { DEFAULT_CONFIG, QR_TYPES, DOT_STYLES, CORNER_STYLES, STYLE_PRESETS, FONT_OPTIONS, FONT_WEIGHTS } from './constants';
import { ConicButton, LiquidMetalLogo, SmoothTabs, InputGroup, ColorInput, Tooltip, Dropdown } from './components/EnhancedUI';

export default function App() {
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'styles' | 'colors' | 'logo' | 'label'>('content');
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [qrInstance, setQrInstance] = useState<QRCodeStyling | null>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const qrStyling = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const updateConfig = (updates: any) => {
    setConfig(prev => {
      // Deep merge common nested objects to prevent data loss and stale closure issues
      const mergeNested = (key: string) => {
        if (updates[key] && typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
          return { ...prev[key as keyof QRConfig], ...updates[key] };
        }
        return updates[key] !== undefined ? updates[key] : prev[key as keyof QRConfig];
      };

      let next = {
        ...prev,
        ...updates,
        dots: mergeNested('dots'),
        background: mergeNested('background'),
        corners: mergeNested('corners'),
        label: mergeNested('label'),
        logo: mergeNested('logo')
      } as QRConfig;

      // Special handling for gradients within dots
      if (updates.dots?.gradient) {
        next.dots.gradient = { ...prev.dots.gradient, ...updates.dots.gradient };
      }

      // Handle nested updates explicitly for presets
      if (updates.style) {
        const selectedPreset = STYLE_PRESETS.find(p => p.id === updates.style);
        if (selectedPreset?.config) {
          const { background, color, dotType, cornerType, gradient } = selectedPreset.config;
          next = {
            ...next,
            background: { ...next.background, color: background },
            label: { ...next.label, color: color },
            dots: { 
              ...next.dots, 
              color: color, 
              type: dotType as any, 
              gradient: gradient ? { ...next.dots.gradient, ...gradient, type: gradient.type as 'linear' | 'radial' } : { ...next.dots.gradient, enabled: false } 
            },
            corners: { ...next.corners, type: cornerType as any, color: color }
          };
        }
      }

      const contentUpdates = { ...next };
      if (updates.content && !updates.type) {
        const detectedType = detectContentType(updates.content);
        if (detectedType) contentUpdates.type = detectedType as QRType;
      }
      
      // Sync Content logic...
      if (contentUpdates.type === 'wifi') contentUpdates.content = `WIFI:S:${contentUpdates.ssid || ''};T:${contentUpdates.encryption || 'WPA'};P:${contentUpdates.password || ''};;`;
      else if (contentUpdates.type === 'phone') contentUpdates.content = `tel:${contentUpdates.phone || ''}`;
      else if (contentUpdates.type === 'email') contentUpdates.content = `mailto:${contentUpdates.email || ''}`;
      
      return contentUpdates;
    });
  };
  
  // --- Layout & Scroll Events ---
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const handleWinScroll = () => {
      if (window.innerWidth < 768 || (window.innerWidth > window.innerHeight && window.innerHeight < 600) === false) {
        setScrollPosition(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleWinScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleWinScroll);
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Only update from container if on desktop
    if (window.innerWidth >= 768 && !isLandscape) {
      setScrollPosition(e.currentTarget.scrollTop);
    }
  };

  const resetToDefault = (section?: string) => {
    if (!section) {
      setConfig(DEFAULT_CONFIG);
      setToast('Configuration reset');
    } else {
      if (section === 'design') {
        updateConfig({ 
          dots: DEFAULT_CONFIG.dots, 
          corners: DEFAULT_CONFIG.corners,
          background: DEFAULT_CONFIG.background
        });
      } else if (section === 'style') {
        updateConfig({ style: DEFAULT_CONFIG.style });
      } else if (section === 'label') {
        updateConfig({ label: DEFAULT_CONFIG.label });
      } else if (section === 'colors') {
        updateConfig({ 
          dots: { ...config.dots, color: DEFAULT_CONFIG.dots.color },
          background: DEFAULT_CONFIG.background,
          label: { ...config.label, color: DEFAULT_CONFIG.label.color }
        });
      }
      setToast(`Reset ${section} settings`);
    }
    setTimeout(() => setToast(null), 3000);
  };

  const qrContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null && qrInstance) {
      node.innerHTML = '';
      qrInstance.append(node);
    }
  }, [qrInstance]);

  // --- Persistence & Initialization ---
  useEffect(() => {
    localStorage.setItem('lucidqr_draft', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('lucidqr_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedConfig = localStorage.getItem('lucidqr_draft');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (e) {
        console.error("Failed to load saved draft", e);
      }
    }
    
    document.documentElement.classList.add('dark');

    // Engine Setup
    const instance = new QRCodeStyling({
      width: 320,
      height: 320,
      data: config.content,
      margin: config.margin,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: config.errorCorrectionLevel },
      imageOptions: { crossOrigin: 'anonymous', margin: 10 }
    });

    qrStyling.current = instance;
    setQrInstance(instance);
  }, []);

  // --- Logic ---
  const detectContentType = useCallback((val: string) => {
    if (val.startsWith('http://') || val.startsWith('https://')) return 'url';
    if (/^\+?[\d\s\-\(\)]{7,}$/.test(val)) return 'phone';
    if (val.startsWith('mailto:')) return 'email';
    if (val.startsWith('WIFI:')) return 'wifi';
    return null;
  }, []);

  const handleContentChange = (val: string) => {
    const detected = detectContentType(val);
    if (detected && detected !== config.type) {
      setConfig(prev => ({ ...prev, type: detected as QRType, content: val }));
      setToast(`Type: ${detected.toUpperCase()}`);
      setTimeout(() => setToast(null), 2000);
    } else {
      updateConfig({ content: val });
    }
  };

  useEffect(() => {
    if (!qrInstance) return;
    
    setIsRegenerating(true);
    const timer = setTimeout(() => {
      setUpdateKey(prev => prev + 1);
      try {
        const dotsOptions: any = {
          color: config.dots.color,
          type: config.dots.type as any,
        };

        if (config.dots.gradient?.enabled) {
          dotsOptions.gradient = {
            type: config.dots.gradient.type,
            rotation: (config.dots.gradient.rotation * Math.PI) / 180,
            colorStops: [
              { offset: 0, color: config.dots.gradient.color1 },
              { offset: 1, color: config.dots.gradient.color2 }
            ]
          };
        } else {
          dotsOptions.gradient = null;
        }

        qrInstance.update({
          width: config.size,
          height: config.size,
          data: config.content || 'https://qraura.io',
          dotsOptions,
          backgroundOptions: { 
            color: config.background.transparent ? 'transparent' : config.background.color 
          },
          cornersSquareOptions: { 
            type: config.corners.type as any, 
            color: config.corners.color,
            gradient: dotsOptions.gradient 
          },
          cornersDotOptions: { 
            type: config.corners.type as any, 
            color: config.corners.color,
            gradient: dotsOptions.gradient 
          },
          qrOptions: {
            errorCorrectionLevel: config.errorCorrectionLevel
          },
          image: (config.logo?.src === '/logo.png') ? undefined : config.logo?.src,
          imageOptions: {
            hideBackgroundDots: config.logo?.hideBackgroundDots,
            imageSize: (config.logo?.size || 30) / 100,
            margin: config.logo?.margin || 0,
            crossOrigin: 'anonymous'
          }
        });
      } catch (err) {
        console.error("QR Update Failed", err);
      } finally {
        setIsRegenerating(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [config, qrInstance]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logo: { ...config.logo!, src: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf' | 'low-png', quality: number = 1) => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setToast(`Exporting ${format.toUpperCase()}...`);

    try {
      const scale = quality * 2; // Base scale for HD
      
      if (format === 'svg' && qrStyling.current) {
        setToast('Downloading vector QR...');
        try {
          const blob = await qrStyling.current.getRawData('svg');
          if (!blob) throw new Error("Failed to get SVG blob");
          
          let innerSvg = await blob.text();
          innerSvg = innerSvg.replace(/<\?xml.*?\?>/g, '').trim();
          
          const padding = 40; 
          const qrSize = config.size; 
          const cardWidth = qrSize + (padding * 2);
          let cardHeight = cardWidth;
          
          let labelSvg = '';
          if (config.label.enabled && config.label.text) {
            const fontSize = config.label.fontSize;
            const textPaddingOffset = 20;
            const textHeight = fontSize * 1.1;
            cardHeight = padding + qrSize + textPaddingOffset + textHeight + padding;
            
            const alignMap: Record<string, string> = { left: 'start', center: 'middle', right: 'end' };
            const xPosMap: Record<string, number> = { left: padding, center: cardWidth / 2, right: cardWidth - padding };
            
            labelSvg = `
              <text 
                x="${xPosMap[config.label.alignment]}" 
                y="${padding + qrSize + textPaddingOffset + (fontSize * 0.8)}" 
                font-family="'${config.label.fontFamily}', sans-serif" 
                font-size="${fontSize}px" 
                font-weight="${config.label.fontWeight}" 
                fill="${config.label.color}" 
                text-anchor="${alignMap[config.label.alignment]}"
                letter-spacing="${config.label.letterSpacing}px"
              >
                ${config.label.text}
              </text>
            `;
          }
          
          const isGlass = config.style === 'glass';
          const isTransparent = config.background.transparent;
          const bgFill = (isGlass || isTransparent) ? 'none' : config.background.color;
          const borderRadius = isGlass ? 40 : 24;

          const wrappedSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}">
              <rect width="${cardWidth}" height="${cardHeight}" fill="${bgFill}" rx="${borderRadius}" ry="${borderRadius}" />
              <svg x="${padding}" y="${padding}" width="${qrSize}" height="${qrSize}">
                ${innerSvg}
              </svg>
              ${labelSvg}
            </svg>
          `.trim();
          
          const finalBlob = new Blob([wrappedSvg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(finalBlob);
          const link = document.createElement('a');
          link.download = `qraura-${Date.now()}.svg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error("Advanced SVG generation failed, falling back to basic:", err);
          qrStyling.current.download({ name: `qraura-${Date.now()}`, extension: 'svg' });
        }
      } else if (format === 'pdf') {
        const canvas = await html2canvas(previewRef.current, { scale, useCORS: true, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / scale, canvas.height / scale] });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / scale, canvas.height / scale);
        pdf.save(`qraura-${Date.now()}.pdf`);
      } else {
        const canvas = await html2canvas(previewRef.current, { 
          scale: format === 'low-png' ? 1 : scale, 
          useCORS: true, 
          backgroundColor: null,
          imageTimeout: 5000
        });
        const link = document.createElement('a');
        link.download = `qraura-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', format === 'low-png' ? 0.6 : 1.0);
        link.click();
      }
      setToast('Saved successfully');
    } catch (err) {
      console.error(err);
      setToast('Export failed');
    } finally {
      setIsExporting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleCopy = async () => {
    if (!previewRef.current) return;
    setToast('Processing Copy...');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setToast('Copied to Clipboard');
        }
      });
    } catch (err) {
      setToast('Copy failed');
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lucidqr_history');
    setToast('History cleared');
    setTimeout(() => setToast(null), 3000);
  };

  // --- Render Helpers ---
  const SectionHeader = ({ title, onReset }: { title: string; onReset?: () => void }) => (
    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 mt-8 first:mt-0 border-b border-slate-800 pb-2">
      <span>{title}</span>
      {onReset && (
        <Tooltip content={`Reset ${title} to default`}>
          <button 
            onClick={onReset}
            className="p-1 hover:bg-white/5 rounded-md transition-colors text-slate-500 hover:text-primary group"
            title="Reset Section"
          >
            <RotateCcw size={12} className="group-active:rotate-[-90deg] transition-transform" />
          </button>
        </Tooltip>
      )}
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col bg-[#0B0F14] dark font-sans",
      isLandscape ? "h-screen overflow-hidden" : "min-h-[100dvh]"
    )}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLogoUpload} 
        className="hidden" 
        accept="image/*"
      />
      {/* Floating Mini Preview (Mobile Only) */}
      <AnimatePresence>
        {(!isLandscape && scrollPosition > 200 && !showFullPreview) && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            onClick={() => setShowFullPreview(true)}
            className={cn(
              "fixed bottom-[110px] right-4 z-[500] w-20 h-20 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden cursor-pointer active:scale-95 transition-transform p-2 flex items-center justify-center",
              config.style === 'glass' ? "bg-white/30 backdrop-blur-md" : "bg-white"
            )}
            style={{
              backgroundColor: config.style === 'glass' ? undefined : config.background.color
            }}
          >
            <div className="w-full flex-1 relative flex flex-col items-center justify-center pointer-events-none">
              <div ref={node => {
                if (node && qrInstance) {
                  node.innerHTML = '';
                  const clone = new QRCodeStyling({
                    ...qrInstance._options,
                    width: config.label.enabled && config.label.text ? 50 : 70,
                    height: config.label.enabled && config.label.text ? 50 : 70,
                    margin: 0
                  });
                  clone.append(node);
                }
              }} className="w-full flex items-center justify-center qr-render-container" />
              {config.label.enabled && config.label.text && (
                 <div 
                    className="w-full flex flex-col mt-1"
                    style={{ alignItems: config.label.alignment === 'center' ? 'center' : (config.label.alignment === 'left' ? 'flex-start' : 'flex-end') }}
                  >
                    <p 
                      className="max-w-full break-words leading-none"
                      style={{ 
                        fontSize: `6px`, // Fixed tiny font size for mini preview
                        color: config.label.color,
                        fontFamily: `"${config.label.fontFamily}", sans-serif`,
                        fontWeight: config.label.fontWeight,
                        textAlign: config.label.alignment as any
                      }}
                    >
                      {config.label.text}
                    </p>
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0B0F14]/95 backdrop-blur-3xl flex items-center justify-center p-8"
            onClick={() => setShowFullPreview(false)}
          >
            <button 
              onClick={() => setShowFullPreview(false)}
              className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-white flex items-center justify-center transition-all z-50 shadow-xl border border-white/10"
            >
              <RotateCcw size={18} />
            </button>
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className={cn(
                "relative w-full max-w-sm rounded-[2rem] p-10 shadow-2xl flex items-center justify-center overflow-hidden",
                config.style === 'glass' ? "bg-white/30 backdrop-blur-3xl border border-white/30" : ""
              )}
              style={{
                backgroundColor: config.style === 'glass' ? undefined : config.background.color,
                backgroundImage: config.style === 'paper' ? 'url("https://www.transparenttextures.com/handmade-paper.png")' : undefined
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center justify-center w-full relative z-10">
                <div ref={node => {
                  if (node && qrInstance) {
                    node.innerHTML = '';
                    const modalQr = new QRCodeStyling({
                      ...qrInstance._options,
                      width: 300,
                      height: 300,
                    });
                    modalQr.append(node);
                  }
                }} className="w-full aspect-square flex items-center justify-center qr-render-container" />
                {config.label.enabled && config.label.text && (
                   <motion.div 
                      layout
                      className="w-full flex flex-col mt-4"
                      style={{ alignItems: config.label.alignment === 'center' ? 'center' : (config.label.alignment === 'left' ? 'flex-start' : 'flex-end') }}
                    >
                      <p 
                        className="max-w-full break-words"
                        style={{ 
                          fontSize: `${config.label.fontSize}px`, 
                          color: config.label.color,
                          fontFamily: `"${config.label.fontFamily}", sans-serif`,
                          fontWeight: config.label.fontWeight,
                          letterSpacing: `${config.label.letterSpacing}px`,
                          textAlign: config.label.alignment as any,
                          lineHeight: 1.1
                        }}
                      >
                        {config.label.text}
                      </p>
                   </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Transparent & Sleek */}
      <header className="fixed top-0 w-full h-[60px] border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-black/80 backdrop-blur-md z-[1000]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border border-white/10">
            <img src="/logo.png" alt="QR Aura" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <LiquidMetalLogo className="text-lg font-black tracking-tighter leading-none">
              QR Aura
            </LiquidMetalLogo>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="View design history" direction="bottom">
            <button 
              onClick={() => setShowHistory(true)}
              className="h-8 w-8 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 hover:text-primary transition-all flex items-center justify-center relative"
            >
              <History size={14} />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_rgba(0,255,204,0.5)]" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Reset all settings to default" direction="bottom">
            <button 
              onClick={() => resetToDefault()}
              className="h-8 px-3 rounded-lg border border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Main Content Area: Responsive Grid */}
      <main className={cn(
        "flex-1 flex w-full pt-[60px]",
        isLandscape ? "flex-row overflow-hidden" : "flex-col md:flex-row md:overflow-hidden",
        "scroll-smooth"
      )}
      onScroll={handleScroll}>
        
        {/* Sticky Preview Section (Mobile Top / Desktop Right / Landscape Left) */}
        <main className={cn(
          "bg-black flex flex-col relative shrink-0 z-20 border-white/5",
          isLandscape 
            ? "w-2/5 border-r" 
            : "w-full md:w-3/5 lg:w-2/3 md:shrink md:flex-1 md:order-last border-b md:border-b-0 md:border-l"
        )}>
          {/* Fixed Height / Aspect Ratio Preview Container */}
          <div className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 relative z-10",
            !isLandscape && "min-h-[340px] md:min-h-0 md:p-8"
          )}>
            <AnimatePresence>
              {toast && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-6 py-3 rounded-full text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[999] flex items-center gap-3"
                >
                  <CheckCircle2 size={16} className="text-primary" />
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Actual QR Stage */}
            <div className={cn(
              "w-full flex items-center justify-center relative",
              isLandscape ? "max-w-full" : "max-w-[min(90vw,450px)] aspect-square"
            )}>
              {/* Subtle Glow Backdrop */}
              <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-110 pointer-events-none opacity-50" />
              
              <motion.div 
                key={updateKey}
                className={cn(
                  "relative transition-all duration-500",
                  "max-w-full max-h-full w-auto h-auto min-w-[200px] min-h-[200px]",
                  config.style === 'glass' ? "rounded-[2.5rem] shadow-2xl" : "rounded-3xl shadow-2xl"
                )}
              >
                <div
                  ref={previewRef}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 overflow-hidden w-full h-full relative",
                    config.style === 'glass' ? "bg-white/30 backdrop-blur-3xl border border-white/30 rounded-[2.5rem]" : "rounded-3xl"
                  )}
                  style={{
                    backgroundColor: config.style === 'glass' ? undefined : config.background.color,
                    backgroundImage: config.style === 'paper' ? 'url("https://www.transparenttextures.com/handmade-paper.png")' : undefined
                  }}
                >
                  <div className="flex flex-col items-center justify-center w-full h-full relative z-10">
                    <div 
                      ref={qrContainerRef} 
                      className={cn(
                        "transition-all duration-300 relative z-20 aspect-square flex items-center justify-center qr-render-container",
                        isLandscape ? "w-[160px] h-[160px]" : "w-[200px] h-[200px] xs:w-[240px] xs:h-[240px] sm:w-[300px] sm:h-[300px]",
                        (isRegenerating || !config.content) ? "opacity-30 blur-md scale-95" : "opacity-100 scale-100"
                      )} 
                    />

                    {config.label.enabled && config.label.text && (
                      <motion.div 
                        layout
                        className={cn("w-full flex flex-col", isLandscape ? "mt-2" : "mt-5")}
                        style={{ alignItems: config.label.alignment === 'center' ? 'center' : (config.label.alignment === 'left' ? 'flex-start' : 'flex-end') }}
                      >
                        <p 
                          className="max-w-full break-words"
                          style={{ 
                            fontSize: `${isLandscape ? config.label.fontSize * 0.7 : config.label.fontSize}px`,
                            color: config.label.color,
                            fontFamily: `"${config.label.fontFamily}", sans-serif`,
                            fontWeight: config.label.fontWeight,
                            letterSpacing: `${config.label.letterSpacing}px`,
                            textAlign: config.label.alignment as any,
                            lineHeight: 1.1
                          }}
                        >
                          {config.label.text}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Sidebar / Controls Section */}
        <aside className={cn(
          "flex flex-col bg-[#050505] border-white/5 relative",
          isLandscape 
            ? "flex-1 border-l overflow-hidden" 
            : "w-full md:w-[400px] lg:w-[450px] shrink-0 md:flex-none md:overflow-hidden border-t md:border-t-0 md:border-l"
        )}>
          
          <div className="shrink-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl px-4 py-3 sticky top-[60px] md:top-0">
            <SmoothTabs 
              tabs={[
                { id: 'content', label: 'Data', icon: LinkIcon, tooltip: 'Configure QR Content' },
                { id: 'design', label: 'Engine', icon: Square, tooltip: 'QR Pattern & Shapes' },
                { id: 'styles', label: 'Theme', icon: Sparkles, tooltip: 'Card Visual Themes' },
                { id: 'colors', label: 'Palette', icon: Palette, tooltip: 'Brand Color Palette' },
                { id: 'logo', label: 'Logo', icon: ImageIcon, tooltip: 'Custom Branding' },
                { id: 'label', label: 'Font', icon: FontIcon, tooltip: 'Footer Typography' },
              ]}
              activeTab={activeTab}
              onChange={(id) => {
                setActiveTab(id as any);
                // On mobile, scroll the content into view slightly if it's the first click
                if (!isLandscape && window.innerWidth < 768) {
                  document.getElementById('tab-content-area')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </div>

          <div 
            id="tab-content-area"
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-visible md:overflow-y-auto no-scrollbar p-4 md:p-6 pb-24 space-y-8"
          >
            <AnimatePresence>
              {activeTab === 'content' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Content Type" onReset={() => updateConfig({ type: DEFAULT_CONFIG.type })} />
                  <div className="grid grid-cols-3 gap-2">
                    {QR_TYPES.map(type => {
                      const Icon = { Link: LinkIcon, Type, Wifi, Mail, Phone, User }[type.icon] as any;
                      return (
                        <Tooltip key={type.id} content={`Generate ${type.label} QR`} className="w-full">
                          <button
                            onClick={() => updateConfig({ type: type.id as QRType })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-h-[72px] w-full",
                              config.type === type.id 
                                ? "border-primary bg-primary/5 text-primary" 
                                : "border-slate-800 text-slate-500 hover:border-slate-700"
                            )}
                          >
                            <Icon size={20} />
                            <span className="text-[10px] font-bold">{type.label}</span>
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>

                  <SectionHeader title="Data Input" onReset={() => updateConfig({ 
                    content: DEFAULT_CONFIG.content,
                    ssid: DEFAULT_CONFIG.ssid,
                    password: DEFAULT_CONFIG.password,
                    encryption: DEFAULT_CONFIG.encryption,
                    email: DEFAULT_CONFIG.email,
                    subject: DEFAULT_CONFIG.subject,
                    body: DEFAULT_CONFIG.body,
                    phone: DEFAULT_CONFIG.phone,
                    firstName: DEFAULT_CONFIG.firstName,
                    lastName: DEFAULT_CONFIG.lastName,
                    organization: DEFAULT_CONFIG.organization,
                    vCardPhone: DEFAULT_CONFIG.vCardPhone,
                    vCardEmail: DEFAULT_CONFIG.vCardEmail,
                    vCardUrl: DEFAULT_CONFIG.vCardUrl
                  })} />
                  <div className="space-y-4">
                    {config.type === 'url' && (
                      <InputGroup label="Website Link">
                        <input 
                          className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                          type="url"
                          value={config.content}
                          onChange={(e) => handleContentChange(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </InputGroup>
                    )}
                    {config.type === 'text' && (
                      <InputGroup label="Custom Text">
                        <textarea 
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-primary/50 outline-none min-h-[100px] text-white resize-none transition-colors"
                          value={config.content}
                          onChange={(e) => updateConfig({ content: e.target.value })}
                          placeholder="Enter your message..."
                        />
                      </InputGroup>
                    )}
                    {config.type === 'wifi' && (
                      <div className="space-y-3">
                        <InputGroup label="Network Name">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            placeholder="Enter SSID"
                            value={config.ssid || ''}
                            onChange={(e) => updateConfig({ ssid: e.target.value })}
                          />
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-2">
                          <InputGroup label="Type">
                            <select 
                              className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-2 text-sm outline-none text-white cursor-pointer focus:border-primary/50 transition-colors"
                              value={config.encryption || 'WPA'}
                              onChange={(e) => updateConfig({ encryption: e.target.value as any })}
                            >
                              <option value="WPA" className="bg-black">WPA/WPA2</option>
                              <option value="WEP" className="bg-black">WEP</option>
                              <option value="nopass" className="bg-black">None</option>
                            </select>
                          </InputGroup>
                          <InputGroup label="Password">
                            <input 
                              className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                              type="password"
                              placeholder="Key"
                              value={config.password || ''}
                              onChange={(e) => updateConfig({ password: e.target.value })}
                            />
                          </InputGroup>
                        </div>
                      </div>
                    )}
                    {config.type === 'email' && (
                      <div className="space-y-3">
                        <InputGroup label="Recipient Address">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            type="email"
                            placeholder="mail@example.com"
                            value={config.email || ''}
                            onChange={(e) => updateConfig({ email: e.target.value })}
                          />
                        </InputGroup>
                        <InputGroup label="Subject">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            placeholder="Message Subject"
                            value={config.subject || ''}
                            onChange={(e) => updateConfig({ subject: e.target.value })}
                          />
                        </InputGroup>
                        <InputGroup label="Message Body">
                          <textarea 
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:border-primary/50 outline-none min-h-[100px] text-white resize-none transition-colors"
                            placeholder="Type your message..."
                            value={config.body || ''}
                            onChange={(e) => updateConfig({ body: e.target.value })}
                          />
                        </InputGroup>
                      </div>
                    )}
                    {config.type === 'phone' && (
                      <InputGroup label="Phone Number">
                        <input 
                          className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                          type="tel"
                          placeholder="+1 234 567 890"
                          value={config.phone || ''}
                          onChange={(e) => updateConfig({ phone: e.target.value })}
                        />
                      </InputGroup>
                    )}
                    {config.type === 'vcard' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <InputGroup label="First Name">
                            <input 
                              className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                              value={config.firstName || ''}
                              onChange={(e) => updateConfig({ firstName: e.target.value })}
                            />
                          </InputGroup>
                          <InputGroup label="Last Name">
                            <input 
                              className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                              value={config.lastName || ''}
                              onChange={(e) => updateConfig({ lastName: e.target.value })}
                            />
                          </InputGroup>
                        </div>
                        <InputGroup label="Organization">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            value={config.organization || ''}
                            onChange={(e) => updateConfig({ organization: e.target.value })}
                          />
                        </InputGroup>
                        <InputGroup label="Phone">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            type="tel"
                            value={config.vCardPhone || ''}
                            onChange={(e) => updateConfig({ vCardPhone: e.target.value })}
                          />
                        </InputGroup>
                        <InputGroup label="Email">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            type="email"
                            value={config.vCardEmail || ''}
                            onChange={(e) => updateConfig({ vCardEmail: e.target.value })}
                          />
                        </InputGroup>
                        <InputGroup label="Website">
                          <input 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            type="url"
                            value={config.vCardUrl || ''}
                            onChange={(e) => updateConfig({ vCardUrl: e.target.value })}
                          />
                        </InputGroup>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'design' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Dot Pattern" onReset={() => updateConfig({ dots: { type: DEFAULT_CONFIG.dots.type } })} />
                  <div className="grid grid-cols-3 gap-3">
                    {DOT_STYLES.map(style => {
                      const Icon = { Square, Circle, CircleDot, Grid2X2, Diamond, Waves, Flower2 }[style.icon] as any;
                      return (
                        <Tooltip key={style.id} content={`${style.label} Pattern`} className="w-full">
                          <button
                            onClick={() => updateConfig({ dots: { type: style.id as DotStyle } })}
                            className={cn(
                              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-full",
                              config.dots.type === style.id 
                                ? "border-primary bg-primary/5 text-primary scale-[1.04]" 
                                : "border-slate-800 text-slate-500 hover:border-slate-700"
                            )}
                          >
                            <Icon size={24} />
                            <span className="text-[10px] font-bold">{style.label}</span>
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>

                  <SectionHeader title="Corner Style" onReset={() => updateConfig({ corners: { type: DEFAULT_CONFIG.corners.type } })} />
                  <div className="grid grid-cols-2 gap-3">
                    {CORNER_STYLES.map(style => (
                      <Tooltip key={style.id} content={`${style.label} corners`} className="w-full">
                        <button
                          onClick={() => updateConfig({ corners: { type: style.id as CornerStyle } })}
                          className={cn(
                            "h-12 rounded-xl border-2 font-bold text-xs transition-all w-full",
                            config.corners.type === style.id 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-slate-800 text-slate-500 hover:border-slate-700"
                          )}
                        >
                          {style.label}
                        </button>
                      </Tooltip>
                    ))}
                  </div>

                  <SectionHeader title="Output Resolution" onReset={() => updateConfig({ size: DEFAULT_CONFIG.size })} />
                  <div className="space-y-4">
                    <Tooltip content="Adjust final image width and height" className="w-full">
                      <InputGroup label={`Dimensions: ${config.size}x${config.size}px`}>
                        <div className="flex flex-col gap-3">
                          <input 
                            type="range" 
                            min="128" 
                            max="2048" 
                            step="128"
                            value={config.size} 
                            onChange={(e) => updateConfig({ size: parseInt(e.target.value) })} 
                            className="w-full accent-primary h-6" 
                          />
                          <div className="grid grid-cols-4 gap-2">
                            {[256, 512, 1024, 2048].map(sz => (
                              <button
                                key={sz}
                                onClick={() => updateConfig({ size: sz })}
                                className={cn(
                                  "py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                                  config.size === sz 
                                    ? "border-primary bg-primary/10 text-primary" 
                                    : "border-slate-800 text-slate-500 hover:border-slate-700"
                                )}
                              >
                                {sz}px
                              </button>
                            ))}
                          </div>
                        </div>
                      </InputGroup>
                    </Tooltip>
                  </div>

                  <SectionHeader title="Error Correction" onReset={() => updateConfig({ errorCorrectionLevel: DEFAULT_CONFIG.errorCorrectionLevel })} />
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'L', label: 'Low', desc: '7%' },
                      { id: 'M', label: 'Med', desc: '15%' },
                      { id: 'Q', label: 'Quart', desc: '25%' },
                      { id: 'H', label: 'High', desc: '30%' }
                    ].map(level => (
                      <Tooltip key={level.id} content={`${level.desc} Redundancy`} className="w-full">
                        <button
                          onClick={() => updateConfig({ errorCorrectionLevel: level.id as any })}
                          className={cn(
                            "flex flex-col items-center justify-center py-2 rounded-xl border-2 transition-all w-full",
                            config.errorCorrectionLevel === level.id 
                              ? "border-primary bg-primary/5 text-primary scale-[1.02]" 
                              : "border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-900/50"
                          )}
                        >
                          <span className="text-[10px] font-bold">{level.label}</span>
                          <span className="text-[8px] opacity-60">{level.desc}</span>
                        </button>
                      </Tooltip>
                    ))}
                  </div>

                </motion.div>
              )}

              {activeTab === 'styles' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Select Layout style" onReset={() => updateConfig({ style: DEFAULT_CONFIG.style })} />
                  <div className="grid grid-cols-2 gap-3">
                    {STYLE_PRESETS.map(preset => {
                      const Icon = { 
                        Square, Layout, Sparkles, Waves, Moon, Sun, Zap, Music, Trophy, Trees, 
                        Target, Sunrise, Cloud, Cpu, Settings, Snowflake, Flame, WavesIcon: Waves,
                        Coffee, Leaf, Diamond, GlassWater, Wind, Ghost
                      }[preset.icon] || Sparkles;
                      return (
                        <Tooltip key={preset.id} content={`Apply ${preset.label} Style`} className="w-full">
                          <button
                            onClick={() => updateConfig({ style: preset.id as QRStyle })}
                            className={cn(
                              "group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all relative overflow-hidden text-center w-full",
                              config.style === preset.id 
                                ? "border-primary bg-primary/5 text-primary shadow-[0_0_20px_rgba(0,255,204,0.1)]" 
                                : "border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-900/40"
                            )}
                          >
                            <Icon size={24} className="relative z-10 transition-transform group-hover:scale-110" />
                            <span className="text-[11px] font-bold relative z-10 uppercase tracking-wider">{preset.label}</span>
                          </button>
                        </Tooltip>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center italic px-4">
                    Styles apply decorative backgrounds and effects inside the card. They never resize the QR code.
                  </p>
                </motion.div>
              )}

              {activeTab === 'colors' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Interface Colors" onReset={() => updateConfig({ dots: { color: DEFAULT_CONFIG.dots.color }, corners: { color: DEFAULT_CONFIG.corners.color }, background: { color: DEFAULT_CONFIG.background.color }, label: { color: DEFAULT_CONFIG.label.color } })} />
                  
                  <div className="space-y-4">
                    <ColorInput 
                      label="QR Pattern Color"
                      value={config.dots.color}
                      onChange={(val) => updateConfig({ 
                        dots: { color: val },
                        corners: { color: val }
                      })}
                    />

                    <ColorInput 
                      label="Card Background"
                      value={config.background.color}
                      onChange={(val) => updateConfig({ background: { color: val } })}
                    />

                    <ColorInput 
                      label="Label Text Color"
                      value={config.label.color}
                      onChange={(val) => updateConfig({ label: { color: val } })}
                    />
                  </div>

                  <SectionHeader title="Dot Gradient" onReset={() => updateConfig({ dots: { gradient: DEFAULT_CONFIG.dots.gradient } })} />
                  <div className="space-y-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Enabled</span>
                      <Tooltip content="Enable color gradient for QR pattern">
                        <button 
                          onClick={() => updateConfig({ dots: { gradient: { enabled: !config.dots.gradient?.enabled } } })}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            config.dots.gradient?.enabled ? "bg-primary" : "bg-slate-700"
                          )}
                        >
                          <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all", config.dots.gradient?.enabled ? "translate-x-6" : "translate-x-0")} />
                        </button>
                      </Tooltip>
                    </div>

                    {config.dots.gradient?.enabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <ColorInput label="Color 1" value={config.dots.gradient.color1} onChange={(val) => updateConfig({ dots: { ...config.dots, gradient: { ...config.dots.gradient!, color1: val } } })} />
                          <ColorInput label="Color 2" value={config.dots.gradient.color2} onChange={(val) => updateConfig({ dots: { ...config.dots, gradient: { ...config.dots.gradient!, color2: val } } })} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Rotation</span>
                            <span>{config.dots.gradient.rotation}°</span>
                          </div>
                          <input type="range" min="0" max="360" value={config.dots.gradient.rotation} onChange={(e) => updateConfig({ dots: { ...config.dots, gradient: { ...config.dots.gradient!, rotation: parseInt(e.target.value) } } })} className="w-full accent-primary" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'logo' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Branding" onReset={() => updateConfig({ logo: DEFAULT_CONFIG.logo })} />
                  <div className="space-y-4">
                    <InputGroup label="Logo Source">
                      <div className="flex flex-col gap-2">
                        <div className="group relative">
                          <input 
                            className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                            placeholder="https://..."
                            value={config.logo?.src || ''}
                            onChange={(e) => updateConfig({ logo: { ...config.logo!, src: e.target.value } })}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Tooltip content="Upload local image" className="flex-1">
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-bold transition-colors flex items-center justify-center gap-2"
                            >
                              <ImageIcon size={14} /> Upload Image
                            </button>
                          </Tooltip>
                          {config.logo?.src && (
                            <Tooltip content="Remove logo">
                              <button 
                                onClick={() => updateConfig({ logo: { src: '' } })}
                                className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </InputGroup>
                    
                    <Tooltip content="Adjust logo size relative to QR" className="w-full">
                      <InputGroup label={`Scale: ${config.logo?.size || 30}%`}>
                        <input type="range" min="10" max="50" value={config.logo?.size || 30} onChange={(e) => updateConfig({ logo: { size: parseInt(e.target.value) } })} className="w-full accent-primary h-6" />
                      </InputGroup>
                    </Tooltip>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] font-bold dark:text-white">Clear behind logo</span>
                      <Tooltip content="Remove QR dots behind logo for better visibility">
                        <button 
                          onClick={() => updateConfig({ logo: { hideBackgroundDots: !config.logo?.hideBackgroundDots } })}
                          className={cn("w-10 h-5 rounded-full relative transition-all", config.logo?.hideBackgroundDots ? "bg-primary" : "bg-slate-200 dark:bg-zinc-800")}
                        >
                          <div className={cn("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all", config.logo?.hideBackgroundDots ? "translate-x-5" : "translate-x-0")} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'label' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">Display Label</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Show text below QR</span>
                    </div>
                    <Tooltip content="Enable/Disable bottom text label">
                      <button 
                        onClick={() => updateConfig({ label: { enabled: !config.label.enabled } })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          config.label.enabled ? "bg-primary" : "bg-slate-700"
                        )}
                      >
                        <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all", config.label.enabled ? "translate-x-6" : "translate-x-0")} />
                      </button>
                    </Tooltip>
                    </div>

                  {config.label.enabled && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                      <InputGroup label="Label Text">
                        <input 
                          className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-4 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                          placeholder="e.g., Scan to Visit"
                          value={config.label.text}
                          onChange={(e) => updateConfig({ label: { text: e.target.value } })}
                        />
                      </InputGroup>

                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Font Family">
                          <select 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-sm outline-none text-white cursor-pointer focus:border-primary/50 transition-colors"
                            value={config.label.fontFamily}
                            onChange={(e) => updateConfig({ label: { fontFamily: e.target.value } })}
                          >
                            {FONT_OPTIONS.map(font => (
                              <option key={font.id} value={font.id} className="bg-black">{font.label}</option>
                            ))}
                          </select>
                        </InputGroup>

                        <InputGroup label="Weight">
                          <select 
                            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-3 text-sm outline-none text-white cursor-pointer focus:border-primary/50 transition-colors"
                            value={config.label.fontWeight}
                            onChange={(e) => updateConfig({ label: { fontWeight: e.target.value as any } })}
                          >
                            {FONT_WEIGHTS.map(weight => (
                              <option key={weight.id} value={weight.id} className="bg-black">{weight.label}</option>
                            ))}
                          </select>
                        </InputGroup>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup label={`Size: ${config.label.fontSize}px`}>
                          <input 
                            type="range" min="8" max="64" 
                            value={config.label.fontSize} 
                            onChange={(e) => updateConfig({ label: { fontSize: parseInt(e.target.value) } })} 
                            className="w-full accent-primary mt-2" 
                          />
                        </InputGroup>

                        <InputGroup label={`Spacing: ${config.label.letterSpacing}px`}>
                          <input 
                            type="range" min="-5" max="20" 
                            value={config.label.letterSpacing} 
                            onChange={(e) => updateConfig({ label: { letterSpacing: parseInt(e.target.value) } })} 
                            className="w-full accent-primary mt-2" 
                          />
                        </InputGroup>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Alignment</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'left', icon: AlignLeft, label: 'Align Left' },
                            { id: 'center', icon: AlignCenter, label: 'Align Center' },
                            { id: 'right', icon: AlignRight, label: 'Align Right' }
                          ].map(opt => (
                            <Tooltip key={opt.id} content={opt.label} className="w-full">
                              <button
                                onClick={() => updateConfig({ label: { alignment: opt.id as any } })}
                                className={cn(
                                  "h-11 rounded-xl border-2 flex items-center justify-center transition-all w-full",
                                  config.label.alignment === opt.id 
                                    ? "border-primary bg-primary/5 text-primary" 
                                    : "border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-900/50"
                                )}
                              >
                                <opt.icon size={20} />
                              </button>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
                )}
              </AnimatePresence>
            </div>

          <div className="shrink-0 z-40 bg-black/90 backdrop-blur-3xl border-t border-white/5 p-4 md:p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] sticky bottom-0">
            <Dropdown 
              className="w-full"
              trigger={
                <ConicButton 
                  disabled={isExporting}
                  className="w-full h-14 rounded-2xl shadow-xl shadow-primary/10 overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <Download size={20} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {isExporting ? 'Exporting...' : 'Download'}
                    </span>
                    <ChevronDown size={14} className="text-slate-500" />
                  </div>
                </ConicButton>
              }
              items={[
                { label: 'High Quality (PNG)', icon: Download, onClick: () => handleExport('png', 2), description: 'Best for digital use' },
                { label: 'Vector (SVG)', icon: ShieldCheck, onClick: () => handleExport('svg'), description: 'Infinite scalability' },
                { label: 'Document (PDF)', icon: Layout, onClick: () => handleExport('pdf'), description: 'Print-ready format' },
                { label: 'Small File (PNG)', icon: History, onClick: () => handleExport('low-png'), description: 'Lightweight & compressed' },
                { label: 'Copy to Clipboard', icon: Copy, onClick: () => handleCopy(), description: 'Paste anywhere instantly' },
              ]}
            />
          </div>
        </aside>
      </main>

      {/* History Modal Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex flex-col pt-safe"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Design Log</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Your recent creations</p>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Close"
              >
                <ArrowLeft size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth overscroll-contain">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-40">
                  <History size={64} strokeWidth={1} />
                  <p className="text-sm font-medium uppercase tracking-widest">No archives found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {history.map((entry) => (
                    <Tooltip key={entry.id} content="Restore this design" className="w-full">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setConfig(entry.config);
                          setShowHistory(false);
                          setToast('Design restored');
                        }}
                        className="group cursor-pointer flex flex-col w-full"
                      >
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-white/10 relative shadow-lg group-hover:shadow-primary/20 transition-all">
                          <img 
                            src={entry.preview} 
                            alt="QR Preview" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CheckCircle2 className="text-white drop-shadow-lg" size={32} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between px-1">
                          <p className="text-[10px] font-bold truncate text-slate-400 capitalize">
                            {entry.config.type}
                          </p>
                          <span className="text-[8px] font-bold text-slate-600">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 flex justify-center bg-black/50">
              <Tooltip content="Irreversibly delete all saved designs" direction="top">
                <button 
                  onClick={clearHistory}
                  disabled={history.length === 0}
                  className="px-8 py-4 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:grayscale group"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  Purge All Designs
                </button>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS Overrides */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pt-safe { padding-top: env(safe-area-inset-top); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        
        * {
          -webkit-overflow-scrolling: touch;
        }

        html, body {
          overscroll-behavior: none;
          scroll-behavior: smooth;
        }

        .qr-render-container > canvas, .qr-render-container > svg {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}
