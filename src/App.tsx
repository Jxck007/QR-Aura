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
  Zap,
  Trees,
  FileText,
  Upload,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCodeStyling from 'qr-code-styling';
import html2canvas from 'html2canvas';
import { cn } from './lib/utils';
import { QRConfig, QRType, DotStyle, CornerStyle, HistoryEntry } from './types';
import { DEFAULT_CONFIG, QR_TYPES, DOT_STYLES, CORNER_STYLES, SKINS, FONT_OPTIONS } from './constants';
import { FloatingParticles } from './components/FloatingParticles';
import { ConicButton, LiquidMetalLogo, TypewriterText, SmoothTabs, InputGroup } from './components/EnhancedUI';
import { auth, db, storage } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [config, setConfig] = useState<QRConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'colors' | 'logo' | 'label' | 'skins'>('content');
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [qrInstance, setQrInstance] = useState<QRCodeStyling | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Force dark mode on document
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const resetToDefault = (section?: string) => {
    if (!section) {
      setConfig(DEFAULT_CONFIG);
      setToast('Configuration reset');
    } else {
      // Functional reset for sections
      if (section === 'design') {
        updateConfig({ 
          dots: DEFAULT_CONFIG.dots, 
          corners: DEFAULT_CONFIG.corners,
          background: DEFAULT_CONFIG.background
        });
      } else if (section === 'frame') {
        updateConfig({ frame: DEFAULT_CONFIG.frame });
      } else if (section === 'colors') {
        updateConfig({ 
          dots: { ...config.dots, color: DEFAULT_CONFIG.dots.color, gradient: DEFAULT_CONFIG.dots.gradient },
          background: DEFAULT_CONFIG.background,
          frame: { ...config.frame, backgroundColor: DEFAULT_CONFIG.frame.backgroundColor, borderColor: DEFAULT_CONFIG.frame.borderColor, color: DEFAULT_CONFIG.frame.color }
        });
      }
      setToast(`Reset ${section} settings`);
    }
    setTimeout(() => setToast(null), 3000);
  };
  
  const qrContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null && qrInstance) {
      console.log("Appending QR instance to node");
      node.innerHTML = '';
      qrInstance.append(node);
    }
  }, [qrInstance]);

  const qrStyling = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('lucidqr_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    // Theme is now forced to dark
    document.documentElement.classList.add('dark');

    // Migration: If the default color is still the old blue, reset it to white for Aura theme
    setConfig(prev => {
      if (prev.dots.color === '#061fd0') {
        return {
          ...prev,
          dots: { ...prev.dots, color: '#ffffff' },
          corners: { ...prev.corners, color: '#ffffff' },
          frame: { ...prev.frame, color: '#ffffff' },
          background: { ...prev.background, transparent: true }
        };
      }
      return prev;
    });

      // Initial Engine Setup with 404 Resilience
      const instance = new QRCodeStyling({
        width: 320,
        height: 320,
        data: config.content,
        margin: config.margin,
        qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: config.errorCorrectionLevel },
        imageOptions: { crossOrigin: 'anonymous', margin: 10 }
      });

      console.log("QR Engine Initialized: Setting instance...");
      qrStyling.current = instance;
      setQrInstance(instance);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        // Create/Update user doc
        const userDoc = doc(db, 'users', u.uid);
        setDoc(userDoc, {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          createdAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`));
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Sync History from Firestore ---
  useEffect(() => {
    if (!user || !isAuthReady) return;

    const q = query(
      collection(db, 'qrcodes'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry));
      setHistory(docs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'qrcodes'));

    return () => unsubscribe();
  }, [user, isAuthReady]);

  // --- Smart Content Detection ---
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
      setToast(`Switched to ${detected.toUpperCase()} mode`);
      setTimeout(() => setToast(null), 2000);
    } else {
      updateConfig({ content: val });
    }
  };

  // --- Update QR ---
  useEffect(() => {
    if (!qrInstance) return;
    
    setIsRegenerating(true);
    const timer = setTimeout(() => {
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
          data: config.content || 'https://lucidqr.com',
          dotsOptions,
          backgroundOptions: { 
            color: (config.skin && config.skin !== 'none') ? 'transparent' : (config.background.transparent ? 'transparent' : config.background.color) 
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
          image: (config.logo?.src === '/logo.png') ? undefined : config.logo?.src,
          imageOptions: {
            hideBackgroundDots: config.logo?.hideBackgroundDots,
            imageSize: (config.logo?.size || 30) / 100,
            margin: config.logo?.margin || 0,
            crossOrigin: 'anonymous'
          }
        });
        console.log("QR Engine Updated Successfully");
      } catch (err) {
        console.error("QR Styling Update Failed", err);
      } finally {
        setIsRegenerating(false);
        console.log("Regeneration state finished");
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [config, qrInstance]);

  // --- Actions ---
  const handleFileUpload = async (file: File) => {
    if (!user) {
      setToast('Please login to upload files');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToast('File too large (max 10MB)');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleContentChange(url);
      setToast('File uploaded to Aura Cloud');
    } catch (err) {
      console.error(err);
      setToast('Upload failed');
    } finally {
      setIsUploading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

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

  const handleExport = async (ext: 'png' | 'svg', customSize?: number) => {
    if (!previewRef.current) return;
    
    setIsExporting(true);
    setToast('Generating high-res export...');

    try {
      if (ext === 'svg' && qrStyling.current) {
        // SVG export still uses the engine because html2canvas produces raster
        const size = customSize || config.size;
        await qrStyling.current.update({ width: size, height: size });
        qrStyling.current.download({ name: `lucid-qr-${Date.now()}`, extension: 'svg' });
      } else {
        // PNG export captures the ENTIRE style using html2canvas
        const canvas = await html2canvas(previewRef.current, {
          scale: 4, // High resolution
          useCORS: true,
          backgroundColor: null,
          logging: false,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.getElementsByTagName('*');
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i] as HTMLElement;
              const style = window.getComputedStyle(el);
              const isUnsupported = (val: string) => val.includes('oklch') || val.includes('oklab');
              
              if (isUnsupported(style.boxShadow || '')) el.style.boxShadow = 'none';
              
              if (isUnsupported(style.color || '')) {
                el.style.color = '#ffffff';
              }

              // CRITICAL: Force background capture for skins
              if (el.style.background || el.style.backgroundImage) {
                // Keep the inline styles we set in React (they use hex)
              } else if (isUnsupported(style.backgroundColor || '')) {
                const classList = el.className;
                if (classList.includes('bg-white')) el.style.backgroundColor = '#ffffff';
                else if (classList.includes('bg-black')) el.style.backgroundColor = '#000000';
                else if (classList.includes('bg-primary')) el.style.backgroundColor = '#00ffcc';
                else el.style.backgroundColor = 'transparent';
              }

              if (isUnsupported(style.borderColor || '')) {
                if (el.className.includes('border-primary')) el.style.borderColor = '#00ffcc';
                else el.style.borderColor = 'transparent';
              }
              
              // Remove any oklch from pseudo elements if possible (though html2canvas usually ignores them)
            }
          }
        });

        const link = document.createElement('a');
        link.download = `aura-qr-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      // Save to History (using the engine for the thumbnail to keep it small)
      if (qrStyling.current) {
        const blob = await qrStyling.current.getRawData('png') as Blob;
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const thumbnail = reader.result as string;
            if (user) {
              await addDoc(collection(db, 'qrcodes'), {
                userId: user.uid,
                timestamp: Date.now(),
                contentType: config.type,
                value: config.content,
                thumbnail,
                config: JSON.parse(JSON.stringify(config))
              });
            }
          };
        }
      }
      
      setToast('Export complete!');
    } catch (err) {
      console.error("Export failed", err);
      setToast('Export failed. Check CORS or network.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setToast(null), 3000);
      // Reset preview size in engine if we touched it
      if (ext === 'svg') {
        setTimeout(() => qrStyling.current?.update({ width: 320, height: 320 }), 500);
      }
    }
  };

  const handleCopy = async () => {
    if (!previewRef.current) return;
    setToast('Preparing high-res copy...');
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            const isUnsupported = (val: string) => val.includes('oklch') || val.includes('oklab');

            if (isUnsupported(style.boxShadow || '')) el.style.boxShadow = 'none';
            
            if (isUnsupported(style.color || '')) {
              el.style.color = '#ffffff';
            }

            if (el.style.background || el.style.backgroundImage) {
              // Keep our hex-based gradients
            } else if (isUnsupported(style.backgroundColor || '')) {
              const classList = el.className;
              if (classList.includes('bg-white')) el.style.backgroundColor = '#ffffff';
              else if (classList.includes('bg-black')) el.style.backgroundColor = '#000000';
              else el.style.backgroundColor = 'transparent';
            }

            if (isUnsupported(style.borderColor || '')) {
              if (el.className.includes('border-primary')) el.style.borderColor = '#00ffcc';
              else el.style.borderColor = '#ffffff';
            }
          }
        }
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setToast('Styles copied to clipboard!');
        }
      }, 'image/png');
    } catch (err) {
      console.error("Copy failed", err);
      setToast('Copy failed.');
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const updateConfig = (updates: Partial<QRConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      
      // Auto-detect type if generic content changes
      if (updates.content && !updates.type) {
        const detectedType = detectContentType(updates.content);
        if (detectedType && detectedType !== prev.type) {
          next.type = detectedType as QRType;
        }
      }

      // Auto-generate content based on specialized fields
      if (next.type === 'wifi') {
        next.content = `WIFI:S:${next.ssid || ''};T:${next.encryption || 'WPA'};P:${next.password || ''};H:${next.hidden ? 'true' : 'false'};;`;
      } else if (next.type === 'phone') {
        next.content = `tel:${next.phone || ''}`;
      } else if (next.type === 'email') {
        const params = new URLSearchParams();
        if (next.subject) params.append('subject', next.subject);
        if (next.body) params.append('body', next.body);
        const query = params.toString() ? `?${params.toString()}` : '';
        next.content = `mailto:${next.email || ''}${query}`;
      } else if (next.type === 'vcard') {
        next.content = `BEGIN:VCARD\nVERSION:3.0\nN:${next.lastName || ''};${next.firstName || ''}\nFN:${next.firstName || ''} ${next.lastName || ''}\nORG:${next.organization || ''}\nTEL;TYPE=WORK,VOICE:${next.vCardPhone || ''}\nEMAIL;TYPE=PREF,INTERNET:${next.vCardEmail || ''}\nURL:${next.vCardUrl || ''}\nEND:VCARD`;
      }

      return next;
    });
  };
  const clearHistory = async () => {
    if (user) {
      try {
        const q = query(collection(db, 'qrcodes'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const batch: Promise<any>[] = [];
        snapshot.docs.forEach(d => batch.push(deleteDoc(doc(db, 'qrcodes', d.id))));
        await Promise.all(batch);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'qrcodes');
      }
    } else {
      setHistory([]);
      localStorage.removeItem('lucidqr_history');
    }
  };

  // --- Render Helpers ---
  const SectionHeader = ({ title, onReset }: { title: string; onReset?: () => void }) => (
    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4 mt-8 first:mt-0 border-b border-slate-800 pb-2">
      <span>{title}</span>
      {onReset && (
        <button 
          onClick={onReset}
          className="p-1 hover:bg-white/5 rounded-md transition-colors text-slate-500 hover:text-primary group"
          title="Reset Section"
        >
          <RotateCcw size={12} className="group-active:rotate-[-90deg] transition-transform" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black dark font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-black z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border border-slate-800">
            <img src="/logo.png" alt="QR Aura" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <LiquidMetalLogo className="text-xl font-black tracking-tighter leading-none">
              QR Aura
            </LiquidMetalLogo>
            <span className="text-[9px] font-bold text-primary/80 uppercase tracking-[0.2em] mt-0.5">
              <TypewriterText text="Generate the Invisible • Craft Your Aura" delay={1.5} repeat={true} />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => resetToDefault()}
            className="h-9 px-4 rounded-xl border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Restore Defaults
          </button>

          {!isAuthReady ? (
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-900 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">{user.displayName}</span>
                <button 
                  onClick={() => signOut(auth)}
                  className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 hover:opacity-70 transition-opacity"
                >
                  Logout
                </button>
              </div>
              <img src={user.photoURL || ''} alt="avatar" className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <button 
              onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
              className="h-10 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Preview Panel - First on Mobile */}
        <main className="flex-1 bg-black p-6 md:p-12 flex flex-col items-center justify-center overflow-y-auto order-first md:order-none relative">
          <FloatingParticles />
          
          <AnimatePresence>
            {toast && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-8 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl z-50 flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="text-green-400" />
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-md flex flex-col items-center">
            {/* QR Container */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                         <motion.div 
                ref={previewRef}
                className={cn(
                  "relative transition-all duration-300 flex flex-col items-center justify-center overflow-hidden"
                )}
                style={{
                  backgroundColor: config.frame.style !== 'none' ? config.frame.backgroundColor : 'transparent',
                  borderColor: config.frame.style !== 'none' ? config.frame.borderColor : 'transparent',
                  borderWidth: config.frame.style !== 'none' ? `${config.frame.borderWidth}px` : '0px',
                  borderRadius: config.frame.style !== 'none' 
                    ? `${config.frame.borderRadius}px`
                    : '0px',
                  padding: config.frame.style !== 'none' ? `${config.frame.padding}px` : '0px',
                  boxShadow: config.frame.shadowIntensity > 0 
                    ? `0 ${config.frame.padding / 2}px ${config.frame.padding}px -${config.frame.padding / 4}px ${config.frame.shadowColor}${Math.round(config.frame.shadowIntensity * 255).toString(16).padStart(2, '0')}` 
                    : 'none'
                }}
              >
                <div 
                  className={cn(
                    "relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl",
                    (!config.skin || config.skin === 'none') && "bg-white"
                  )}
                  style={{
                    background: config.skin === 'cherry' ? 'linear-gradient(135deg, #fff5f7 0%, #ffccd5 100%)' :
                               config.skin === 'wave' ? 'linear-gradient(135deg, #f0f9ff 0%, #7dd3fc 100%)' :
                               config.skin === 'aurora' ? 'linear-gradient(45deg, #00ffcc 0%, #00c6ff 50%, #0072ff 100%)' :
                               config.skin === 'cyberpunk' ? 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)' :
                               config.skin === 'midnight' ? 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' :
                               config.skin === 'sunset' ? 'linear-gradient(180deg, #ff7e5f 0%, #feb47b 100%)' :
                               config.skin === 'forest' ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' :
                               undefined
                  }}
                >
                  {/* Skin Background Effects */}
                  {config.skin === 'cherry' && (
                    <div className="absolute inset-0 pointer-events-none opacity-40">
                      {[1,2,3,4,5,6,7,8].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            y: [0, 20, 0], 
                            rotate: [0, 45, 0],
                            opacity: [0.2, 0.5, 0.2]
                          }}
                          transition={{ repeat: Infinity, duration: 4 + i, delay: i * 0.5 }}
                          className="absolute text-pink-400"
                          style={{ top: `${(i*13)%100}%`, left: `${(i*17)%100}%` }}
                        >
                          <Flower2 size={24} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                  {config.skin === 'cyberpunk' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,204,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      <motion.div 
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="absolute inset-0 bg-[#f0f]/5"
                      />
                    </div>
                  )}
                  {config.skin === 'wave' && (
                    <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                      <motion.div 
                        animate={{ y: [0, -10, 0], x: [-5, 5, -5] }} 
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-t from-blue-400/20 to-transparent"
                      >
                         <Waves className="absolute bottom-0 w-full h-20 opacity-30 text-blue-500" />
                      </motion.div>
                    </div>
                  )}
                  {config.skin === 'aurora' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div 
                        animate={{ 
                          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-emerald-500/30 to-blue-500/30 blur-3xl scale-150"
                      />
                    </div>
                  )}
                  {config.skin === 'midnight' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.1),_transparent_70%)]" />
                      {[...Array(30)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.2, 0.8, 0.2] }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1 + Math.random() * 2,
                            delay: Math.random() * 2
                          }}
                          className="absolute w-0.5 h-0.5 bg-white rounded-full"
                          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  )}
                  {config.skin === 'sunset' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }} 
                        transition={{ repeat: Infinity, duration: 8 }}
                        className="absolute top-10 left-10 w-40 h-40 bg-orange-400 blur-[60px] rounded-full opacity-40"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-600/20 to-transparent" />
                    </div>
                  )}
                  {config.skin === 'forest' && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                      {[...Array(6)].map((_, i) => (
                        <Trees 
                          key={i} 
                          className="absolute" 
                          style={{ 
                            bottom: `${Math.random() * 20}%`, 
                            left: `${Math.random() * 100}%`,
                            opacity: 0.3 + Math.random() * 0.5
                          }} 
                          size={48 + i * 10} 
                          color="#1b4332" 
                        />
                      ))}
                    </div>
                  )}
                  {/* QR Core Container - Stays mounted to preserve instance reference */}
                  <div 
                    ref={qrContainerRef} 
                    className={cn(
                      "w-full h-full flex items-center justify-center transition-opacity duration-200 relative z-20",
                      (isRegenerating || !config.content) ? "opacity-30 blur-sm" : "opacity-100" // Reduced hiding during regen to prove it's there
                    )} 
                  />

                  <AnimatePresence>
                    {isRegenerating && (
                      <motion.div 
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center z-10"
                      >
                        <QrCode className="text-slate-300 dark:text-zinc-700 w-20 h-20" />
                      </motion.div>
                    )}
                    {!config.content && !isRegenerating && (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 z-10"
                      >
                        <QrCode size={48} strokeWidth={1} />
                        <p className="text-xs font-medium">Enter content to generate</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {config.frame.text && (
                  <div className="mt-2 w-full text-center py-1 px-4">
                    <p 
                      className="font-black tracking-tight uppercase"
                      style={{ 
                        fontSize: `${config.frame.fontSize}px`,
                        color: config.frame.color,
                        fontFamily: config.frame.fontFamily
                      }}
                    >
                      {config.frame.text}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 w-full max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group/export">
                  <ConicButton 
                    borderColor={config.dots.color}
                    className="h-14 w-full rounded-2xl shadow-lg shadow-primary/25"
                  >
                    <Download size={20} className="text-slate-900 dark:text-white" /> 
                    <span className="font-bold ml-2 text-slate-900 dark:text-white">Download</span>
                    <ChevronDown size={16} className="opacity-60 ml-1 text-slate-900 dark:text-white" />
                  </ConicButton>
                  
                  {/* Dropdown menu */}
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-[60] overflow-hidden translate-y-2 group-hover/export:translate-y-0">
                    <button 
                      onClick={() => handleExport('png')}
                      className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-900 dark:text-white flex items-center justify-between transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>PNG (Standard)</span>
                        <span className="text-[10px] opacity-50 uppercase tracking-tighter">Solid Background</span>
                      </div>
                      <span className="text-[10px] opacity-70 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{config.size}px</span>
                    </button>
                    <button 
                      onClick={() => handleExport('png', 1024)}
                      className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-900 dark:text-white flex items-center justify-between transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>PNG (HD)</span>
                        <span className="text-[10px] opacity-50 uppercase tracking-tighter">Premium Resolution</span>
                      </div>
                      <span className="text-[10px] opacity-70 bg-primary/10 text-primary px-2 py-1 rounded-md">1024px</span>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1 mx-4" />
                    <button 
                      onClick={() => handleExport('svg')}
                      className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-900 dark:text-white flex items-center justify-between transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>SVG (Vector)</span>
                        <span className="text-[10px] opacity-50 uppercase tracking-tighter">Infinite Polish</span>
                      </div>
                      <span className="text-[10px] opacity-70 bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded-md">∞</span>
                    </button>
                  </div>
                </div>

                <ConicButton 
                  onClick={handleCopy}
                  borderColor="#334155"
                  className="h-14 rounded-2xl shadow-sm"
                >
                  <Copy size={20} className="text-slate-900 dark:text-white" />
                  <span className="font-bold ml-2 text-slate-900 dark:text-white">Copy Image</span>
                </ConicButton>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-medium">
                High resolution exports may take a few seconds to process.
              </p>
            </div>
          </div>
        </main>

        {/* Config Sidebar */}
        <aside className="w-full md:w-[400px] bg-white dark:bg-black border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Main Tab Area */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <SmoothTabs 
              tabs={[
                { id: 'content', icon: Type, label: 'Content' },
                { id: 'design', icon: Palette, label: 'Design' },
                { id: 'skins', icon: Sparkles, label: 'Skins' },
                { id: 'colors', icon: Palette, label: 'Colors' },
                { id: 'logo', icon: ImageIcon, label: 'Logo' },
                { id: 'label', icon: Layout, label: 'Frame' }
              ]} 
              activeTab={activeTab} 
              onChange={(id) => setActiveTab(id as any)} 
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'content' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Content Type" onReset={() => updateConfig({ type: DEFAULT_CONFIG.type })} />
                  <div className="grid grid-cols-3 gap-2">
                    {QR_TYPES.map(type => {
                      const Icon = { Link: LinkIcon, Type, Wifi, Mail, Phone, User, FileText, Image: ImageIcon }[type.icon] as any;
                      return (
                        <button
                          key={type.id}
                          onClick={() => updateConfig({ type: type.id as QRType })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-h-[72px]",
                            config.type === type.id 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-slate-800 text-slate-500 hover:border-slate-700"
                          )}
                        >
                          <Icon size={20} />
                          <span className="text-[10px] font-bold">{type.label}</span>
                        </button>
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
                    {(config.type === 'file' || config.type === 'image') && (
                      <div className="space-y-4">
                        <InputGroup label={config.type === 'image' ? "Select Image" : "Select File"}>
                          <div className="flex flex-col gap-3 py-2">
                            <div 
                              onClick={() => {
                                if (!user) {
                                  signInWithPopup(auth, new GoogleAuthProvider());
                                  return;
                                }
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = config.type === 'image' ? 'image/*' : '*/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) handleFileUpload(file);
                                };
                                input.click();
                              }}
                              className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
                            >
                              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                {isUploading ? (
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Upload size={24} className="text-slate-400 dark:text-zinc-500 group-hover:text-primary" />
                                )}
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold dark:text-white">{isUploading ? "Uploading..." : "Click to upload"}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 10MB</p>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100 dark:border-zinc-800" />
                              </div>
                              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                                <span className="bg-white dark:bg-black px-2 tracking-widest">Or enter link</span>
                              </div>
                            </div>
                            
                            <input 
                              className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl px-4 text-sm outline-none dark:text-white"
                              placeholder={config.type === 'image' ? "https://example.com/image.png" : "https://example.com/file.pdf"}
                              value={config.content}
                              onChange={(e) => handleContentChange(e.target.value)}
                            />
                          </div>
                        </InputGroup>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic px-1">
                          Files are hosted on our secure aura cloud. Links generated are private and permanent.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'design' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Dot Pattern" onReset={() => updateConfig({ dots: { ...config.dots, type: DEFAULT_CONFIG.dots.type } })} />
                  <div className="grid grid-cols-3 gap-3">
                    {DOT_STYLES.map(style => {
                      const Icon = { Square, Circle, CircleDot, Grid2X2, Diamond, Waves, Flower2 }[style.icon] as any;
                      return (
                        <button
                          key={style.id}
                          onClick={() => updateConfig({ dots: { ...config.dots, type: style.id as DotStyle } })}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                            config.dots.type === style.id 
                              ? "border-primary bg-primary/5 text-primary scale-[1.04]" 
                              : "border-slate-800 text-slate-500 hover:border-slate-700"
                          )}
                        >
                          <Icon size={24} />
                          <span className="text-[10px] font-bold">{style.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <SectionHeader title="Corner Style" onReset={() => updateConfig({ corners: { ...config.corners, type: DEFAULT_CONFIG.corners.type } })} />
                  <div className="grid grid-cols-2 gap-3">
                    {CORNER_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => updateConfig({ corners: { ...config.corners, type: style.id as CornerStyle } })}
                        className={cn(
                          "h-12 rounded-xl border-2 font-bold text-xs transition-all",
                          config.corners.type === style.id 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>

                </motion.div>
              )}

              {activeTab === 'skins' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Premium Skins" onReset={() => updateConfig({ skin: DEFAULT_CONFIG.skin })} />
                  <div className="grid grid-cols-2 gap-3">
                    {SKINS.map(skin => {
                      const Icon = { Square, Flower2, Waves, Sparkles, Zap, Moon, Sun, Trees }[skin.icon] as any;
                      return (
                        <button
                          key={skin.id}
                          onClick={() => updateConfig({ skin: skin.id as any })}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all relative overflow-hidden group text-center",
                            config.skin === skin.id 
                              ? "border-primary bg-primary/5 text-primary" 
                              : "border-slate-800 text-slate-500 hover:border-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20",
                            skin.id === 'cherry' && "bg-[#ffccd5]",
                            skin.id === 'wave' && "bg-[#7dd3fc]",
                            skin.id === 'aurora' && "bg-[#00ffcc]",
                            skin.id === 'cyberpunk' && "bg-[#f0f]",
                            skin.id === 'midnight' && "bg-slate-900",
                            skin.id === 'sunset' && "bg-orange-400",
                            skin.id === 'forest' && "bg-green-600"
                          )} />
                          <Icon size={24} className="relative z-10" />
                          <span className="text-xs font-bold relative z-10">{skin.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Skins apply atmospheric backgrounds to your QR code.
                  </p>
                </motion.div>
              )}

              {activeTab === 'colors' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Solid Colors" onReset={() => updateConfig({ dots: { ...config.dots, color: DEFAULT_CONFIG.dots.color }, corners: { ...config.corners, color: DEFAULT_CONFIG.corners.color }, background: { ...config.background, color: DEFAULT_CONFIG.background.color } })} />
                  <div className="space-y-3">
                    <InputGroup label="Dots & Corners">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          className="flex-1 h-9 bg-transparent border-none text-[10px] font-mono px-2 text-white focus:ring-0 outline-none"
                          value={config.dots.color}
                          onChange={(e) => updateConfig({ 
                            dots: { ...config.dots, color: e.target.value },
                            corners: { ...config.corners, color: e.target.value },
                            frame: { ...config.frame, color: e.target.value }
                          })}
                        />
                        <div className="w-8 h-8 rounded-lg border border-slate-700 relative overflow-hidden shrink-0">
                          <input 
                            type="color" 
                            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                            value={config.dots.color}
                            onChange={(e) => updateConfig({ 
                              dots: { ...config.dots, color: e.target.value },
                              corners: { ...config.corners, color: e.target.value },
                              frame: { ...config.frame, color: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </InputGroup>

                    <InputGroup label="Canvas Background">
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          className="flex-1 h-9 bg-transparent border-none text-[10px] font-mono px-2 text-white focus:ring-0 outline-none"
                          value={config.background.color}
                          onChange={(e) => updateConfig({ background: { ...config.background, color: e.target.value } })}
                        />
                        <div className="w-8 h-8 rounded-lg border border-slate-700 relative overflow-hidden shrink-0">
                          <input 
                            type="color" 
                            className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                            value={config.background.color}
                            onChange={(e) => updateConfig({ background: { ...config.background, color: e.target.value } })}
                          />
                        </div>
                      </div>
                    </InputGroup>
                  </div>

                  <SectionHeader title="Gradient Mode" onReset={() => updateConfig({ dots: { ...config.dots, gradient: DEFAULT_CONFIG.dots.gradient } })} />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Enable Gradient</span>
                      <button 
                        onClick={() => updateConfig({ dots: { ...config.dots, gradient: { ...config.dots.gradient!, enabled: !config.dots.gradient?.enabled } } })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          config.dots.gradient?.enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all", config.dots.gradient?.enabled ? "translate-x-6" : "translate-x-0")} />
                      </button>
                    </div>

                    {config.dots.gradient?.enabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Color 1</span>
                            <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={config.dots.gradient.color1} onChange={(e) => updateConfig({ dots: { ...config.dots, gradient: { ...config.dots.gradient!, color1: e.target.value } } })} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Color 2</span>
                            <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={config.dots.gradient.color2} onChange={(e) => updateConfig({ dots: { ...config.dots, gradient: { ...config.dots.gradient!, color2: e.target.value } } })} />
                          </div>
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
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 h-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            <ImageIcon size={14} /> Upload Image
                          </button>
                          {config.logo?.src && (
                            <button 
                              onClick={() => updateConfig({ logo: { ...config.logo!, src: '' } })}
                              className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </InputGroup>
                    
                    <InputGroup label={`Scale: ${config.logo?.size || 30}%`}>
                      <input type="range" min="10" max="50" value={config.logo?.size || 30} onChange={(e) => updateConfig({ logo: { ...config.logo!, size: parseInt(e.target.value) } })} className="w-full accent-primary h-6" />
                    </InputGroup>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] font-bold dark:text-white">Clear behind logo</span>
                      <button 
                        onClick={() => updateConfig({ logo: { ...config.logo!, hideBackgroundDots: !config.logo?.hideBackgroundDots } })}
                        className={cn("w-10 h-5 rounded-full relative transition-all", config.logo?.hideBackgroundDots ? "bg-primary" : "bg-slate-200 dark:bg-zinc-800")}
                      >
                        <div className={cn("absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all", config.logo?.hideBackgroundDots ? "translate-x-5" : "translate-x-0")} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'label' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <SectionHeader title="Frame Layout" onReset={() => updateConfig({ frame: { ...config.frame, style: DEFAULT_CONFIG.frame.style } })} />
                  <div className="grid grid-cols-3 gap-3">
                    {['none', 'border', 'card'].map(style => (
                      <button
                        key={style}
                        onClick={() => updateConfig({ frame: { ...config.frame, style: style as any } })}
                        className={cn(
                          "h-12 rounded-xl border-2 font-bold text-xs transition-all capitalize",
                          config.frame.style === style 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-slate-800 text-slate-500 hover:border-slate-700"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  <SectionHeader title="Label Content" onReset={() => updateConfig({ frame: { ...config.frame, text: DEFAULT_CONFIG.frame.text, fontSize: DEFAULT_CONFIG.frame.fontSize, color: DEFAULT_CONFIG.frame.color, fontFamily: DEFAULT_CONFIG.frame.fontFamily } })} />
                  <div className="space-y-4">
                    <InputGroup label="Tagline Text">
                      <input 
                        className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm outline-none text-white focus:border-primary/50 transition-colors"
                        placeholder="SCAN ME"
                        value={config.frame.text}
                        onChange={(e) => updateConfig({ frame: { ...config.frame, text: e.target.value } })}
                      />
                    </InputGroup>

                    <div className="grid grid-cols-2 gap-3">
                      <InputGroup label="Text Font">
                        <select 
                          className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-2 text-sm outline-none text-white cursor-pointer focus:border-primary/50 transition-colors"
                          value={config.frame.fontFamily}
                          onChange={(e) => updateConfig({ frame: { ...config.frame, fontFamily: e.target.value } })}
                        >
                          {FONT_OPTIONS.map(font => (
                            <option key={font.id} value={font.id} className="bg-black">{font.label}</option>
                          ))}
                        </select>
                      </InputGroup>

                      <InputGroup label="Text Color">
                        <div className="flex items-center gap-2 h-9 px-1">
                          <input 
                            type="text" 
                            className="flex-1 bg-transparent border-none text-[10px] font-mono text-white focus:ring-0 outline-none"
                            value={config.frame.color}
                            onChange={(e) => updateConfig({ frame: { ...config.frame, color: e.target.value } })}
                          />
                          <div className="w-6 h-6 rounded border border-slate-700 relative overflow-hidden shrink-0">
                            <input 
                              type="color" 
                              className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                              value={config.frame.color}
                              onChange={(e) => updateConfig({ frame: { ...config.frame, color: e.target.value } })}
                            />
                          </div>
                        </div>
                      </InputGroup>
                    </div>

                    <InputGroup label={`Text Size: ${config.frame.fontSize}px`}>
                      <input type="range" min="8" max="48" value={config.frame.fontSize} onChange={(e) => updateConfig({ frame: { ...config.frame, fontSize: parseInt(e.target.value) } })} className="w-full accent-primary h-6" />
                    </InputGroup>
                  </div>

                  {config.frame.style !== 'none' && (
                    <>
                      <SectionHeader title="Frame Aesthetics" onReset={() => updateConfig({ frame: { ...config.frame, backgroundColor: DEFAULT_CONFIG.frame.backgroundColor, borderColor: DEFAULT_CONFIG.frame.borderColor, borderRadius: DEFAULT_CONFIG.frame.borderRadius, borderWidth: DEFAULT_CONFIG.frame.borderWidth, padding: DEFAULT_CONFIG.frame.padding, shadowColor: DEFAULT_CONFIG.frame.shadowColor, shadowIntensity: DEFAULT_CONFIG.frame.shadowIntensity } })} />
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <InputGroup label="Card BG">
                            <div className="flex items-center gap-2 h-9 px-1">
                              <input 
                                type="text" 
                                className="flex-1 bg-transparent border-none text-[10px] font-mono text-white focus:ring-0 outline-none"
                                value={config.frame.backgroundColor}
                                onChange={(e) => updateConfig({ frame: { ...config.frame, backgroundColor: e.target.value } })}
                              />
                              <div className="w-6 h-6 rounded border border-slate-700 relative overflow-hidden shrink-0">
                                <input 
                                  type="color" 
                                  className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                                  value={config.frame.backgroundColor}
                                  onChange={(e) => updateConfig({ frame: { ...config.frame, backgroundColor: e.target.value } })}
                                />
                              </div>
                            </div>
                          </InputGroup>

                          <InputGroup label="Border Color">
                            <div className="flex items-center gap-2 h-9 px-1">
                              <input 
                                type="text" 
                                className="flex-1 bg-transparent border-none text-[10px] font-mono text-white focus:ring-0 outline-none"
                                value={config.frame.borderColor}
                                onChange={(e) => updateConfig({ frame: { ...config.frame, borderColor: e.target.value } })}
                              />
                              <div className="w-6 h-6 rounded border border-slate-700 relative overflow-hidden shrink-0">
                                <input 
                                  type="color" 
                                  className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                                  value={config.frame.borderColor}
                                  onChange={(e) => updateConfig({ frame: { ...config.frame, borderColor: e.target.value } })}
                                />
                              </div>
                            </div>
                          </InputGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <InputGroup label={`Corner: ${config.frame.borderRadius}px`}>
                            <input type="range" min="0" max="100" value={config.frame.borderRadius} onChange={(e) => updateConfig({ frame: { ...config.frame, borderRadius: parseInt(e.target.value) } })} className="w-full accent-primary h-6" />
                          </InputGroup>
                          <InputGroup label={`Border: ${config.frame.borderWidth}px`}>
                            <input type="range" min="0" max="20" value={config.frame.borderWidth} onChange={(e) => updateConfig({ frame: { ...config.frame, borderWidth: parseInt(e.target.value) } })} className="w-full accent-primary h-6" />
                          </InputGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                           <InputGroup label={`Padding: ${config.frame.padding}px`}>
                            <input type="range" min="4" max="80" value={config.frame.padding} onChange={(e) => updateConfig({ frame: { ...config.frame, padding: parseInt(e.target.value) } })} className="w-full accent-primary h-6" />
                          </InputGroup>
                          <InputGroup label={`Shadow: ${Math.round(config.frame.shadowIntensity * 100)}%`}>
                            <input type="range" min="0" max="100" value={config.frame.shadowIntensity * 100} onChange={(e) => updateConfig({ frame: { ...config.frame, shadowIntensity: parseInt(e.target.value) / 100 } })} className="w-full accent-primary h-6" />
                          </InputGroup>
                        </div>

                        <InputGroup label="Shadow Color">
                          <div className="flex items-center gap-2 h-9 px-1">
                            <input 
                              type="text" 
                              className="flex-1 bg-transparent border-none text-[10px] font-mono text-white focus:ring-0 outline-none"
                              value={config.frame.shadowColor}
                              onChange={(e) => updateConfig({ frame: { ...config.frame, shadowColor: e.target.value } })}
                            />
                            <div className="w-6 h-6 rounded border border-slate-700 relative overflow-hidden shrink-0">
                              <input 
                                type="color" 
                                className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer"
                                value={config.frame.shadowColor}
                                onChange={(e) => updateConfig({ frame: { ...config.frame, shadowColor: e.target.value } })}
                              />
                            </div>
                          </div>
                        </InputGroup>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* History Section */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Recent History</span>
                </div>
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      {history.length > 0 ? (
                        <>
                          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {history.map(item => (
                              <button
                                key={item.id}
                                onClick={() => setConfig(item.config)}
                                className="shrink-0 w-24 aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:border-primary transition-colors group relative"
                              >
                                <img src={item.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <span className="text-[8px] text-white font-bold uppercase">Restore</span>
                                </div>
                              </button>
                            ))}
                          </div>
                          <button 
                            onClick={clearHistory}
                            className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={12} /> Clear History
                          </button>
                        </>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No recent codes found.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
