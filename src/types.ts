export interface Category {
  id: string;
  name: string;
  slug: string;
  gameMode: 'lifesteal' | 'survival';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gameMode: 'lifesteal' | 'survival';
  image: string;
  active: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  username: string;
  discord: string;
  email?: string;
  productId: string;
  productName: string;
  price: number;
  gameMode: 'lifesteal' | 'survival';
  categoryName: string;
  paymentStatus: 'pending' | 'verified' | 'rejected' | 'delivered';
  date: string;
  couponCode?: string;
  discountAmount?: number;
}

export interface PaymentSettings {
  qrCodeUrl: string;
  paymentName: string;
  paymentNumber: string;
  instructions: string;
}

export interface AdminStats {
  revenue: {
    total: number;
    monthly: { name: string; revenue: number }[];
    categoryBreakdown: { name: string; value: number }[];
  };
  orders: {
    total: number;
    pending: number;
    list: Order[];
  };
  products: {
    total: number;
    stats: { name: string; count: number; revenue: number }[];
  };
}

export interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
    list: string[];
  };
  ip: string;
  port: number;
  version: string;
  motd: string;
  ping: number;
  discordMembers?: number;
}

export interface WebsiteSettings {
  // Background config
  backgroundType: 'upload' | 'url' | 'video' | 'gradient' | 'solid';
  backgroundImage: string;
  backgroundVideoUrl: string;
  backgroundSolidColor: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  backgroundOpacity: number;
  backgroundBlur: number;
  overlayColor: string;
  overlayOpacity: number;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  size: 'cover' | 'contain' | 'auto';
  repeat: 'no-repeat' | 'repeat';
  attachment: 'fixed' | 'scroll';
  enableAnimation: boolean;
  enableParticles: boolean;
  enableGradient: boolean;
  enableBlur: boolean;
  enableDark: boolean;
  enableParallax: boolean;

  // Theme branding config
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  navbarColor: string;
  footerColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;
  animationSpeed: 'slow' | 'medium' | 'fast';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  glassBlur: number;
  shadowStrength: 'none' | 'subtle' | 'medium' | 'strong';

  // Logos branding config
  logoUrl: string;
  footerLogoUrl: string;
  loginLogoUrl: string;
  adminLogoUrl: string;
  faviconUrl: string;

  // Server & General configurations
  serverIp: string;
  discordInvite: string;
  paymentQrUrl: string;
  websiteTitle: string;
  websiteTagline?: string;
  seoDescription: string;
  googleAnalyticsId: string;
  footerText: string;

  // Announcement Bar config
  announcementText: string;
  announcementEnabled: boolean;
  announcementBgColor: string;
  announcementLink: string;
  announcementAnimation: 'none' | 'scroll' | 'pulse' | 'bounce';

  // Gameplay showcase screenshots
  showcaseScreenshots: string[]; // Base64 or URLs
  homepageGalleryImage?: string;

  // Live Widgets Configuration
  minecraftServerIp?: string;
  minecraftQueryPort?: number;
  discordServerId?: string;
  discordBotToken?: string;
  refreshInterval?: number;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minimumOrder: number;
  maximumDiscount: number;
  expiryDate: string;
  startDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  status: 'active' | 'disabled';
  description: string;
  appliesTo: 'entire' | 'lifesteal' | 'survival' | 'specific_product' | 'specific_category' | 'ranks' | 'coins' | 'crate-keys' | 'cosmetics';
  targetId?: string; // Optional product id or category id
}

export interface CouponUsage {
  id: string;
  couponId: string;
  couponCode: string;
  username: string;
  orderId: string;
  discountAmount: number;
  date: string;
}

export interface Review {
  id: string;
  username: string;
  avatar: string; // Base64 or URL
  rating: number; // 1-5 stars
  text: string;
  date: string;
}

export interface SocialLinks {
  discord: string;
  youtube: string;
  tiktok: string;
  instagram: string;
  facebook: string;
  twitter: string;
}

