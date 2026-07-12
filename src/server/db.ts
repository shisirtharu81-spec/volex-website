import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

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
  category: string; // ID of category
  gameMode: 'lifesteal' | 'survival';
  image: string; // Base64 or URL
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

export interface SupportTicket {
  id: string;
  username: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  ip: string;
  browser: string;
  status: 'pending' | 'resolved';
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

export interface DatabaseSchema {
  admins: { id: string; username: string; passwordHash: string }[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  paymentSettings: PaymentSettings;
  supportTickets: SupportTicket[];
  websiteSettings?: WebsiteSettings;
  coupons?: Coupon[];
  couponUsages?: CouponUsage[];
  reviews?: Review[];
  socialLinks?: SocialLinks;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Base64 QR Code placeholder for payment simulation with VOLEX logo text
const DEFAULT_QR_CODE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><rect width='200' height='200' fill='white' rx='16'/><rect x='25' y='25' width='45' height='45' fill='black' rx='4'/><rect x='33' y='33' width='29' height='29' fill='white' rx='2'/><rect x='39' y='39' width='17' height='17' fill='black' rx='1'/><rect x='130' y='25' width='45' height='45' fill='black' rx='4'/><rect x='138' y='33' width='29' height='29' fill='white' rx='2'/><rect x='144' y='39' width='17' height='17' fill='black' rx='1'/><rect x='25' y='130' width='45' height='45' fill='black' rx='4'/><rect x='33' y='138' width='29' height='29' fill='white' rx='2'/><rect x='39' y='144' width='17' height='17' fill='black' rx='1'/><rect x='145' y='145' width='15' height='15' fill='black' rx='1'/><rect x='80' y='30' width='10' height='10' fill='black'/><rect x='100' y='25' width='15' height='10' fill='black'/><rect x='110' y='45' width='10' height='15' fill='black'/><rect x='85' y='65' width='15' height='10' fill='black'/><rect x='25' y='85' width='10' height='20' fill='black'/><rect x='45' y='100' width='20' height='10' fill='black'/><rect x='80' y='90' width='40' height='40' fill='black' rx='3'/><rect x='90' y='100' width='20' height='20' fill='white' rx='1'/><rect x='135' y='85' width='20' height='10' fill='black'/><rect x='155' y='105' width='15' height='15' fill='black'/><rect x='85' y='145' width='15' height='10' fill='black'/><rect x='110' y='160' width='10' height='15' fill='black'/><text x='100' y='188' font-family='sans-serif' font-size='11' font-weight='900' text-anchor='middle' fill='black' letter-spacing='1'>VOLEX PAY QR</text></svg>";

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ls-ranks', name: 'Ranks', slug: 'ranks', gameMode: 'lifesteal' },
  { id: 'ls-coins', name: 'Coins', slug: 'coins', gameMode: 'lifesteal' },
  { id: 'ls-keys', name: 'Crate Keys', slug: 'crate-keys', gameMode: 'lifesteal' },
  { id: 'ls-cosmetics', name: 'Cosmetics', slug: 'cosmetics', gameMode: 'lifesteal' },
  { id: 'sv-ranks', name: 'Ranks', slug: 'ranks', gameMode: 'survival' },
  { id: 'sv-coins', name: 'Coins', slug: 'coins', gameMode: 'survival' },
  { id: 'sv-keys', name: 'Crate Keys', slug: 'crate-keys', gameMode: 'survival' }
];

// Requirement 4: Delete ALL demo products, keeping only empty categories
const DEFAULT_PRODUCTS: Product[] = [];

function sanitizeMongoUri(uri: string): string {
  if (!uri) return uri;
  try {
    let prefix = '';
    if (uri.startsWith('mongodb+srv://')) {
      prefix = 'mongodb+srv://';
    } else if (uri.startsWith('mongodb://')) {
      prefix = 'mongodb://';
    } else {
      return uri;
    }

    const rest = uri.slice(prefix.length);
    const lastAtIdx = rest.lastIndexOf('@');
    if (lastAtIdx === -1) {
      return uri;
    }

    const credentialsPart = rest.slice(0, lastAtIdx);
    const hostPart = rest.slice(lastAtIdx + 1);

    const firstColonIdx = credentialsPart.indexOf(':');
    if (firstColonIdx === -1) {
      const encodedUser = encodeURIComponent(credentialsPart);
      return `${prefix}${encodedUser}@${hostPart}`;
    }

    const username = credentialsPart.slice(0, firstColonIdx);
    const password = credentialsPart.slice(firstColonIdx + 1);

    const encodedUser = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);

    return `${prefix}${encodedUser}:${encodedPassword}@${hostPart}`;
  } catch (err) {
    console.error("Error sanitizing MongoDB URI:", err);
    return uri;
  }
}

class UnifiedDatabase {
  private data!: DatabaseSchema;
  private mongoDb: Db | null = null;
  private isMongoConnected = false;

