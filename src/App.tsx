import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import StoreCategories from './components/StoreCategories.tsx';
import WhyChooseUs from './components/WhyChooseUs.tsx';
import FeaturedProducts from './components/FeaturedProducts.tsx';
import GameplayShowcase from './components/GameplayShowcase.tsx';
import PlayerReviews from './components/PlayerReviews.tsx';
import SocialLinksSection from './components/SocialLinksSection.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import SuccessView from './components/SuccessView.tsx';
import DiscordSection from './components/DiscordSection.tsx';
import FAQSection from './components/FAQSection.tsx';
import ContactSection from './components/ContactSection.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import Footer from './components/Footer.tsx';
import ToastContainer, { ToastMessage } from './components/Toast.tsx';
import { Product, Category, Order, PaymentSettings, ServerStatus, WebsiteSettings } from './types.js';

// Premium Global Features
import AnnouncementBar from './components/AnnouncementBar.tsx';
import CustomCursor from './components/CustomCursor.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import LoadingScreen from './components/LoadingScreen.tsx';
import MCVerification from './components/MCVerification.tsx';

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentView, setView] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings | null>(null);
  
  // Minecraft Character Verification state
  const [mcUsername, setMcUsername] = useState<string | null>(() => {
    return localStorage.getItem('mc_username');
  });

  const handleVerifyUsername = (username: string) => {
    localStorage.setItem('mc_username', username);
    setMcUsername(username);
    addToast("Character Synced!", `Successfully logged in as ${username}. Welcome to Volex!`, "success");
  };
  
  // Checkout & Success States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [successSettings, setSuccessSettings] = useState<PaymentSettings | null>(null);

  // Custom Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: 'success' | 'error' | 'info' | 'advancement') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial products and categories
  const fetchData = async () => {
    try {
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodRes.ok) {
        setProducts(prodData);
      }

      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catRes.ok) {
        setCategories(catData);
      }

      const settingsRes = await fetch('/api/website-settings');
      const settingsData = await settingsRes.json();
      if (settingsRes.ok) {
        setWebsiteSettings(settingsData);
      }
    } catch (err) {
      console.error("Error fetching shop data", err);
    }
  };

  // Fetch dynamic player count and server status
  const fetchServerStatus = async () => {
    try {
      const statusRes = await fetch('/api/server-status');
      const statusData = await statusRes.json();
      if (statusRes.ok) {
        setServerStatus(statusData);
      }
    } catch (err) {
      console.error("Error fetching server status", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchServerStatus();

    // Poll server status every 15 seconds to keep dashboard player counts fresh
    const interval = setInterval(fetchServerStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Order submit (from Checkout Step 1 to Step 2)
  const handleSubmitOrder = async (details: { username: string; discord: string; email?: string; productId: string }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      const data = await response.json();
      if (response.ok) {
        return data as { order: Order; paymentSettings: PaymentSettings };
      } else {
        addToast("Validation Failed", data.error || "Cannot initiate checkout.", "error");
        return null;
      }
    } catch (err) {
      addToast("Connection Error", "Our shop is currently processing high volume. Please retry.", "error");
      return null;
    }
  };

  const handleOrderSuccess = (order: Order, paymentSettings: PaymentSettings) => {
    setSuccessOrder(order);
    setSuccessSettings(paymentSettings);
    setView('success');
    addToast(
      "Purchase Requested!",
      "Proceed to join our Discord to complete verification.",
      "success"
    );
  };

  const renderViewContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-8 sm:space-y-16">
            <Hero setView={setView} serverStatus={serverStatus} addToast={addToast} />
            <WhyChooseUs />
            <FeaturedProducts products={products} onBuy={setSelectedProduct} />
            <StoreCategories products={products} categories={categories} onBuy={setSelectedProduct} />
            <GameplayShowcase activeImage={websiteSettings?.homepageGalleryImage} />
            <PlayerReviews addToast={addToast} />
            <SocialLinksSection />
            <DiscordSection />
            <FAQSection />
            <ContactSection addToast={addToast} />
          </div>
        );
      
      case 'store-all':
        return (
          <StoreCategories initialMode="all" products={products} categories={categories} onBuy={setSelectedProduct} />
        );

      case 'store-lifesteal':
        return (
          <StoreCategories initialMode="lifesteal" products={products} categories={categories} onBuy={setSelectedProduct} />
        );

      case 'store-survival':
        return (
          <StoreCategories initialMode="survival" products={products} categories={categories} onBuy={setSelectedProduct} />
        );

      case 'discord':
        return <DiscordSection />;

      case 'faq':
        return <FAQSection />;

      case 'support':
        return <ContactSection addToast={addToast} />;

      case 'success':
        return <SuccessView order={successOrder} paymentSettings={successSettings} setView={setView} />;

      case 'admin':
        return <AdminPanel products={products} categories={categories} refreshData={fetchData} addToast={addToast} websiteSettings={websiteSettings} onUpdateSettings={setWebsiteSettings} />;

      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold font-display text-white">404 View Not Found</h2>
            <button onClick={() => setView('home')} className="mt-4 px-4 py-2 bg-orange-600 text-black font-display font-bold uppercase rounded-lg">
              Return Home
            </button>
          </div>
        );
    }
  };

  // Sync Website Title & Favicon
  useEffect(() => {
    if (websiteSettings) {
      if (websiteSettings.websiteTitle) {
        document.title = websiteSettings.websiteTagline 
          ? `${websiteSettings.websiteTitle} | ${websiteSettings.websiteTagline}`
          : websiteSettings.websiteTitle;
      }
      if (websiteSettings.faviconUrl) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        // Append cache-busting timestamp/hash
        const separator = websiteSettings.faviconUrl.includes('?') ? '&' : '?';
        link.href = `${websiteSettings.faviconUrl}${separator}v=${Date.now()}`;
      }
      
      // Update SEO description meta tag
      let metaDesc: HTMLMetaElement | null = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.getElementsByTagName('head')[0].appendChild(metaDesc);
      }
      metaDesc.content = websiteSettings.websiteTagline || `${websiteSettings.websiteTitle} - Official Minecraft Store`;

      // Update OpenGraph Title
      let ogTitle: HTMLMetaElement | null = document.querySelector("meta[property='og:title']");
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.getElementsByTagName('head')[0].appendChild(ogTitle);
      }
      ogTitle.content = websiteSettings.websiteTitle;
    }
  }, [websiteSettings]);

  // Dynamic background style based on settings
  const backgroundStyle: React.CSSProperties = websiteSettings && websiteSettings.backgroundImage ? {
    backgroundImage: `url(${websiteSettings.backgroundImage})`,
    backgroundPosition: websiteSettings.position || 'center',
    backgroundSize: websiteSettings.size || 'cover',
    backgroundRepeat: websiteSettings.repeat || 'no-repeat',
    backgroundAttachment: websiteSettings.attachment || 'fixed',
    opacity: (websiteSettings.backgroundOpacity !== undefined ? websiteSettings.backgroundOpacity : 100) / 100,
    filter: `blur(${websiteSettings.backgroundBlur || 0}px)`,
    transition: 'all 0.4s ease'
  } : {};

  const overlayStyle: React.CSSProperties = websiteSettings ? {
    backgroundColor: websiteSettings.overlayColor || '#000000',
    opacity: (websiteSettings.overlayOpacity !== undefined ? websiteSettings.overlayOpacity : 0) / 100,
    transition: 'all 0.4s ease'
  } : {};

  const enableAnimation = websiteSettings?.enableAnimation !== false;
  const enableParticles = websiteSettings?.enableParticles !== false;
  const enableGradient = websiteSettings?.enableGradient !== false;
  const enableBlur = websiteSettings?.enableBlur !== false;
  const enableDark = websiteSettings?.enableDark !== false;

  // Custom styling rules to dynamically inject
  const primaryColor = websiteSettings?.primaryColor || '#FF7A00';
  const secondaryColor = websiteSettings?.secondaryColor || '#FF9F43';
  const buttonColor = websiteSettings?.buttonColor || '#FF7A00';
  const cardColorStr = websiteSettings?.cardColor || 'rgba(17, 17, 17, 0.75)';
  const borderCol = websiteSettings?.borderColor || 'rgba(255, 255, 255, 0.06)';
  const glassBlurVal = websiteSettings?.glassBlur !== undefined ? websiteSettings.glassBlur : 16;
  const radiusVal = websiteSettings?.borderRadius === 'none' ? '0px' :
                    websiteSettings?.borderRadius === 'sm' ? '4px' :
                    websiteSettings?.borderRadius === 'md' ? '6px' :
                    websiteSettings?.borderRadius === 'lg' ? '8px' :
                    websiteSettings?.borderRadius === 'xl' ? '12px' :
                    websiteSettings?.borderRadius === '2xl' ? '16px' : '9999px';

  return (
    <>
      <AnimatePresence>
        {loading && (
          <LoadingScreen onComplete={() => setLoading(false)} websiteSettings={websiteSettings} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!loading && !mcUsername && (
          <MCVerification onVerify={handleVerifyUsername} websiteSettings={websiteSettings} />
        )}
      </AnimatePresence>

      {/* Dynamic Style Customization Injector */}
      <style>{`
        :root {
          --color-brand-orange: ${primaryColor} !important;
          --color-brand-orange-light: ${secondaryColor} !important;
          --color-brand-card: ${cardColorStr} !important;
          --color-brand-border: ${borderCol} !important;
        }
        
        .glass-card {
          background: ${cardColorStr} !important;
          backdrop-filter: blur(${glassBlurVal}px) !important;
          border: 1px solid ${borderCol} !important;
          border-radius: ${radiusVal} !important;
        }

        .glass-card-hover:hover {
          border-color: ${primaryColor}80 !important;
          box-shadow: 0 20px 40px -15px ${primaryColor}40 !important;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${primaryColor} !important;
        }

        .btn-primary {
          background-color: ${buttonColor} !important;
          border-radius: ${radiusVal} !important;
        }

        .btn-primary:hover {
          box-shadow: 0 0 15px ${buttonColor}80 !important;
        }

        /* Customize scrollbars thumb */
        ::-webkit-scrollbar-thumb {
          border-radius: ${radiusVal} !important;
        }
      `}</style>

      {/* Custom Gaming Cursor */}
      <CustomCursor />

      <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between selection:bg-[#FF7A00] selection:text-black relative overflow-hidden">
        
        {/* Top Announcement Bar */}
        <AnnouncementBar settings={websiteSettings} />

        {/* Dynamic Custom Background Image */}
        {websiteSettings?.backgroundImage && (
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={backgroundStyle}
          />
        )}

        {/* Dynamic Custom Color Overlay */}
        {websiteSettings?.overlayOpacity !== undefined && websiteSettings.overlayOpacity > 0 && (
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={overlayStyle}
          />
        )}

        {/* Additional Blur Overlay */}
        {enableBlur && (
          <div className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[2px]"></div>
        )}

        {/* Additional Dark Overlay */}
        {enableDark && (
          <div className="absolute inset-0 z-0 pointer-events-none bg-black/45"></div>
        )}

        {/* Premium AAA Gaming Background Accents */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-minecraft-grid opacity-60"></div>
          
          {/* Glowing blurred radial light orbs */}
          {enableGradient && (
            <>
              <div className={`absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] max-w-[600px] rounded-full bg-gradient-to-br from-[${primaryColor}] to-transparent opacity-[0.12] blur-[120px] ${enableAnimation ? 'animate-pulse-glow' : ''}`} style={{ animationDelay: '0s' }}></div>
              <div className={`absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] rounded-full bg-gradient-to-bl from-[${secondaryColor}] to-transparent opacity-[0.08] blur-[150px] ${enableAnimation ? 'animate-pulse-glow' : ''}`} style={{ animationDelay: '2s' }}></div>
              <div className={`absolute bottom-[10%] left-[-10%] w-[45vw] h-[45vw] max-w-[650px] rounded-full bg-gradient-to-tr from-[${primaryColor}] to-transparent opacity-[0.1] blur-[130px] ${enableAnimation ? 'animate-pulse-glow' : ''}`} style={{ animationDelay: '4s' }}></div>
            </>
          )}
          
          {/* Noise grain overlay for that organic texture */}
          <div className="absolute inset-0 noise-overlay"></div>
          
          {/* Decorative Floating ambient lights */}
          {enableParticles && (
            <>
              <div className={`absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-[${primaryColor}]/50 blur-[2px] ${enableAnimation ? 'animate-float-slow' : ''}`}></div>
              <div className={`absolute top-[45%] right-[25%] w-3 h-3 rounded-full bg-[${secondaryColor}]/40 blur-[3px] ${enableAnimation ? 'animate-float' : ''}`}></div>
              <div className={`absolute bottom-[25%] left-[15%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[1px] ${enableAnimation ? 'animate-float-slow' : ''}`} style={{ animationDelay: '3s' }}></div>
              <div className={`absolute top-[70%] left-[45%] w-2.5 h-2.5 rounded-full bg-[${primaryColor}]/40 blur-[2px] ${enableAnimation ? 'animate-float' : ''}`} style={{ animationDelay: '1.5s' }}></div>
            </>
          )}
        </div>

        {/* Dynamic Header Navbar */}
        <div className="relative z-10">
          <Navbar 
            currentView={currentView} 
            setView={setView} 
            serverStatus={serverStatus} 
            addToast={addToast} 
            mcUsername={mcUsername}
            onLogout={() => {
              localStorage.removeItem('mc_username');
              setMcUsername(null);
            }}
            websiteSettings={websiteSettings}
          />
        </div>

        {/* Primary Page Canvas */}
        <main className="flex-grow relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {renderViewContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Interactive Modal layer for Store Checkout */}
        <AnimatePresence>
          {selectedProduct && (
            <CheckoutModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onSubmitOrder={handleSubmitOrder}
              onSuccess={handleOrderSuccess}
              addToast={addToast}
            />
          )}
        </AnimatePresence>

        {/* Premium Footer Disclaimers */}
        <div className="relative z-10">
          <Footer setView={setView} currentView={currentView} websiteSettings={websiteSettings} />
        </div>

        {/* floating notification dispatcher */}
        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Scroll To Top button */}
        <ScrollToTop />

      </div>
    </>
  );
}
