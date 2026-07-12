import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, ShoppingCart, Settings as SettingsIcon, Layers, Users, Shield, 
  Trash2, Edit3, Plus, CheckCircle, XCircle, Clock, Truck, RefreshCw, LogOut, 
  ChevronRight, Save, Upload, Download, FileSpreadsheet, KeyRound, Lock, HelpCircle,
  Paintbrush, Sliders, Tag, Star, Image
} from 'lucide-react';
import { Product, Category, Order, PaymentSettings, AdminStats, WebsiteSettings } from '../types.js';

interface LogoUploaderProps {
  value: string;
  onChange: (value: string) => void;
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
  title: string;
  formats: string;
  recommendedSize: string;
}

function LogoUploader({ value, onChange, addToast, title, formats, recommendedSize }: LogoUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Crop state
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Handle URL change
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    addToast("Asset Link Saved", `${title} URL updated.`, "success");
  };

  // Load image helper
  const processFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.ico')) {
      addToast("Invalid Format", `Supported formats: ${formats}`, "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (file.type.includes('svg') || file.name.endsWith('.ico')) {
        // Direct save without crop for SVG/ICO to preserve vector/format
        onChange(base64);
        addToast("Asset Loaded", `${title} updated successfully.`, "success");
      } else {
        // JPEG/PNG can be cropped
        setRawImage(base64);
        setZoom(1);
        setPosX(0);
        setPosY(0);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Render canvas preview
  useEffect(() => {
    if (!showCropper || !rawImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern behind for transparency helper
      ctx.fillStyle = "#1d1d1f";
      const size = 10;
      for (let i = 0; i < canvas.width; i += size * 2) {
        for (let j = 0; j < canvas.height; j += size * 2) {
          ctx.fillRect(i, j, size, size);
          ctx.fillRect(i + size, j + size, size, size);
        }
      }

      // Calculate source and target coordinates with zoom & pan
      const w = img.width;
      const h = img.height;
      const aspect = w / h;
      
      let drawW = canvas.width;
      let drawH = canvas.height;

      if (aspect > 1) {
        drawH = canvas.width / aspect;
      } else {
        drawW = canvas.height * aspect;
      }

      // Apply zoom
      drawW *= zoom;
      drawH *= zoom;

      const drawX = (canvas.width - drawW) / 2 + posX;
      const drawY = (canvas.height - drawH) / 2 + posY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Draw safe-area grid circular overlay
      ctx.strokeStyle = "rgba(255, 122, 0, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
    };
    img.src = rawImage;
  }, [showCropper, rawImage, zoom, posX, posY]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas) return;
    setPosX(e.clientX - dragStart.x);
    setPosY(e.clientY - dragStart.y);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const applyCrop = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Create output canvas for resizing
    const outputCanvas = document.createElement('canvas');
    const targetDim = title.toLowerCase().includes('favicon') ? 64 : 512;
    outputCanvas.width = targetDim;
    outputCanvas.height = targetDim;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (outputCtx) {
      // Draw zoomed & panned canvas to output canvas
      const img = new window.Image();
      img.onload = () => {
        outputCtx.clearRect(0, 0, targetDim, targetDim);
        
        const w = img.width;
        const h = img.height;
        const aspect = w / h;
        
        let drawW = targetDim;
        let drawH = targetDim;

        if (aspect > 1) {
          drawH = targetDim / aspect;
        } else {
          drawW = targetDim * aspect;
        }

        drawW *= zoom;
        drawH *= zoom;

        // Scale pos
        const scaleFactor = targetDim / canvas.width;
        const drawX = (targetDim - drawW) / 2 + posX * scaleFactor;
        const drawY = (targetDim - drawH) / 2 + posY * scaleFactor;

        outputCtx.drawImage(img, drawX, drawY, drawW, drawH);
        
        const base64Output = outputCanvas.toDataURL('image/png');
        onChange(base64Output);
        setShowCropper(false);
        setRawImage(null);
        addToast("Asset Cropped & Saved", `${title} has been auto-resized and saved.`, "success");
      };
      img.src = rawImage!;
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="space-y-3">
          <div className="relative p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-16 h-16 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img src={value} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="block text-[11px] font-bold text-zinc-300 truncate">{title} Active</span>
                <span className="block text-[9px] font-mono text-zinc-500 truncate max-w-[200px]">{value.startsWith('data:') ? 'Base64 Image Data' : value}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 bg-red-950/20 hover:bg-red-900/40 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all cursor-pointer"
                title="Delete Asset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex border-b border-zinc-900/60">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-[10px] font-display font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'upload' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-zinc-500'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 text-[10px] font-display font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'url' ? 'border-[#FF7A00] text-[#FF7A00]' : 'border-transparent text-zinc-500'
              }`}
            >
              Use Image URL
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
                isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800 bg-zinc-950/30'
              }`}
            >
              <Upload className="w-6 h-6 text-zinc-500 mb-2" />
              <label className="cursor-pointer">
                <span className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide transition-all">
                  Browse Files
                </span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <span className="block text-[9px] text-zinc-500 font-mono mt-2">
                Drag and drop or click to upload
              </span>
              <span className="block text-[8px] text-zinc-600 font-mono mt-1">
                Formats: {formats} • Recommended size: {recommendedSize}
              </span>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://example.com/logo.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-grow px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      )}

      {/* Interactive Canvas Cropper Panel */}
      <AnimatePresence>
        {showCropper && rawImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900/60">
                <span className="font-display font-black text-sm uppercase tracking-wider text-white">Crop & Resize {title}</span>
                <button
                  type="button"
                  onClick={() => { setShowCropper(false); setRawImage(null); }}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-64 h-64 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 select-none">
                  <canvas
                    ref={canvasRef}
                    width={256}
                    height={256}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="w-full h-full cursor-move"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono text-center">
                  Drag the image to adjust position, use slider below to zoom.
                </span>

                <div className="w-full space-y-1 text-left">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-400">
                    <span>ZOOM SCALE</span>
                    <span className="text-orange-500">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-orange-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900/60">
                <button
                  type="button"
                  onClick={() => { setShowCropper(false); setRawImage(null); }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Apply Crop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  refreshData: () => void;
  addToast: (title: string, desc: string, type: 'success' | 'error' | 'info' | 'advancement') => void;
  websiteSettings: WebsiteSettings | null;
  onUpdateSettings: (settings: WebsiteSettings) => void;
}

export default function AdminPanel({ products, categories, refreshData, addToast, websiteSettings, onUpdateSettings }: AdminPanelProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Stats & Management State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'tickets' | 'payments' | 'categories' | 'players' | 'backup' | 'appearance' | 'coupons' | 'reviews' | 'homepage_gallery' | 'live_widgets' | 'branding'>('dashboard');
  const [loadingStats, setLoadingStats] = useState(false);

  // Coupons & Reviews States
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  // Local Appearance Config State
  const [localWebsiteSettings, setLocalWebsiteSettings] = useState<WebsiteSettings | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Support tickets management
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const fetchCoupons = async () => {
    if (!token) return;
    setLoadingCoupons(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(data);
      }
    } catch (err) {
      console.error("Error fetching coupons", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingCoupon) return;

    const isEditing = !!editingCoupon.id;
    const url = isEditing ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingCoupon)
      });
      if (res.ok) {
        addToast(
          isEditing ? "Coupon Updated" : "Coupon Created",
          `Promo code "${editingCoupon.code}" saved successfully.`,
          "success"
        );
        setEditingCoupon(null);
        setIsAddingCoupon(false);
        fetchCoupons();
      } else {
        const d = await res.json();
        addToast("Save Failed", d.error || "Failed to save coupon.", "error");
      }
    } catch (err) {
      addToast("Save Failed", "Network request error.", "error");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!token || !window.confirm("Permanently delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Coupon Deleted", "Promo code deleted successfully.", "success");
        fetchCoupons();
      } else {
        const d = await res.json();
        addToast("Delete Failed", d.error || "Failed to delete coupon.", "error");
      }
    } catch (err) {
      addToast("Error", "Could not complete action.", "error");
    }
  };

  const handleToggleCouponStatus = async (id: string, currentStatus: string) => {
    if (!token) return;
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        addToast("Status Updated", `Coupon status changed to ${newStatus}.`, "success");
        fetchCoupons();
      }
    } catch (err) {
      addToast("Error", "Action failed.", "error");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!token || !window.confirm("Permanently delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Review Deleted", "The review has been moderated.", "success");
        fetchReviews();
      } else {
        const d = await res.json();
        addToast("Delete Failed", d.error || "Failed to delete review.", "error");
      }
    } catch (err) {
      addToast("Error", "Could not complete action.", "error");
    }
  };

  // Edit states
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);

  // Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatMode, setNewCatMode] = useState<'lifesteal' | 'survival'>('lifesteal');

  // Backup / Import JSON string
  const [importJson, setImportJson] = useState('');

  // 1. Authenticate / Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;

    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        addToast("Access Granted", `Welcome back, ${data.username}!`, "advancement");
      } else {
        addToast("Authentication Failed", data.error || "Invalid details.", "error");
      }
    } catch (err) {
      addToast("Server Error", "Cannot connect to server.", "error");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    addToast("Logged Out", "Admin session closed successfully.", "info");
  };

  // 2. Fetch Stats & Settings
  const fetchSupportTickets = async () => {
    if (!token) return;
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/admin/support-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSupportTickets(data);
      }
    } catch (err) {
      console.error("Error fetching tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/support-tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addToast("Ticket Updated", `Status changed to ${status}`, "success");
        fetchSupportTickets();
      } else {
        const d = await res.json();
        addToast("Failed", d.error, "error");
      }
    } catch (err) {
      addToast("Error", "Could not update status.", "error");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!token || !window.confirm("Permanently delete this support ticket?")) return;
    try {
      const res = await fetch(`/api/admin/support-tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Ticket Deleted", "The ticket record has been purged.", "success");
        fetchSupportTickets();
      } else {
        const d = await res.json();
        addToast("Failed", d.error, "error");
      }
    } catch (err) {
      addToast("Error", "Could not delete ticket.", "error");
    }
  };

  const fetchStatsAndSettings = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', { headers });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData);
      } else {
        addToast("Failed to load metrics", statsData.error, "error");
        if (statsRes.status === 401 || statsRes.status === 403) {
          handleLogout();
        }
      }

      // Fetch payment settings
      const payRes = await fetch('/api/admin/settings', { headers });
      const payData = await payRes.json();
      if (payRes.ok) {
        setPaymentSettings(payData);
      }

      // Fetch admin website settings (contains sensitive tokens)
      const webRes = await fetch('/api/admin/website-settings', { headers });
      const webData = await webRes.json();
      if (webRes.ok) {
        setLocalWebsiteSettings(webData);
        if (webData.homepageGalleryImage && webData.homepageGalleryImage.startsWith('http')) {
          setGalleryUrlInput(webData.homepageGalleryImage);
        }
      }
    } catch (err) {
      addToast("Network Error", "Could not synchronize dashboard statistics.", "error");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStatsAndSettings();
      fetchSupportTickets();
      fetchCoupons();
      fetchReviews();
    }
  }, [token]);

  useEffect(() => {
    if (websiteSettings) {
      setLocalWebsiteSettings(websiteSettings);
      if (websiteSettings.homepageGalleryImage && websiteSettings.homepageGalleryImage.startsWith('http')) {
        setGalleryUrlInput(websiteSettings.homepageGalleryImage);
      } else {
        setGalleryUrlInput('');
      }
    }
  }, [websiteSettings]);

  // 3. Order Status Modification
  const handleUpdateOrderStatus = async (orderId: string, status: Order['paymentStatus']) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addToast("Order Updated", `Order status set to ${status.toUpperCase()}`, "success");
        fetchStatsAndSettings();
        refreshData();
      } else {
        const d = await res.json();
        addToast("Failed", d.error, "error");
      }
    } catch (err) {
      addToast("Error", "Could not complete status update.", "error");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this order record?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Order deleted", "The order record has been discarded.", "success");
        fetchStatsAndSettings();
        refreshData();
      }
    } catch (err) {
      addToast("Error", "Could not complete action.", "error");
    }
  };

  // 4. Product Admin actions (Add, Update, Delete)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    const isEditing = !!editingProduct.id;
    const url = isEditing ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        addToast(
          isEditing ? "Product Updated" : "Product Created",
          `${editingProduct.name} saved successfully.`,
          "success"
        );
        setEditingProduct(null);
        setIsAddingProduct(false);
        fetchStatsAndSettings();
        refreshData();
      } else {
        const d = await res.json();
        addToast("Save Failed", d.error, "error");
      }
    } catch (err) {
      addToast("Save Failed", "Network request error.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token || !window.confirm("Permanently delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Product Removed", "The product listing is deleted.", "success");
        fetchStatsAndSettings();
        refreshData();
      }
    } catch (err) {
      addToast("Error", "Could not complete action.", "error");
    }
  };

  const handleToggleProductStatus = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (res.ok) {
        addToast("Status updated", "Product visibility changed.", "success");
        fetchStatsAndSettings();
        refreshData();
      }
    } catch (err) {
      addToast("Error", "Action failed.", "error");
    }
  };

  // 5. Save Payments Settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !paymentSettings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentSettings)
      });
      if (res.ok) {
        addToast("Settings Saved", "Payment configurations updated successfully.", "success");
        fetchStatsAndSettings();
      }
    } catch (err) {
      addToast("Error", "Could not write configurations.", "error");
    }
  };

  // Website Settings handlers
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size: max 10MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      addToast("File Too Large", "Maximum image upload size is 10 MB.", "error");
      return;
    }

    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return null;
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 20;
      });
    }, 150);

    const reader = new FileReader();
    reader.onloadend = () => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
      }, 800);

      const base64 = reader.result as string;
      if (localWebsiteSettings) {
        setLocalWebsiteSettings({ ...localWebsiteSettings, backgroundImage: base64 });
      }
      addToast("Image Processed", "Background image loaded into visual config memory.", "success");
    };
    reader.onerror = () => {
      clearInterval(progressInterval);
      setUploadProgress(null);
      addToast("Processing Error", "Failed to process the uploaded image file.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageProcess = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast("Invalid Format", "Only JPG, PNG and WEBP image files are supported.", "error");
      return;
    }

    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return null;
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + 15;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 600);

        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          if (localWebsiteSettings) {
            setLocalWebsiteSettings({ ...localWebsiteSettings, homepageGalleryImage: optimizedBase64 });
          }
          addToast("Image Optimized", "Gallery showcase banner processed and compressed successfully.", "success");
        }
      };
      img.onerror = () => {
        clearInterval(progressInterval);
        setUploadProgress(null);
        addToast("Load Error", "Failed to parse image data.", "error");
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      clearInterval(progressInterval);
      setUploadProgress(null);
      addToast("Processing Error", "Failed to read the image file.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !localWebsiteSettings) return;

    try {
      const res = await fetch('/api/admin/website-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(localWebsiteSettings)
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Appearance Saved", "Website design settings updated successfully.", "success");
        onUpdateSettings(data);
      } else {
        addToast("Error", data.error || "Failed to save website settings.", "error");
      }
    } catch (err) {
      addToast("Error", "Could not write appearance settings.", "error");
    }
  };

  // Image Upload simulation using simple File-to-Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'qr') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'product' && editingProduct) {
        setEditingProduct({ ...editingProduct, image: base64 });
      } else if (target === 'qr' && paymentSettings) {
        setPaymentSettings({ ...paymentSettings, qrCodeUrl: base64 });
      }
      addToast("Image Uploaded", `${file.name} converted to store data format!`, "success");
    };
    reader.readAsDataURL(file);
  };

  // 6. Categories actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCatName || !newCatSlug) return;
    addToast("Feature Sandbox Only", "Categories can be defined in db.ts config or schema currently.", "info");
  };

  // 7. JSON Bulk Import/Export
  const handleImportProducts = async () => {
    if (!token || !importJson.trim()) return;
    try {
      const parsed = JSON.parse(importJson);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: arr })
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Bulk Import Success", `${data.importedCount} products added!`, "advancement");
        setImportJson('');
        fetchStatsAndSettings();
        refreshData();
      } else {
        addToast("Import failed", data.error, "error");
      }
    } catch (err) {
      addToast("Parse Error", "Invalid JSON format. Check product schema.", "error");
    }
  };

  const handleExportOrders = async () => {
    if (!token) return;
    try {
      window.open(`/api/admin/orders/export?key=${token}`, '_blank');
      addToast("Exporting", "Downloading orders-export.json file.", "info");
    } catch (e) {
      addToast("Failed", "Export failed.", "error");
    }
  };


  // UNAUTHENTICATED: Render Secure Login Page
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 select-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl border border-zinc-900 shadow-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500" />
          
          <div className="text-center mb-8">
            {websiteSettings?.logoUrl ? (
              <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-center mx-auto p-1.5 overflow-hidden mb-4 shadow-lg">
                <img src={websiteSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-orange-600/10 text-orange-500 rounded-xl flex items-center justify-center mx-auto border border-orange-500/20 mb-4">
                <Shield className="w-6 h-6 animate-pulse" />
              </div>
            )}
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">
              {websiteSettings?.websiteTitle || "Volex"} Admin Gate
            </h2>
            <p className="text-zinc-500 text-xs mt-1">
              {websiteSettings?.websiteTagline || "Enter your secure root credentials to authenticate."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="e.g. root"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-sm focus:outline-none font-sans font-bold transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-sm focus:outline-none font-sans font-bold transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-55 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-lg glow-orange active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{loggingIn ? 'Authenticating...' : 'Access Command Center'}</span>
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    );
  }

  // AUTHENTICATED: Render Admin Console Layout
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      
      {/* Console Top Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-zinc-900 mb-8">
        <div className="flex items-center gap-3">
          {websiteSettings?.logoUrl ? (
            <div className="relative flex items-center justify-center w-10 h-10 bg-zinc-950 rounded-lg border border-zinc-800 p-0.5 overflow-hidden">
              <img src={websiteSettings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-10 h-10 bg-zinc-950 rounded-lg border border-orange-500/30">
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
          )}
          <div>
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">
              {(websiteSettings?.websiteTitle || "Volex").toUpperCase()} COMMAND CENTER
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono">
              USER: root • SESSION ID: SECURE-AES256
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={fetchStatsAndSettings}
            disabled={loadingStats}
            className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
            title="Reload metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Rails & Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Navigation Rail Panel */}
        <div className="lg:col-span-1 space-y-1.5 text-left">
          <span className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-3 mb-2">
            Categories
          </span>
          
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'products', name: 'Products Editor', icon: <ShoppingCart className="w-4 h-4" /> },
            { id: 'orders', name: 'Orders Log', icon: <Layers className="w-4 h-4" /> },
            { id: 'tickets', name: 'Support Tickets', icon: <HelpCircle className="w-4 h-4" /> },
            { id: 'payments', name: 'Payment Config', icon: <SettingsIcon className="w-4 h-4" /> },
            { id: 'appearance', name: 'Website Appearance', icon: <Paintbrush className="w-4 h-4" /> },
            { id: 'coupons', name: 'Promo Coupons', icon: <Tag className="w-4 h-4" /> },
            { id: 'reviews', name: 'Player Reviews', icon: <Star className="w-4 h-4" /> },
            { id: 'players', name: 'Player Database', icon: <Users className="w-4 h-4" /> },
            { id: 'backup', name: 'Export & Bulk', icon: <FileSpreadsheet className="w-4 h-4" /> },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setEditingProduct(null); setIsAddingProduct(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-black shadow-lg shadow-orange-600/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-600'}`} />
              </button>
            );
          })}

          <span className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest pl-3 mt-5 mb-2">
            Homepage Settings
          </span>

          {[
            { id: 'homepage_gallery', name: 'Homepage Gallery', icon: <Image className="w-4 h-4" /> },
            { id: 'live_widgets', name: 'Live Widgets', icon: <RefreshCw className="w-4 h-4" /> },
            { id: 'branding', name: 'Branding Settings', icon: <Sliders className="w-4 h-4" /> },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setEditingProduct(null); setIsAddingProduct(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-black shadow-lg shadow-orange-600/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Main Work Area Workspace */}
        <div className="lg:col-span-4 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6 relative min-h-[500px]">
          
          {loadingStats && (
            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                <span className="text-xs text-zinc-400 font-mono">Synchronizing telemetry databases...</span>
              </div>
            </div>
          )}

          {/* TAB 1: ANALYTICS DASHBOARD */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8 text-left">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                Telemetry Analytics
              </h3>

              {/* Bento Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Gross Revenue</span>
                  <span className="font-display font-black text-3xl text-orange-500 mt-2 block">${stats.revenue.total.toFixed(2)}</span>
                  <span className="text-[9px] text-green-500 font-sans font-bold mt-2">▲ 14.5% versus last week</span>
                </div>
                
                <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Total Orders Logged</span>
                  <span className="font-display font-black text-3xl text-white mt-2 block">{stats.orders.total}</span>
                  <span className="text-[9px] text-zinc-500 font-mono mt-2">{stats.orders.pending} pending tickets</span>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-zinc-900 flex flex-col justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Active Products</span>
                  <span className="font-display font-black text-3xl text-white mt-2 block">{stats.products.total}</span>
                  <span className="text-[9px] text-zinc-500 font-mono mt-2">Across 7 Categories</span>
                </div>
              </div>

              {/* Graphical Representation (SVG Grid Chart) */}
              <div className="glass-card p-5 rounded-2xl border border-zinc-900 text-left">
                <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-4">Monthly Revenue Flow</span>
                <div className="h-40 w-full relative">
                  {/* Clean SVG Line graph */}
                  <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ea580c" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 0 80 Q 100 60, 200 70 T 400 30 T 500 10 L 500 100 L 0 100 Z" 
                      fill="url(#chart-glow)" 
                    />
                    <path 
                      d="M 0 80 Q 100 60, 200 70 T 400 30 T 500 10" 
                      fill="none" 
                      stroke="#f97316" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Labels */}
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-2">
                    <span>FEB ($250)</span>
                    <span>MAR ($380)</span>
                    <span>APR ($410)</span>
                    <span>MAY ($550)</span>
                    <span>JUN ($680)</span>
                    <span>JUL (CURRENT: ${stats.revenue.total.toFixed(0)})</span>
                  </div>
                </div>
              </div>

              {/* Popular Products Breakdown Table */}
              <div className="glass-card rounded-2xl border border-zinc-900 p-5">
                <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase mb-4">Top Product Revenue</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-300">
                    <thead className="bg-zinc-950 font-mono font-bold text-[10px] text-zinc-500 uppercase border-b border-zinc-900">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Sales Qty</th>
                        <th className="p-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {stats.products.stats.slice(0, 5).map((p, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/30">
                          <td className="p-3 font-bold text-zinc-200">{p.name}</td>
                          <td className="p-3 text-center font-mono">{p.count}</td>
                          <td className="p-3 text-right font-mono font-bold text-orange-500">${p.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS EDITOR */}
          {activeTab === 'products' && (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Product Editor
                </h3>
                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      description: '',
                      price: 0,
                      category: categories[0]?.id || 'ls-ranks',
                      gameMode: 'lifesteal',
                      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
                      active: true,
                      sortOrder: 0
                    });
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Item</span>
                </button>
              </div>

              {/* Form editing view */}
              <AnimatePresence>
                {(editingProduct || isAddingProduct) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-5 rounded-2xl glass-card border border-orange-500/30 space-y-4"
                  >
                    <h4 className="font-display font-black text-sm uppercase text-orange-400">
                      {editingProduct?.id ? 'Modify Product Details' : 'Design New Product'}
                    </h4>

                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Item Name</label>
                        <input
                          type="text"
                          required
                          value={editingProduct?.name || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editingProduct?.price || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Sort Order</label>
                          <input
                            type="number"
                            required
                            value={editingProduct?.sortOrder || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, sortOrder: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Game Server Mode</label>
                        <select
                          value={editingProduct?.gameMode || 'lifesteal'}
                          onChange={(e) => setEditingProduct({ ...editingProduct, gameMode: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                        >
                          <option value="lifesteal">Lifesteal Mode</option>
                          <option value="survival">Survival Mode</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Product Category</label>
                        <select
                          value={editingProduct?.category || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                        >
                          {categories.filter(c => c.gameMode === editingProduct?.gameMode).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Description Details</label>
                        <textarea
                          rows={2}
                          value={editingProduct?.description || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Product Image URL / Base64</label>
                          <input
                            type="text"
                            placeholder="Direct URL link"
                            value={editingProduct?.image || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Or Upload Image Asset</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'product')}
                            className="w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-mono file:font-bold file:bg-zinc-900 file:text-orange-500 hover:file:bg-zinc-850 file:cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pt-3 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Catalog Table */}
              <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-300">
                    <thead className="bg-zinc-950 font-mono font-bold text-[10px] text-zinc-500 uppercase border-b border-zinc-900">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Server Mode</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-center">Price</th>
                        <th className="p-3 text-center">Sort</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Commands</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {products.map((p) => {
                        const cat = categories.find(c => c.id === p.category);
                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/10">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img src={p.image} className="w-8 h-8 rounded object-cover bg-zinc-950 border border-zinc-900" alt="" referrerPolicy="no-referrer" />
                                <span className="font-bold text-zinc-100">{p.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center font-mono font-semibold uppercase text-orange-500">
                              {p.gameMode}
                            </td>
                            <td className="p-3 font-semibold text-zinc-400">
                              {cat ? cat.name : 'Unknown'}
                            </td>
                            <td className="p-3 text-center font-mono font-bold">
                              ${p.price.toFixed(2)}
                            </td>
                            <td className="p-3 text-center font-mono">
                              {p.sortOrder}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleProductStatus(p.id, p.active)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${
                                  p.active 
                                    ? 'bg-green-950/40 text-green-400 border border-green-500/15' 
                                    : 'bg-zinc-900 text-zinc-500 border border-transparent'
                                }`}
                              >
                                {p.active ? 'ACTIVE' : 'DISABLED'}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => { setEditingProduct(p); setIsAddingProduct(false); }}
                                  className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors cursor-pointer"
                                  title="Edit item"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 hover:bg-red-950/20 border border-transparent hover:border-red-500/10 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS LOGGER */}
          {activeTab === 'orders' && stats && (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Purchase Transaction Log
                </h3>
                <span className="font-mono text-xs text-zinc-500">
                  Total Records: {stats.orders.list.length}
                </span>
              </div>

              <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-300">
                    <thead className="bg-zinc-950 font-mono font-bold text-[10px] text-zinc-500 uppercase border-b border-zinc-900">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Player Details</th>
                        <th className="p-3">Purchased Item</th>
                        <th className="p-3 text-center">Amount</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Date</th>
                        <th className="p-3 text-right">Modify Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {stats.orders.list.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-900/10">
                          <td className="p-3 font-mono font-bold text-orange-500">
                            #{o.id}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-zinc-200">{o.username}</div>
                            <div className="text-[10px] text-zinc-500 font-mono">DISCORD: {o.discord}</div>
                            {o.email && <div className="text-[9px] text-zinc-500 font-sans leading-none mt-0.5">{o.email}</div>}
                          </td>
                          <td className="p-3">
                            <div className="font-bold font-sans text-zinc-200">{o.productName}</div>
                            <span className="text-[9px] font-mono font-bold uppercase text-orange-400">
                              {o.gameMode} - {o.categoryName}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-black text-zinc-200">
                            ${o.price.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              o.paymentStatus === 'delivered' ? 'bg-green-950/40 text-green-400 border border-green-500/10' :
                              o.paymentStatus === 'verified' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/10' :
                              o.paymentStatus === 'rejected' ? 'bg-red-950/40 text-red-400 border border-red-500/10' :
                              'bg-yellow-950/40 text-yellow-500 border border-yellow-500/10'
                            }`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center text-[10px] font-mono text-zinc-500">
                            {new Date(o.date).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {o.paymentStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, 'verified')}
                                    className="p-1 bg-blue-950 text-blue-400 hover:bg-blue-900 rounded border border-blue-500/10"
                                    title="Verify & Accept"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(o.id, 'rejected')}
                                    className="p-1 bg-red-950 text-red-400 hover:bg-red-900 rounded border border-red-500/10"
                                    title="Reject Payment"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {o.paymentStatus === 'verified' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                                  className="p-1 bg-green-950 text-green-400 hover:bg-green-900 rounded border border-green-500/10 flex items-center gap-1 text-[10px] font-mono font-bold uppercase"
                                  title="Mark as Delivered In-game"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Deliver</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                className="p-1 hover:bg-zinc-900 text-zinc-600 hover:text-zinc-400 rounded transition-colors ml-1"
                                title="Discard log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3.5: SUPPORT TICKETS LIST */}
          {activeTab === 'tickets' && (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Support Helpdesk Tickets ({supportTickets.length})
                </h3>
                <button
                  onClick={fetchSupportTickets}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-mono font-bold text-orange-500 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload Tickets</span>
                </button>
              </div>

              <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-zinc-300">
                    <thead className="bg-zinc-950 font-mono font-bold text-[10px] text-zinc-500 uppercase border-b border-zinc-900">
                      <tr>
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Player / Email</th>
                        <th className="p-3">Issue Category</th>
                        <th className="p-3">Message Details</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {supportTickets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                            No support tickets logged in database.
                          </td>
                        </tr>
                      ) : (
                        supportTickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-zinc-900/10">
                            <td className="p-3 font-mono font-bold text-orange-500">
                              #{ticket.id}
                            </td>
                            <td className="p-3">
                              <span className="block font-bold text-zinc-100">{ticket.username}</span>
                              <span className="block text-[10px] text-zinc-500">{ticket.email}</span>
                            </td>
                            <td className="p-3 font-semibold text-zinc-300">
                              {ticket.subject}
                            </td>
                            <td className="p-3 max-w-xs">
                              <p className="font-sans font-semibold text-zinc-400 break-words line-clamp-2" title={ticket.message}>
                                {ticket.message}
                              </p>
                              <span className="block text-[9px] text-zinc-600 font-mono mt-1">IP: {ticket.ip}</span>
                            </td>
                            <td className="p-3 text-center">
                              <select
                                value={ticket.status || 'pending'}
                                onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                                className={`px-2 py-1 rounded text-[9px] font-mono font-black uppercase tracking-wider focus:outline-none cursor-pointer border ${
                                  ticket.status === 'resolved'
                                    ? 'bg-green-950/40 text-green-400 border-green-500/20'
                                    : ticket.status === 'in-progress'
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-500/20'
                                    : 'bg-yellow-950/40 text-yellow-500 border-yellow-500/20'
                                }`}
                              >
                                <option value="pending">PENDING</option>
                                <option value="in-progress">IN PROGRESS</option>
                                <option value="resolved">RESOLVED</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteTicket(ticket.id)}
                                className="p-1.5 hover:bg-zinc-900 text-zinc-600 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Delete Ticket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT CONFIGURATION */}
          {activeTab === 'payments' && paymentSettings && (
            <div className="space-y-6 text-left max-w-xl">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                Payment Settings & QR Config
              </h3>

              <form onSubmit={handleSavePaymentSettings} className="space-y-4">
                
                {/* QR Code display */}
                <div className="flex items-center gap-6 p-4 rounded-xl bg-zinc-950 border border-zinc-900/60">
                  <img src={paymentSettings.qrCodeUrl} className="w-24 h-24 object-contain rounded-lg bg-white border" alt="" />
                  <div className="space-y-1">
                    <span className="block text-xs font-mono font-bold text-zinc-400 uppercase">Change QR Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'qr')}
                      className="text-xs text-zinc-500 file:mr-4 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-mono file:font-bold file:bg-zinc-900 file:text-orange-500 hover:file:bg-zinc-850 cursor-pointer"
                    />
                    <span className="block text-[9px] text-zinc-600 font-mono">Accepts PNG/JPG/SVG. Converted to secure store data.</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Payment Account / Institution Name</label>
                  <input
                    type="text"
                    required
                    value={paymentSettings.paymentName}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Payment / Reference Number</label>
                  <input
                    type="text"
                    required
                    value={paymentSettings.paymentNumber}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Checkout Instructions</label>
                  <textarea
                    rows={4}
                    required
                    value={paymentSettings.instructions}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, instructions: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs sm:text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Payment Configuration</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: WEBSITE APPEARANCE CUSTOMIZER */}
          {activeTab === 'appearance' && localWebsiteSettings && (
            <div className="space-y-6 text-left max-w-2xl">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Website Appearance
                </h3>
                <p className="text-zinc-500 text-xs font-semibold mt-1">
                  Configure the global layout background, dark overlays, blur filters, and dynamic visual effects.
                </p>
              </div>

              <form onSubmit={handleSaveWebsiteSettings} className="space-y-6">
                
                {/* Hero Background Setup Card */}
                <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Paintbrush className="w-4 h-4 text-orange-500" />
                    <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Hero Background Image</span>
                  </div>

                  {/* Method Switcher */}
                  <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-900 w-fit">
                    <button
                      type="button"
                      onClick={() => setLocalWebsiteSettings({ ...localWebsiteSettings, backgroundType: 'upload' })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        localWebsiteSettings.backgroundType === 'upload'
                          ? 'bg-orange-600 text-black shadow'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalWebsiteSettings({ ...localWebsiteSettings, backgroundType: 'url' })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        localWebsiteSettings.backgroundType === 'url'
                          ? 'bg-orange-600 text-black shadow'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {/* Toggle Mode Panels */}
                  {localWebsiteSettings.backgroundType === 'upload' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-6 p-4 rounded-xl bg-zinc-950/40 border border-zinc-900">
                        {localWebsiteSettings.backgroundImage ? (
                          <img src={localWebsiteSettings.backgroundImage} className="w-20 h-20 object-cover rounded-lg bg-zinc-900 border border-zinc-800" alt="Preview" />
                        ) : (
                          <div className="w-20 h-20 bg-zinc-900 rounded-lg border border-zinc-800/80 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                        <div className="space-y-2 flex-grow">
                          <span className="block text-xs font-mono font-bold text-zinc-400 uppercase">Select Image File</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleBackgroundUpload}
                            className="text-xs text-zinc-500 file:mr-4 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-mono file:font-bold file:bg-zinc-900 file:text-orange-500 hover:file:bg-zinc-850 cursor-pointer"
                          />
                          <span className="block text-[9px] text-zinc-600 font-mono">JPG, PNG, WEBP, GIF (Max size: 10MB)</span>
                          
                          {/* Upload Progress Bar */}
                          {uploadProgress !== null && (
                            <div className="w-full mt-2">
                              <div className="flex justify-between text-[9px] font-mono text-zinc-400 mb-1">
                                <span>Uploading image stream...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-orange-500 h-1.5 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/background.jpg"
                          value={localWebsiteSettings.backgroundImage}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, backgroundImage: e.target.value })}
                          className="flex-grow px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                        />
                      </div>
                      <span className="block text-[9px] text-zinc-600 font-mono">Specify a web-accessible image source. Live updates occur immediately.</span>
                    </div>
                  )}
                </div>

                {/* Background Settings Group */}
                <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Sliders className="w-4 h-4 text-orange-500" />
                    <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Image & Overlay Settings</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Background Position */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Background Position</label>
                      <select
                        value={localWebsiteSettings.position}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, position: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    {/* Background Size */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Background Size</label>
                      <select
                        value={localWebsiteSettings.size}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, size: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="cover">Cover (Fill Screen)</option>
                        <option value="contain">Contain (Fit Aspect)</option>
                        <option value="auto">Auto (Default Size)</option>
                      </select>
                    </div>

                    {/* Background Repeat */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Background Repeat</label>
                      <select
                        value={localWebsiteSettings.repeat}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, repeat: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="no-repeat">No Repeat</option>
                        <option value="repeat">Repeat</option>
                      </select>
                    </div>

                    {/* Background Attachment */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Background Attachment</label>
                      <select
                        value={localWebsiteSettings.attachment}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, attachment: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="fixed">Fixed (Parallax Effect)</option>
                        <option value="scroll">Scroll with Page</option>
                      </select>
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-4 pt-2">
                    {/* Background Opacity Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-zinc-400">
                        <span>Background Opacity</span>
                        <span className="text-orange-500">{localWebsiteSettings.backgroundOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localWebsiteSettings.backgroundOpacity}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, backgroundOpacity: parseInt(e.target.value) })}
                        className="w-full accent-orange-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Background Blur Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-zinc-400">
                        <span>Background Blur</span>
                        <span className="text-orange-500">{localWebsiteSettings.backgroundBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={localWebsiteSettings.backgroundBlur}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, backgroundBlur: parseInt(e.target.value) })}
                        className="w-full accent-orange-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Overlay Darkness Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-zinc-400">
                        <span>Overlay Darkness</span>
                        <span className="text-orange-500">{localWebsiteSettings.overlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localWebsiteSettings.overlayOpacity}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, overlayOpacity: parseInt(e.target.value) })}
                        className="w-full accent-orange-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Overlay Color Picker */}
                    <div className="flex items-center gap-4 p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                      <input
                        type="color"
                        value={localWebsiteSettings.overlayColor}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, overlayColor: e.target.value })}
                        className="w-10 h-10 bg-transparent border-0 rounded-lg cursor-pointer overflow-hidden p-0"
                      />
                      <div>
                        <span className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Overlay Color</span>
                        <span className="text-xs font-mono text-zinc-500 font-bold">{localWebsiteSettings.overlayColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Performance/Style Toggles */}
                <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                    <Sliders className="w-4 h-4 text-orange-500" />
                    <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Extra Visual Components</span>
                  </div>

                  <div className="space-y-3">
                    {/* Toggle: Enable Animation */}
                    <label className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl border border-zinc-900/60 cursor-pointer select-none transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="block text-xs font-bold text-zinc-100">Enable Background Animation</span>
                        <span className="block text-[10px] text-zinc-500 font-semibold">Pulse glow transitions for radial background elements.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localWebsiteSettings.enableAnimation}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, enableAnimation: e.target.checked })}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900 border-zinc-800"
                      />
                    </label>

                    {/* Toggle: Enable Particles */}
                    <label className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl border border-zinc-900/60 cursor-pointer select-none transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="block text-xs font-bold text-zinc-100">Enable Floating Particles</span>
                        <span className="block text-[10px] text-zinc-500 font-semibold">Render ambient light particles moving slowly over the viewport.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localWebsiteSettings.enableParticles}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, enableParticles: e.target.checked })}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900 border-zinc-800"
                      />
                    </label>

                    {/* Toggle: Enable Gradient Overlay */}
                    <label className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl border border-zinc-900/60 cursor-pointer select-none transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="block text-xs font-bold text-zinc-100">Enable Gradient Overlay</span>
                        <span className="block text-[10px] text-zinc-500 font-semibold">Display AAA-gaming glowing radial color orbs on the page borders.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localWebsiteSettings.enableGradient}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, enableGradient: e.target.checked })}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900 border-zinc-800"
                      />
                    </label>

                    {/* Toggle: Enable Blur Overlay */}
                    <label className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl border border-zinc-900/60 cursor-pointer select-none transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="block text-xs font-bold text-zinc-100">Enable Blur Overlay</span>
                        <span className="block text-[10px] text-zinc-500 font-semibold">Enable backdrop blurring filters behind content headers and layers.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localWebsiteSettings.enableBlur}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, enableBlur: e.target.checked })}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900 border-zinc-800"
                      />
                    </label>

                    {/* Toggle: Enable Dark Overlay */}
                    <label className="flex items-center justify-between p-3 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl border border-zinc-900/60 cursor-pointer select-none transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="block text-xs font-bold text-zinc-100">Enable Dark Overlay</span>
                        <span className="block text-[10px] text-zinc-500 font-semibold">Dim down background graphics with a dark canvas filter for readability.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localWebsiteSettings.enableDark}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, enableDark: e.target.checked })}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900 border-zinc-800"
                      />
                    </label>
                  </div>
                </div>

                {/* Form Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply website background</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: PLAYERS DATABASE */}
          {activeTab === 'players' && stats && (
            <div className="space-y-6 text-left">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                Network Player Directory
              </h3>

              <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden">
                <table className="w-full text-xs text-left text-zinc-300">
                  <thead className="bg-zinc-950 font-mono font-bold text-[10px] text-zinc-500 uppercase border-b border-zinc-900">
                    <tr>
                      <th className="p-3">Player Username</th>
                      <th className="p-3 text-center">Orders Placed</th>
                      <th className="p-3 text-center">Claimed Status</th>
                      <th className="p-3 text-right">Discord Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {Array.from(new Set(stats.orders.list.map(o => o.username))).map((usr, index) => {
                      const userOrders = stats.orders.list.filter(o => o.username === usr);
                      const newestOrder = userOrders[0];
                      const pendingCount = userOrders.filter(o => o.paymentStatus === 'pending').length;
                      return (
                        <tr key={index} className="hover:bg-zinc-900/10">
                          <td className="p-3 font-bold text-zinc-100">
                            {usr}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            {userOrders.length}
                          </td>
                          <td className="p-3 text-center">
                            {pendingCount > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-yellow-950/20 text-yellow-500 border border-yellow-500/10">
                                {pendingCount} PENDING ACTION
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-green-950/20 text-green-400 border border-green-500/10">
                                FULLY CLEARED
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-400">
                            {newestOrder?.discord}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-6 text-left max-w-xl">
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                System Backup & Sync Tools
              </h3>

              <div className="space-y-4">
                
                {/* Export Card */}
                <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-3">
                  <span className="block text-xs font-mono font-bold text-zinc-400 uppercase">Export Store Database</span>
                  <p className="text-zinc-500 text-xs font-semibold leading-normal">
                    Download a secure JSON archive containing all orders, payment references, and user directories in the cloud container.
                  </p>
                  <button
                    onClick={handleExportOrders}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-orange-500 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Orders Export</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-3">
                  <span className="block text-xs font-mono font-bold text-zinc-400 uppercase">Bulk Import Products</span>
                  <p className="text-zinc-500 text-xs font-semibold leading-normal">
                    Paste a JSON array matching the product schema below to bulk register new product listings on the store.
                  </p>
                  <textarea
                    rows={4}
                    placeholder='[ { "name": "Valkyrie Bow", "price": 12.99, "category": "ls-ranks", "gameMode": "lifesteal" } ]'
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none resize-none font-mono"
                  />
                  <button
                    onClick={handleImportProducts}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Inject Products</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: COUPONS MANAGEMENT */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                    Discount Coupon Codes
                  </h3>
                  <p className="text-xs text-zinc-500 font-semibold mt-1">
                    Manage and issue store-wide or category-specific promotional campaigns.
                  </p>
                </div>
                {!editingCoupon && !isAddingCoupon && (
                  <button
                    onClick={() => {
                      setEditingCoupon({
                        code: '',
                        discountType: 'percentage',
                        value: 10,
                        status: 'active',
                        appliesTo: 'entire',
                        targetId: '',
                        startDate: new Date().toISOString().split('T')[0],
                        expiryDate: '',
                        usageLimit: 0,
                        perUserLimit: 1,
                        minimumOrder: 0,
                        maximumDiscount: 0
                      });
                      setIsAddingCoupon(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-black" />
                    <span>Create Promo Coupon</span>
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {(isAddingCoupon || editingCoupon?.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4 overflow-hidden"
                  >
                    <span className="block text-xs font-mono font-bold text-zinc-400 uppercase border-b border-zinc-900 pb-2">
                      {editingCoupon?.id ? `Edit Coupon: ${editingCoupon.code}` : 'New Promotional Coupon'}
                    </span>
                    <form onSubmit={handleSaveCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Promo Code (Uppercase)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. WELCOME10"
                          value={editingCoupon?.code || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none uppercase font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Discount Type</label>
                        <select
                          value={editingCoupon?.discountType || 'percentage'}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed_amount">Fixed Amount ($)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Value</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="10"
                          value={editingCoupon?.value ?? ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Applies To Scope</label>
                        <select
                          value={editingCoupon?.appliesTo || 'entire'}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, appliesTo: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="entire">Entire Store</option>
                          <option value="lifesteal">Lifesteal Mode Items</option>
                          <option value="survival">Survival Mode Items</option>
                          <option value="specific_product">Specific Product Item</option>
                        </select>
                      </div>

                      {editingCoupon?.appliesTo === 'specific_product' && (
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Target Product</label>
                          <select
                            value={editingCoupon?.targetId || ''}
                            onChange={(e) => setEditingCoupon({ ...editingCoupon, targetId: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Select Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>[{p.gameMode}] {p.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Status</label>
                        <select
                          value={editingCoupon?.status || 'active'}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, status: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Start Date</label>
                        <input
                          type="date"
                          value={editingCoupon?.startDate || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, startDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Expiry Date</label>
                        <input
                          type="date"
                          value={editingCoupon?.expiryDate || ''}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Usage Limit (0 = Unlimited)</label>
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={editingCoupon?.usageLimit ?? 0}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Minimum Order Total ($)</label>
                        <input
                          type="number"
                          placeholder="e.g. 0"
                          value={editingCoupon?.minimumOrder ?? 0}
                          onChange={(e) => setEditingCoupon({ ...editingCoupon, minimumOrder: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3 flex items-center justify-between pt-3 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => { setEditingCoupon(null); setIsAddingCoupon(false); }}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-display font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Coupon</span>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingCoupons ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <span className="text-xs text-zinc-500 font-mono">Loading campaign coupons...</span>
                </div>
              ) : coupons.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-900 rounded-2xl">
                  <Tag className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-xs font-semibold">No promotional coupons created yet.</p>
                </div>
              ) : (
                <div className="glass-card rounded-2xl border border-zinc-900 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-zinc-300">
                      <thead className="bg-zinc-950 font-mono font-bold text-[10px] text-zinc-500 uppercase border-b border-zinc-900">
                        <tr>
                          <th className="p-3">Coupon Code</th>
                          <th className="p-3">Discount</th>
                          <th className="p-3">Scope Scope</th>
                          <th className="p-3 text-center">Usage Count</th>
                          <th className="p-3 text-center">Expiry</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-zinc-900/10">
                            <td className="p-3">
                              <span className="font-mono font-black text-zinc-100 bg-zinc-900 px-2 py-1 rounded border border-white/5 uppercase">
                                {coupon.code}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-orange-400">
                              {coupon.discountType === 'percentage' ? `${coupon.value}% Off` : `$${coupon.value} Off`}
                            </td>
                            <td className="p-3 font-semibold text-zinc-400 capitalize">
                              {coupon.appliesTo === 'specific_product' ? 'Specific Product' : coupon.appliesTo === 'entire' ? 'Entire Store' : `${coupon.appliesTo} Mode`}
                            </td>
                            <td className="p-3 text-center font-mono text-zinc-300">
                              {coupon.usedCount} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                            </td>
                            <td className="p-3 text-center font-mono text-zinc-500">
                              {coupon.expiryDate ? coupon.expiryDate : 'Never'}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleToggleCouponStatus(coupon.id, coupon.status)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${
                                  coupon.status === 'active'
                                    ? 'bg-green-950/40 text-green-400 border border-green-500/15'
                                    : 'bg-zinc-900 text-zinc-500 border border-transparent'
                                }`}
                              >
                                {coupon.status}
                              </button>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCoupon(coupon);
                                    setIsAddingCoupon(false);
                                  }}
                                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors cursor-pointer border border-transparent hover:border-zinc-750"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="p-1.5 bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded-md transition-colors cursor-pointer border border-transparent hover:border-red-900/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: PLAYER REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Player Reviews Moderation
                </h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1">
                  Approve, moderate, or remove customer feedback shown on the homepage.
                </p>
              </div>

              {loadingReviews ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                  <span className="text-xs text-zinc-500 font-mono">Loading reviews feedback feed...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-900 rounded-2xl">
                  <Star className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 text-xs font-semibold">No player reviews exist in the database.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-3 relative flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rev.avatar || `https://minotar.net/helm/${rev.username}/32`}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800"
                            />
                            <div>
                              <span className="font-display font-black text-xs text-white uppercase block leading-none">
                                {rev.username}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500">
                                {rev.date}
                              </span>
                            </div>
                          </div>
                          
                          {/* Stars */}
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 font-semibold leading-relaxed italic">
                          "{rev.reviewText}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900/60 mt-2">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> LIVE ON STORE
                        </span>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete / Purge</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: HOMEPAGE GALLERY MANAGEMENT */}
          {activeTab === 'homepage_gallery' && localWebsiteSettings && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Homepage Gallery
                </h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1">
                  Manage the visual showcase banner displayed prominently on the Volex homepage. Upload an image file (JPG, PNG, WEBP) directly or link an external high-definition image URL. Uploaded files are automatically optimized for web speed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Image Configuration & Drag-and-Drop Zone */}
                <div className="md:col-span-2 space-y-4">
                  
                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingGallery(true);
                    }}
                    onDragLeave={() => setIsDraggingGallery(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingGallery(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        handleGalleryImageProcess(file);
                      }
                    }}
                    className={`p-8 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center min-h-[220px] bg-zinc-950/20 backdrop-blur-xs relative overflow-hidden ${
                      isDraggingGallery
                        ? 'border-orange-500 bg-orange-950/10 text-orange-400 scale-[0.99] shadow-lg shadow-orange-500/5'
                        : 'border-zinc-800/80 hover:border-zinc-700/60'
                    }`}
                  >
                    <input
                      type="file"
                      id="gallery-file-input"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleGalleryImageProcess(file);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="text-center space-y-3 z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-orange-500">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200 font-display uppercase tracking-wider">
                          {isDraggingGallery ? 'Drop it here!' : 'Drag & drop image file'}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">
                          Supports PNG, JPG, WEBP • Max 10MB
                        </p>
                      </div>
                      
                      {!isDraggingGallery && (
                        <button
                          type="button"
                          onClick={() => document.getElementById('gallery-file-input')?.click()}
                          className="pointer-events-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-display font-bold text-[10px] uppercase tracking-wider rounded-lg border border-zinc-800 transition-all cursor-pointer inline-block"
                        >
                          Upload Image File
                        </button>
                      )}
                    </div>
                  </div>

                  {/* URL option Form */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-3">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      External Image URL
                    </label>
                    <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
                      Alternatively, link directly to any external hosting (e.g. Imgur, Unsplash, or your public folder).
                    </p>
                    <div className="flex gap-2.5">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={galleryUrlInput}
                        onChange={(e) => setGalleryUrlInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!galleryUrlInput) {
                            addToast("Empty Input", "Please enter a valid URL.", "error");
                            return;
                          }
                          setLocalWebsiteSettings({ ...localWebsiteSettings, homepageGalleryImage: galleryUrlInput });
                          addToast("URL Loaded", "External URL loaded into gallery preview.", "success");
                        }}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-display font-bold text-[10px] uppercase tracking-wider rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                      >
                        Apply URL
                      </button>
                    </div>
                  </div>

                  {/* Save Changes button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveWebsiteSettings}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md shadow-orange-600/10 active:scale-98"
                    >
                      <Save className="w-4 h-4 text-black" />
                      <span>Save Gallery Changes</span>
                    </button>
                  </div>

                </div>

                {/* Live Preview Area */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4 text-left">
                    <span className="block text-xs font-mono font-bold text-zinc-400 uppercase border-b border-zinc-900/60 pb-2">
                      Active Image Preview
                    </span>

                    {localWebsiteSettings.homepageGalleryImage ? (
                      <div className="space-y-3">
                        <div className="aspect-video rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden relative group">
                          <img
                            src={localWebsiteSettings.homepageGalleryImage}
                            alt="Active Gallery"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="text-[10px] text-zinc-500 font-mono space-y-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900/60">
                          <div className="flex justify-between">
                            <span>Image Source:</span>
                            <span className="text-zinc-400 truncate max-w-[150px]" title={localWebsiteSettings.homepageGalleryImage}>
                              {localWebsiteSettings.homepageGalleryImage.startsWith('data:') ? 'Optimized Upload (Base64)' : 'External Link'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recommend Size:</span>
                            <span className="text-zinc-400">1920 × 1080 (16:9)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="text-emerald-500 font-bold">● ACTIVE</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => document.getElementById('gallery-file-input')?.click()}
                            className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-colors text-center cursor-pointer"
                          >
                            Replace Image
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete the active homepage gallery image?")) {
                                setLocalWebsiteSettings({ ...localWebsiteSettings, homepageGalleryImage: '' });
                                setGalleryUrlInput('');
                                addToast("Image Removed", "Showcase image deleted. A default fallback will display.", "info");
                              }
                            }}
                            className="p-2 bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/20 text-zinc-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl border border-dashed border-zinc-900 flex flex-col items-center justify-center text-center p-4">
                        <Image className="w-8 h-8 text-zinc-700 mb-2" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">No Active Image</span>
                        <span className="text-[9px] text-zinc-600 font-mono mt-1">Default backup visual will be used</span>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 10: LIVE WIDGETS CONFIGURATION */}
          {activeTab === 'live_widgets' && localWebsiteSettings && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Live Widgets Configuration
                </h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1">
                  Connect your homepage widgets and cards with your actual live Discord server and Minecraft game server. Specify server network details and secure tokens below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Configuration form */}
                <form onSubmit={handleSaveWebsiteSettings} className="space-y-5">
                  
                  {/* Minecraft Server Configuration */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-3">
                      <div className="p-1 bg-green-500/10 text-green-500 rounded-lg">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Minecraft Server Connection</span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Server IP / Address</label>
                        <input
                          type="text"
                          required
                          placeholder="rex-2.drexhost.in"
                          value={localWebsiteSettings.minecraftServerIp || ''}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, minecraftServerIp: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none"
                        />
                        <span className="block text-[9px] text-zinc-600 font-mono">Do not include the port number here. Specify hostname or server IP address.</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Query Port</label>
                        <input
                          type="number"
                          required
                          placeholder="19121"
                          value={localWebsiteSettings.minecraftQueryPort || ''}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, minecraftQueryPort: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                        <span className="block text-[9px] text-zinc-600 font-mono">Typically 25565 for Java, or custom numeric ports (e.g. 19121).</span>
                      </div>
                    </div>
                  </div>

                  {/* Discord Server Configuration */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-3">
                      <div className="p-1 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Discord API Connection</span>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Discord Server (Guild) ID</label>
                        <input
                          type="text"
                          required
                          placeholder="123456789012345678"
                          value={localWebsiteSettings.discordServerId || ''}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, discordServerId: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                        <span className="block text-[9px] text-zinc-600 font-mono">Right-click server name on Discord and choose Copy Server ID (Developer Mode).</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Discord Bot Token (Highly Secure)</label>
                        <input
                          type="password"
                          placeholder="MTA5... (Optional - hides secret input)"
                          value={localWebsiteSettings.discordBotToken || ''}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, discordBotToken: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                        <span className="block text-[9px] text-zinc-600 font-mono">Highly recommended. Needed for server-side approximate member count. If empty, public invite is used.</span>
                      </div>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-3">
                      <div className="p-1 bg-orange-500/10 text-orange-500 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Widget Sync Options</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                        <span>Background Sync Interval</span>
                        <span className="text-orange-500">{localWebsiteSettings.refreshInterval || 30} seconds</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="300"
                        step="5"
                        value={localWebsiteSettings.refreshInterval || 30}
                        onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, refreshInterval: parseInt(e.target.value) })}
                        className="w-full accent-orange-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                      />
                      <span className="block text-[9px] text-zinc-600 font-mono">Defines the background API query rate to prevent rate limits and keep status fresh.</span>
                    </div>
                  </div>

                  {/* Save Changes button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md shadow-orange-600/10 active:scale-98"
                    >
                      <Save className="w-4 h-4 text-black" />
                      <span>Save Connection Settings</span>
                    </button>
                  </div>

                </form>

                {/* Connection Status & Live Preview */}
                <div className="space-y-4 text-left">
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <span className="block text-xs font-display font-black uppercase text-zinc-200 border-b border-zinc-900/60 pb-2">
                      🔌 CONNECTION TESTER
                    </span>

                    <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                      Click the test button below to query your Minecraft & Discord integration immediately using the saved parameters.
                    </p>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={async () => {
                          addToast("Querying Live APIs", "Connecting to Minecraft network query node and Discord guild tracker...", "info");
                          try {
                            const res = await fetch('/api/server-status');
                            const data = await res.json();
                            if (res.ok) {
                              addToast("APIs Online", "Live status queried successfully!", "success");
                              const isMcOnline = data.online ? "ONLINE" : "OFFLINE";
                              const mcPlayers = data.players?.online ?? 0;
                              const discordMembers = data.discordMembers ?? 0;
                              alert(`Live Status Report:\n\nMinecraft Server: ${isMcOnline}\nOnline Players: ${mcPlayers}\nDiscord Member Count: ${discordMembers}\n\nConnection fully verified!`);
                            } else {
                              addToast("Query Error", data.error || "Could not query status.", "error");
                            }
                          } catch (err) {
                            addToast("Connection Error", "Network error when attempting to fetch live API status.", "error");
                          }
                        }}
                        className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-display font-bold uppercase tracking-wider rounded-lg transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Query Live APIs Now</span>
                      </button>

                      <div className="text-[10px] text-zinc-500 font-mono space-y-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900/60">
                        <div className="flex justify-between">
                          <span>Endpoint URL:</span>
                          <span className="text-zinc-400">/api/server-status</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Host:</span>
                          <span className="text-zinc-400 truncate max-w-[150px]">{localWebsiteSettings.minecraftServerIp || 'rex-2.drexhost.in'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Query Port:</span>
                          <span className="text-zinc-400">{localWebsiteSettings.minecraftQueryPort || 19121}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discord Guild ID:</span>
                          <span className="text-zinc-400 truncate max-w-[150px]">{localWebsiteSettings.discordServerId || '123456789012345678'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 11: BRANDING SETTINGS */}
          {activeTab === 'branding' && localWebsiteSettings && (
            <div className="space-y-6 text-left animate-fadeIn">
              <div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                  Branding Settings
                </h3>
                <p className="text-xs text-zinc-500 font-semibold mt-1">
                  Customize your network's core branding identities, including logos, icons, titles, and taglines displayed across the client pages.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Branding Config Form */}
                <form onSubmit={handleSaveWebsiteSettings} className="space-y-5">
                  
                  {/* General Identity Configuration */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-3">
                      <div className="p-1 bg-orange-500/10 text-orange-500 rounded-lg">
                        <SettingsIcon className="w-4 h-4" />
                      </div>
                      <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Website Identity</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Website Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Volex Store"
                          value={localWebsiteSettings.websiteTitle || ''}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, websiteTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                        <span className="block text-[9px] text-zinc-600 font-mono">Displayed in browser title, navbar, footer, login, and loading screen.</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">Website Tagline</label>
                        <input
                          type="text"
                          required
                          placeholder="Official Minecraft Store"
                          value={localWebsiteSettings.websiteTagline || ''}
                          onChange={(e) => setLocalWebsiteSettings({ ...localWebsiteSettings, websiteTagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-900 focus:border-orange-500/50 text-zinc-100 text-xs focus:outline-none font-mono"
                        />
                        <span className="block text-[9px] text-zinc-600 font-mono">Slogan/tagline used beneath logo and in SEO titles.</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Changes button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md shadow-orange-600/10 active:scale-98"
                    >
                      <Save className="w-4 h-4 text-black" />
                      <span>Save Branding Settings</span>
                    </button>
                  </div>

                </form>

                {/* Logo & Favicon Assets Panel */}
                <div className="space-y-6">
                  
                  {/* WEBSITE LOGO MANAGEMENT */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-3">
                      <div className="p-1 bg-orange-500/10 text-orange-500 rounded-lg">
                        <Paintbrush className="w-4 h-4" />
                      </div>
                      <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Website Logo</span>
                    </div>

                    <div className="space-y-4">
                      <LogoUploader
                        value={localWebsiteSettings.logoUrl || ''}
                        onChange={(val) => setLocalWebsiteSettings({ ...localWebsiteSettings, logoUrl: val })}
                        addToast={addToast}
                        title="Website Logo"
                        formats="PNG, SVG, WEBP, JPG"
                        recommendedSize="512x512"
                      />
                    </div>
                  </div>

                  {/* BROWSER FAVICON MANAGEMENT */}
                  <div className="p-5 rounded-2xl glass-card border border-zinc-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-900/60 pb-3">
                      <div className="p-1 bg-orange-500/10 text-[#FF7A00] rounded-lg">
                        <Image className="w-4 h-4" />
                      </div>
                      <span className="font-display font-black text-xs uppercase tracking-wider text-zinc-200">Browser Favicon</span>
                    </div>

                    <div className="space-y-4">
                      <LogoUploader
                        value={localWebsiteSettings.faviconUrl || ''}
                        onChange={(val) => setLocalWebsiteSettings({ ...localWebsiteSettings, faviconUrl: val })}
                        addToast={addToast}
                        title="Browser Favicon"
                        formats="ICO, PNG, SVG"
                        recommendedSize="32x32 or 64x64"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