  constructor() {
    this.init();
  }

  private async init() {
    // 1. Initialize local cache from defaults
    this.data = {
      admins: [],
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      orders: [],
      paymentSettings: {
        qrCodeUrl: DEFAULT_QR_CODE,
        paymentName: 'Volex Payment Services',
        paymentNumber: '+1 (800) 555-0199',
        instructions: 'Scan the QR code below using your mobile banking or payment app. Complete the payment of the exact amount specified, then take a screenshot of the transaction receipt. Join our Discord server and create a purchase ticket with your receipt to receive your item.'
      },
      supportTickets: [],
      websiteSettings: {
        backgroundType: 'url',
        backgroundImage: '',
        backgroundVideoUrl: '',
        backgroundSolidColor: '#080808',
        backgroundGradientStart: '#080808',
        backgroundGradientEnd: '#141414',
        backgroundOpacity: 100,
        backgroundBlur: 0,
        overlayColor: '#000000',
        overlayOpacity: 40,
        position: 'center',
        size: 'cover',
        repeat: 'no-repeat',
        attachment: 'fixed',
        enableAnimation: true,
        enableParticles: true,
        enableGradient: true,
        enableBlur: true,
        enableDark: true,
        enableParallax: true,

        primaryColor: '#FF7A00',
        secondaryColor: '#FF9F43',
        buttonColor: '#FF7A00',
        navbarColor: '#000000/60',
        footerColor: '#080808',
        cardColor: '#111111/40',
        textColor: '#FFFFFF',
        borderColor: '#27272A',
        animationSpeed: 'medium',
        borderRadius: '2xl',
        glassBlur: 8,
        shadowStrength: 'medium',

        logoUrl: '',
        footerLogoUrl: '',
        loginLogoUrl: '',
        adminLogoUrl: '',
        faviconUrl: '',

        serverIp: 'rex-2.drexhost.in:19121',
        discordInvite: 'https://discord.gg/volex',
        paymentQrUrl: '',
        websiteTitle: 'Volex Store',
        seoDescription: 'Volex Store - Ranks, Coins, Keys & Cosmetics',
        googleAnalyticsId: '',
        footerText: 'We are not affiliated with Mojang Studios.',

        announcementText: '🔥 WINTER SALE IN PROGRESS! USE CODE VOLEX FOR 15% OFF!',
        announcementEnabled: true,
        announcementBgColor: '#FF7A00',
        announcementLink: '',
        announcementAnimation: 'pulse',

        showcaseScreenshots: []
      },
      coupons: [],
      couponUsages: [],
      reviews: [
        {
          id: 'rev-1',
          username: 'Steve_Mine',
          avatar: 'https://minotar.net/avatar/Steve_Mine/64',
          rating: 5,
          text: 'Volex is hands down the best lifesteal server out there! Smooth rank deliveries and awesome gameplay mechanics. Highly recommended!',
          date: '2026-05-14'
        },
        {
          id: 'rev-2',
          username: 'Alex_Builder',
          avatar: 'https://minotar.net/avatar/Alex_Builder/64',
          rating: 5,
          text: 'Fast coin delivery, epic custom items, and super helpful staff on Discord. Will definitely buy again!',
          date: '2026-06-02'
        },
        {
          id: 'rev-3',
          username: 'VolexFan_99',
          avatar: 'https://minotar.net/avatar/VolexFan_99/64',
          rating: 5,
          text: 'Really cool rank perks and custom tags! Customer support ticket solved my minor issue in under 5 minutes.',
          date: '2026-07-10'
        }
      ]
    };

    // Ensure directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // 2. Try loading local json file first
    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.admins) this.data.admins = parsed.admins;
        if (parsed.categories) this.data.categories = parsed.categories;
        if (parsed.products) this.data.products = parsed.products;
        if (parsed.orders) this.data.orders = parsed.orders;
        if (parsed.paymentSettings) this.data.paymentSettings = parsed.paymentSettings;
        if (parsed.supportTickets) this.data.supportTickets = parsed.supportTickets || [];
        if (parsed.websiteSettings) {
          this.data.websiteSettings = { ...this.data.websiteSettings, ...parsed.websiteSettings };
        }
        if (parsed.coupons) this.data.coupons = parsed.coupons;
        if (parsed.couponUsages) this.data.couponUsages = parsed.couponUsages;
        if (parsed.reviews) this.data.reviews = parsed.reviews;
      } catch (err) {
        console.error("Local db.json read error, using default layout", err);
      }
    }

    // Ensure we have correct Admin username/password from env
    this.syncAdminCredentials();

    // 3. Try to connect to MongoDB if URI is configured
    const rawMongoUri = process.env.MONGODB_URI;
    if (rawMongoUri) {
      const mongoUri = sanitizeMongoUri(rawMongoUri);
      try {
        console.log("Connecting to MongoDB...");
        const client = new MongoClient(mongoUri, {
          connectTimeoutMS: 5000,
          socketTimeoutMS: 5000,
        });
        await client.connect();
        this.mongoDb = client.db();
        this.isMongoConnected = true;
        console.log("Successfully connected to MongoDB!");

        // Sync MongoDB with cache or vice versa
        await this.syncWithMongo();
      } catch (err) {
        console.error("Failed to connect to MongoDB, operating in local fallback mode:", err);
      }
    } else {
      console.log("No MONGODB_URI environment variable detected. Running in local file database mode.");
      this.saveLocal();
    }
  }

  private syncAdminCredentials() {
    const targetUsername = process.env.ADMIN_USERNAME || 'admin';
    const targetPassword = process.env.ADMIN_PASSWORD || 'admin@098';

    // Hash password securely using bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(targetPassword, salt);

    // Filter out any other admin to ensure we strictly use 'admin' as configured
    this.data.admins = [
      {
        id: 'admin-main',
        username: targetUsername,
        passwordHash
      }
    ];
  }

  private async syncWithMongo() {
    if (!this.mongoDb) return;

    try {
      // 1. Admins
      const adminsColl = this.mongoDb.collection('admins');
      const countAdmins = await adminsColl.countDocuments();
      if (countAdmins === 0) {
        await adminsColl.insertMany(this.data.admins);
      } else {
        const dbAdmins = await adminsColl.find().toArray();
        // Update admin password hash in DB if env changed, otherwise sync local with DB
        const envUsername = process.env.ADMIN_USERNAME || 'admin';
        const envPassword = process.env.ADMIN_PASSWORD || 'admin@098';
        const matchAdmin = dbAdmins.find(a => a.username === envUsername);
        if (matchAdmin) {
          // Verify if password changed in environment, if so update MongoDB
          const isSamePassword = bcrypt.compareSync(envPassword, matchAdmin.passwordHash);
          if (!isSamePassword) {
            const salt = bcrypt.genSaltSync(10);
            const newHash = bcrypt.hashSync(envPassword, salt);
            await adminsColl.updateOne({ _id: matchAdmin._id }, { $set: { passwordHash: newHash } });
            matchAdmin.passwordHash = newHash;
          }
        } else {
          // Insert the admin if missing from DB
          const salt = bcrypt.genSaltSync(10);
          const newHash = bcrypt.hashSync(envPassword, salt);
          await adminsColl.insertOne({ id: 'admin-main', username: envUsername, passwordHash: newHash });
        }
        
        // Refresh local cache with latest db contents
        const updatedAdmins = await adminsColl.find().toArray();
        this.data.admins = updatedAdmins.map((a: any) => ({ id: a.id, username: a.username, passwordHash: a.passwordHash }));
      }

      // 2. Categories
      const catColl = this.mongoDb.collection('categories');
      const countCats = await catColl.countDocuments();
      if (countCats === 0) {
        await catColl.insertMany(this.data.categories);
      } else {
        const dbCats = await catColl.find().toArray();
        this.data.categories = dbCats.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, gameMode: c.gameMode }));
      }

      // 3. Products
      const prodColl = this.mongoDb.collection('products');
      const countProds = await prodColl.countDocuments();
      if (countProds === 0 && this.data.products.length > 0) {
        await prodColl.insertMany(this.data.products);
      } else {
        const dbProds = await prodColl.find().toArray();
        this.data.products = dbProds.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          gameMode: p.gameMode,
          image: p.image,
          active: p.active,
          sortOrder: p.sortOrder
        }));
      }

      // 4. Orders
      const orderColl = this.mongoDb.collection('orders');
      const dbOrders = await orderColl.find().toArray();
      if (dbOrders.length > 0) {
        this.data.orders = dbOrders.map((o: any) => ({
          id: o.id,
          username: o.username,
          discord: o.discord,
          email: o.email,
          productId: o.productId,
          productName: o.productName,
          price: o.price,
          gameMode: o.gameMode,
          categoryName: o.categoryName,
          paymentStatus: o.paymentStatus,
          date: o.date
        }));
      } else if (this.data.orders.length > 0) {
        await orderColl.insertMany(this.data.orders);
      }

      // 5. Settings / Payments
      const settingsColl = this.mongoDb.collection('settings');
      let paymentSettingsDoc = await settingsColl.findOne({ type: 'paymentSettings' });
      if (paymentSettingsDoc) {
        if (paymentSettingsDoc.qrCodeUrl && paymentSettingsDoc.qrCodeUrl.includes("AETHERIA")) {
          console.log("Migrating older Aetheria QR code in MongoDB to new Volex QR code...");
          await settingsColl.updateOne(
            { type: 'paymentSettings' },
            { $set: { qrCodeUrl: DEFAULT_QR_CODE } }
          );
          paymentSettingsDoc.qrCodeUrl = DEFAULT_QR_CODE;
        }
        this.data.paymentSettings = {
          qrCodeUrl: paymentSettingsDoc.qrCodeUrl,
          paymentName: paymentSettingsDoc.paymentName,
          paymentNumber: paymentSettingsDoc.paymentNumber,
          instructions: paymentSettingsDoc.instructions
        };
      } else {
        await settingsColl.insertOne({
          type: 'paymentSettings',
          ...this.data.paymentSettings
        });
      }

      // 6. Support Tickets
      const ticketColl = this.mongoDb.collection('support_tickets');
      const dbTickets = await ticketColl.find().toArray();
      if (dbTickets.length > 0) {
        this.data.supportTickets = dbTickets.map((t: any) => ({
          id: t.id,
          username: t.username,
          email: t.email,
          subject: t.subject,
          message: t.message,
          date: t.date,
          ip: t.ip,
          browser: t.browser,
          status: t.status
        }));
      } else if (this.data.supportTickets.length > 0) {
        await ticketColl.insertMany(this.data.supportTickets);
      }

      // 7. Website Appearance Settings
      const appearanceColl = this.mongoDb.collection('website_settings');
      let appearanceDoc = await appearanceColl.findOne({ type: 'appearance' });
      if (appearanceDoc) {
        const { _id, type, ...rest } = appearanceDoc;
        this.data.websiteSettings = {
          ...this.getWebsiteSettings(),
          ...rest
        } as any;
      } else {
        await appearanceColl.insertOne({
          type: 'appearance',
          ...this.getWebsiteSettings()
        });
      }

      this.saveLocal();
    } catch (err) {
      console.error("Error syncing with MongoDB", err);
    }
  }

  private saveLocal() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Failed to write to local database file", e);
    }
  }

  // Categories API
  getCategories() {
    return this.data.categories;
  }

  addCategory(category: Omit<Category, 'id'>) {
    const newCat: Category = {
      ...category,
      id: 'cat-' + Math.random().toString(36).substring(2, 9)
    };
    this.data.categories.push(newCat);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('categories').insertOne(newCat).catch(err => {
        console.error("Failed async insert to MongoDB categories:", err);
      });
    }
    return newCat;
  }

  deleteCategory(id: string) {
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('categories').deleteOne({ id }).catch(err => {
        console.error("Failed async delete from MongoDB categories:", err);
      });
    }
  }

  // Products API
  getProducts() {
    return this.data.products;
  }

  getProductById(id: string) {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProd: Product = {
      ...product,
      id: 'prod-' + Math.random().toString(36).substring(2, 9)
    };
    this.data.products.push(newProd);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('products').insertOne(newProd).catch(err => {
        console.error("Failed async insert to MongoDB products:", err);
      });
    }
    return newProd;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('products').updateOne({ id }, { $set: updates }).catch(err => {
          console.error("Failed async update to MongoDB products:", err);
        });
      }
      return this.data.products[idx];
    }
    return null;
  }

  deleteProduct(id: string) {
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('products').deleteOne({ id }).catch(err => {
        console.error("Failed async delete from MongoDB products:", err);
      });
    }
  }

  // Orders API
  getOrders() {
    return this.data.orders;
  }

  addOrder(order: Omit<Order, 'id' | 'date'>) {
    const newOrder: Order = {
      ...order,
      id: 'ord-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: new Date().toISOString()
    };
    this.data.orders.push(newOrder);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('orders').insertOne(newOrder).catch(err => {
        console.error("Failed async insert to MongoDB orders:", err);
      });
    }
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['paymentStatus']) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx].paymentStatus = status;
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('orders').updateOne({ id }, { $set: { paymentStatus: status } }).catch(err => {
          console.error("Failed async update to MongoDB orders:", err);
        });
      }
      return this.data.orders[idx];
    }
    return null;
  }

  deleteOrder(id: string) {
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('orders').deleteOne({ id }).catch(err => {
        console.error("Failed async delete from MongoDB orders:", err);
      });
    }
  }

  // Admins API
  getAdmins() {
    return this.data.admins;
  }

  getAdminByUsername(username: string) {
    return this.data.admins.find(a => a.username === username);
  }

  // Support Tickets API
  getSupportTickets() {
    return this.data.supportTickets;
  }

  addSupportTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'status'>) {
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'tkt-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      status: 'pending'
    };
    this.data.supportTickets.push(newTicket);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('support_tickets').insertOne(newTicket).catch(err => {
        console.error("Failed async insert to MongoDB support_tickets:", err);
      });
    }
    return newTicket;
  }

  updateSupportTicketStatus(id: string, status: SupportTicket['status']) {
    const idx = this.data.supportTickets.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.supportTickets[idx].status = status;
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('support_tickets').updateOne({ id }, { $set: { status } }).catch(err => {
          console.error("Failed async update to MongoDB support_tickets:", err);
        });
      }
      return this.data.supportTickets[idx];
    }
    return null;
  }

  deleteSupportTicket(id: string) {
    this.data.supportTickets = this.data.supportTickets.filter(t => t.id !== id);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('support_tickets').deleteOne({ id }).catch(err => {
        console.error("Failed async delete from MongoDB support_tickets:", err);
      });
    }
  }

  // Settings API
  getPaymentSettings() {
    return this.data.paymentSettings;
  }

  updatePaymentSettings(updates: Partial<PaymentSettings>) {
    this.data.paymentSettings = { ...this.data.paymentSettings, ...updates };
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('settings').updateOne(
        { type: 'paymentSettings' },
        { $set: updates },
        { upsert: true }
      ).catch(err => {
        console.error("Failed async update to MongoDB settings:", err);
      });
    }
    return this.data.paymentSettings;
  }

  // Website Settings API
  getWebsiteSettings(): WebsiteSettings {
    if (!this.data.websiteSettings) {
      this.data.websiteSettings = {
        backgroundType: 'url',
        backgroundImage: '',
        backgroundVideoUrl: '',
        backgroundSolidColor: '#080808',
        backgroundGradientStart: '#080808',
        backgroundGradientEnd: '#141414',
        backgroundOpacity: 100,
        backgroundBlur: 0,
        overlayColor: '#000000',
        overlayOpacity: 40,
        position: 'center',
        size: 'cover',
        repeat: 'no-repeat',
        attachment: 'fixed',
        enableAnimation: true,
        enableParticles: true,
        enableGradient: true,
        enableBlur: true,
        enableDark: true,
        enableParallax: true,

        primaryColor: '#FF7A00',
        secondaryColor: '#FF9F43',
        buttonColor: '#FF7A00',
        navbarColor: '#000000/60',
        footerColor: '#080808',
        cardColor: '#111111/40',
        textColor: '#FFFFFF',
        borderColor: '#27272A',
        animationSpeed: 'medium',
        borderRadius: '2xl',
        glassBlur: 8,
        shadowStrength: 'medium',

        logoUrl: '',
        footerLogoUrl: '',
        loginLogoUrl: '',
        adminLogoUrl: '',
        faviconUrl: '',

        serverIp: 'rex-2.drexhost.in:19121',
        discordInvite: 'https://discord.gg/volex',
        paymentQrUrl: '',
        websiteTitle: 'Volex Store',
        websiteTagline: 'Official Minecraft Store',
        seoDescription: 'Volex Store - Ranks, Coins, Keys & Cosmetics',
        googleAnalyticsId: '',
        footerText: 'We are not affiliated with Mojang Studios.',

        announcementText: '🔥 WINTER SALE IN PROGRESS! USE CODE VOLEX FOR 15% OFF!',
        announcementEnabled: true,
        announcementBgColor: '#FF7A00',
        announcementLink: '',
        announcementAnimation: 'pulse',

        showcaseScreenshots: [],
        minecraftServerIp: 'rex-2.drexhost.in',
        minecraftQueryPort: 19121,
        discordServerId: '123456789012345678',
        discordBotToken: '',
        refreshInterval: 30
      };
    } else {
      // Ensure any missing properties from the expanded list get filled with defaults
      const defaults: Partial<WebsiteSettings> = {
        backgroundVideoUrl: '',
        backgroundSolidColor: '#080808',
        backgroundGradientStart: '#080808',
        backgroundGradientEnd: '#141414',
        enableParallax: true,
        primaryColor: '#FF7A00',
        secondaryColor: '#FF9F43',
        buttonColor: '#FF7A00',
        navbarColor: '#000000/60',
        footerColor: '#080808',
        cardColor: '#111111/40',
        textColor: '#FFFFFF',
        borderColor: '#27272A',
        animationSpeed: 'medium',
        borderRadius: '2xl',
        glassBlur: 8,
        shadowStrength: 'medium',
        logoUrl: '',
        footerLogoUrl: '',
        loginLogoUrl: '',
        adminLogoUrl: '',
        faviconUrl: '',
        serverIp: 'rex-2.drexhost.in:19121',
        discordInvite: 'https://discord.gg/volex',
        paymentQrUrl: '',
        websiteTitle: 'Volex Store',
        websiteTagline: 'Official Minecraft Store',
        seoDescription: 'Volex Store - Ranks, Coins, Keys & Cosmetics',
        googleAnalyticsId: '',
        footerText: 'We are not affiliated with Mojang Studios.',
        announcementText: '🔥 WINTER SALE IN PROGRESS! USE CODE VOLEX FOR 15% OFF!',
        announcementEnabled: true,
        announcementBgColor: '#FF7A00',
        announcementLink: '',
        announcementAnimation: 'pulse',
        showcaseScreenshots: [],
        homepageGalleryImage: 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=1200&auto=format&fit=crop',
        minecraftServerIp: 'rex-2.drexhost.in',
        minecraftQueryPort: 19121,
        discordServerId: '123456789012345678',
        discordBotToken: '',
        refreshInterval: 30
      };
      let changed = false;
      for (const key of Object.keys(defaults)) {
        if ((this.data.websiteSettings as any)[key] === undefined) {
          (this.data.websiteSettings as any)[key] = (defaults as any)[key];
          changed = true;
        }
      }
      if (changed) {
        this.saveLocal();
      }
    }
    return this.data.websiteSettings;
  }

  updateWebsiteSettings(updates: Partial<WebsiteSettings>) {
    this.data.websiteSettings = { ...this.getWebsiteSettings(), ...updates };
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      const { _id, type, ...rest } = this.data.websiteSettings as any;
      this.mongoDb.collection('website_settings').updateOne(
        { type: 'appearance' },
        { $set: rest },
        { upsert: true }
      ).catch(err => {
        console.error("Failed async update to MongoDB website_settings:", err);
      });
    }
    return this.data.websiteSettings;
  }

  // Coupons API
  getCoupons(): Coupon[] {
    if (!this.data.coupons) {
      this.data.coupons = [];
    }
    return this.data.coupons;
  }

  addCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: 'cp-' + Math.random().toString(36).substring(2, 9),
      usedCount: 0
    };
    if (!this.data.coupons) this.data.coupons = [];
    this.data.coupons.push(newCoupon);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('coupons').insertOne(newCoupon).catch(err => {
        console.error("Failed async insert to MongoDB coupons:", err);
      });
    }
    return newCoupon;
  }

  updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const coupons = this.getCoupons();
    const idx = coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      coupons[idx] = { ...coupons[idx], ...updates };
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('coupons').updateOne({ id }, { $set: updates }).catch(err => {
          console.error("Failed async update to MongoDB coupons:", err);
        });
      }
      return coupons[idx];
    }
    return null;
  }

  deleteCoupon(id: string): boolean {
    const coupons = this.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    if (filtered.length !== coupons.length) {
      this.data.coupons = filtered;
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('coupons').deleteOne({ id }).catch(err => {
          console.error("Failed async delete from MongoDB coupons:", err);
        });
      }
      return true;
    }
    return false;
  }

  // Coupon Usages
  getCouponUsages(): CouponUsage[] {
    if (!this.data.couponUsages) {
      this.data.couponUsages = [];
    }
    return this.data.couponUsages;
  }

  addCouponUsage(usage: Omit<CouponUsage, 'id'>): CouponUsage {
    const newUsage: CouponUsage = {
      ...usage,
      id: 'cpu-' + Math.random().toString(36).substring(2, 9)
    };
    if (!this.data.couponUsages) this.data.couponUsages = [];
    this.data.couponUsages.push(newUsage);

    // Increment usedCount on coupon
    const coupons = this.getCoupons();
    const cIdx = coupons.findIndex(c => c.id === usage.couponId);
    if (cIdx !== -1) {
      coupons[cIdx].usedCount = (coupons[cIdx].usedCount || 0) + 1;
    }

    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('coupon_usages').insertOne(newUsage).catch(err => {
        console.error("Failed async insert to MongoDB coupon_usages:", err);
      });
      if (cIdx !== -1) {
        this.mongoDb.collection('coupons').updateOne({ id: usage.couponId }, { $inc: { usedCount: 1 } }).catch(err => {
          console.error("Failed async update to MongoDB coupon usedCount:", err);
        });
      }
    }
    return newUsage;
  }

  // Reviews API
  getReviews(): Review[] {
    if (!this.data.reviews) {
      this.data.reviews = [];
    }
    return this.data.reviews;
  }

  addReview(review: Omit<Review, 'id' | 'date'>): Review {
    const newReview: Review = {
      ...review,
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0]
    };
    if (!this.data.reviews) this.data.reviews = [];
    this.data.reviews.push(newReview);
    this.saveLocal();

    if (this.isMongoConnected && this.mongoDb) {
      this.mongoDb.collection('reviews').insertOne(newReview).catch(err => {
        console.error("Failed async insert to MongoDB reviews:", err);
      });
    }
    return newReview;
  }

  updateReview(id: string, updates: Partial<Review>): Review | null {
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      reviews[idx] = { ...reviews[idx], ...updates };
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('reviews').updateOne({ id }, { $set: updates }).catch(err => {
          console.error("Failed async update to MongoDB reviews:", err);
        });
      }
      return reviews[idx];
    }
    return null;
  }

  deleteReview(id: string): boolean {
    const reviews = this.getReviews();
    const filtered = reviews.filter(r => r.id !== id);
    if (filtered.length !== reviews.length) {
      this.data.reviews = filtered;
      this.saveLocal();

      if (this.isMongoConnected && this.mongoDb) {
        this.mongoDb.collection('reviews').deleteOne({ id }).catch(err => {
          console.error("Failed async delete from MongoDB reviews:", err);
        });
      }
      return true;
    }
    return false;
  }
}

export const db = new UnifiedDatabase();
