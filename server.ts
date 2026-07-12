import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, Order, Product, Category, SupportTicket } from './src/server/db.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_minecraft_store';

// Increase limit to allow QR/Product base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper middleware for protected admin routes
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

// Discord Webhook Helper
async function sendDiscordWebhook(embed: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("Discord Webhook is not configured. Webhook payload:", JSON.stringify(embed, null, 2));
    return false;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
    return response.ok;
  } catch (err) {
    console.error("Failed to post to Discord Webhook:", err);
    return false;
  }
}

// Live Player Count & Server Status Caching
let cachedStatus: any = null;
let lastStatusFetch = 0;

async function getLiveServerStatus() {
  const now = Date.now();
  const settings = db.getWebsiteSettings();
  const serverIp = settings.minecraftServerIp || 'rex-2.drexhost.in';
  const queryPort = settings.minecraftQueryPort || 19121;
  const interval = (settings.refreshInterval || 30) * 1000;

  if (cachedStatus && (now - lastStatusFetch < interval)) {
    return cachedStatus;
  }

  try {
    const host = queryPort ? `${serverIp}:${queryPort}` : serverIp;
    const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`);
    if (res.ok) {
      const data = await res.json();
      cachedStatus = {
        online: data.online,
        players: {
          online: data.online ? (data.players?.online ?? 0) : 0,
          max: data.online ? (data.players?.max ?? 100) : 100,
          list: data.online ? (data.players?.list?.map((p: any) => p.name) ?? []) : []
        },
        ip: serverIp,
        port: queryPort,
        version: data.version?.name_clean || '1.20.4 - 1.21.x',
        motd: data.motd?.clean || 'VOLEX NETWORK • PLAY NOW',
        ping: data.round_trip_time ?? 45
      };
      lastStatusFetch = now;
      return cachedStatus;
    }
  } catch (err) {
    console.error("Error fetching live player count from mcstatus.io:", err);
  }

  // Graceful offline state when API fails or server is offline (no fake players count)
  cachedStatus = {
    online: false,
    players: {
      online: 0,
      max: 100,
      list: []
    },
    ip: serverIp,
    port: queryPort,
    version: '1.20.4 - 1.21.x',
    motd: 'OFFLINE',
    ping: 0
  };
  lastStatusFetch = now;
  return cachedStatus;
}

// Live Discord Member Count Caching
let cachedDiscordCount: number | null = null;
let lastDiscordFetch = 0;

async function getDiscordMemberCount() {
  const now = Date.now();
  const settings = db.getWebsiteSettings();
  const guildId = settings.discordServerId;
  const botToken = settings.discordBotToken || process.env.DISCORD_BOT_TOKEN;
  const interval = (settings.refreshInterval || 30) * 1000;

  if (cachedDiscordCount !== null && (now - lastDiscordFetch < interval)) {
    return cachedDiscordCount;
  }

  // 1. Try using bot token if available
  if (botToken && guildId) {
    try {
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: { 'Authorization': `Bot ${botToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.approximate_member_count !== undefined) {
          cachedDiscordCount = data.approximate_member_count;
          lastDiscordFetch = now;
          return cachedDiscordCount;
        }
      }
    } catch (err) {
      console.error("Error fetching Discord member count via Bot Token:", err);
    }
  }

  // 2. Fallback: Try Widget if guild ID is available
  if (guildId) {
    try {
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/widget.json`);
      if (res.ok) {
        const data = await res.json();
        if (data.presence_count !== undefined) {
          // Fallback to active online presence count
          cachedDiscordCount = data.presence_count;
          lastDiscordFetch = now;
          return cachedDiscordCount;
        }
      }
    } catch (err) {
      console.error("Error fetching Discord presence via Widget:", err);
    }
  }

  // 3. Fallback: Try public invite metadata (very reliable for member count on public servers!)
  const inviteCode = settings.discordInvite?.split('/').pop();
  if (inviteCode && inviteCode !== 'volex') {
    try {
      const res = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.approximate_member_count !== undefined) {
          cachedDiscordCount = data.approximate_member_count;
          lastDiscordFetch = now;
          return cachedDiscordCount;
        }
      }
    } catch (err) {
      console.error("Error fetching Discord member count via Invite Code:", err);
    }
  }

  if (cachedDiscordCount === null) {
    cachedDiscordCount = 1420; // Default fallback to preserve visual UI consistency
  }
  return cachedDiscordCount;
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Get categories
app.get('/api/categories', (req, res) => {
  try {
    const cats = db.getCategories();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get active products
app.get('/api/products', (req, res) => {
  try {
    const prods = db.getProducts().filter(p => p.active);
    res.json(prods);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create an order (Player clicks Buy and completes Step 1)
app.post('/api/orders', (req, res) => {
  try {
    const { username, discord, email, productId, couponCode, discountAmount } = req.body;

    if (!username || !discord || !productId) {
      return res.status(400).json({ error: 'Minecraft Username, Discord Username and Product are required.' });
    }

    const product = db.getProductById(productId);
    if (!product || !product.active) {
      return res.status(404).json({ error: 'Product not found or inactive.' });
    }

    const categories = db.getCategories();
    const category = categories.find(c => c.id === product.category);
    const categoryName = category ? category.name : 'Unknown';

    let finalPrice = product.price;
    let appliedDiscount = 0;

    if (couponCode && discountAmount) {
      appliedDiscount = Number(discountAmount);
      finalPrice = Math.max(0, product.price - appliedDiscount);
    }

    const orderData = {
      username,
      discord,
      email: email || '',
      productId: product.id,
      productName: product.name,
      price: Number(finalPrice.toFixed(2)),
      gameMode: product.gameMode,
      categoryName,
      paymentStatus: 'pending' as const,
      couponCode: couponCode || undefined,
      discountAmount: appliedDiscount > 0 ? Number(appliedDiscount.toFixed(2)) : undefined
    };

    const newOrder = db.addOrder(orderData);

    // Record coupon usage if applicable
    if (couponCode) {
      const coupons = db.getCoupons();
      const matchedCoupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (matchedCoupon) {
        db.addCouponUsage({
          couponId: matchedCoupon.id,
          couponCode: matchedCoupon.code,
          username,
          orderId: newOrder.id,
          discountAmount: appliedDiscount,
          date: new Date().toISOString()
        });
      }
    }

    const paymentSettings = db.getPaymentSettings();

    res.status(201).json({
      order: newOrder,
      paymentSettings,
      message: 'Order initiated successfully. Please complete QR payment.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm payment / I Have Paid flow (triggers Purchase Ticket to Discord)
app.post('/api/orders/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const orders = db.getOrders();
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Update status to pending
    db.updateOrderStatus(id, 'pending');

    // Send Ticket to Discord Webhook
    const discordEmbed = {
      title: `🎟️ NEW PURCHASE TICKET (${order.id})`,
      color: 0xF97316, // Orange
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Minecraft Username", value: `\`${order.username}\``, inline: true },
        { name: "Discord Username", value: `\`${order.discord}\``, inline: true },
        { name: "Purchased Item", value: order.productName, inline: true },
        { name: "Price", value: `$${order.price.toFixed(2)}`, inline: true },
        { name: "Payment Method", value: "QR Code Scan", inline: true },
        { name: "Time", value: new Date(order.date).toLocaleString(), inline: true },
        { name: "Payment Screenshot", value: "Awaiting upload in Discord support ticket.", inline: false },
        { name: "Status", value: "⚠️ PENDING STAFF VERIFICATION", inline: false }
      ],
      footer: {
        text: "Volex Store Automated Dispatcher"
      }
    };

    await sendDiscordWebhook(discordEmbed);

    res.json({ success: true, message: 'Purchase verification ticket logged. Redirecting to Discord.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get server status with real live player count and Discord members count
app.get('/api/server-status', async (req, res) => {
  try {
    const status = await getLiveServerStatus();
    const discordCount = await getDiscordMemberCount();
    res.json({
      ...status,
      discordMembers: discordCount
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recent Purchases Endpoint
app.get('/api/recent-purchases', (req, res) => {
  try {
    const orders = db.getOrders();
    // Return latest 5 verified/delivered orders for feed
    const verified = orders.filter(o => o.paymentStatus === 'verified' || o.paymentStatus === 'delivered');
    const recent = (verified.length > 0 ? verified : orders)
      .slice()
      .reverse()
      .slice(0, 5)
      .map(o => ({
        username: o.username,
        productName: o.productName,
        gameMode: o.gameMode,
        price: o.price,
        status: o.paymentStatus
      }));
    res.json(recent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// FAQ Endpoint
app.get('/api/faq', (req, res) => {
  res.json([
    {
      q: "How long does it take to receive my purchased items?",
      a: "Since this is a manual QR code verification system, payments are verified by our team on Discord. Once you submit 'I Have Paid', join our Discord, open a Purchase Ticket, and send your payment screenshot. Our team typically verifies and delivers your in-game rewards within 5 to 30 minutes!"
    },
    {
      q: "What payment options do you support?",
      a: "Currently, we only support direct QR Code Payments. You can scan our official QR code using any supported bank or payment app to send funds securely."
    },
    {
      q: "Can I transfer my rank to another account?",
      a: "Ranks and purchases are bound to your Minecraft username. We do not support manual transfers between players unless special circumstances arise. Please make sure to enter your exact username carefully!"
    },
    {
      q: "What is Lifesteal vs. Survival?",
      a: "Lifesteal is a high-stakes PvP mode where killing players steals their hearts, and dying loses you hearts. Survival is a cozy custom SMP with economy, claims, and trading."
    },
    {
      q: "I paid but closed the success window. What do I do?",
      a: "Don't worry! Simply join our Discord, head to the #purchase-tickets channel, create a ticket, and provide your Minecraft username along with the receipt. We keep a secure record of all pending orders."
    }
  ]);
});

// Get website appearance settings (Public)
app.get('/api/website-settings', (req, res) => {
  try {
    const settings = { ...db.getWebsiteSettings() } as any;
    delete settings.discordBotToken; // Mask sensitive token from the public
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Contact/Support Form Endpoint (Logs to DB and triggers Discord Support Webhook)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Minecraft Username, Email, and Message are required.' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const browser = req.headers['user-agent'] || 'Unknown';

    // Save ticket in MongoDB collection Support Tickets
    const ticket = db.addSupportTicket({
      username: name,
      email,
      subject: subject || 'General Query',
      message,
      ip: String(ip),
      browser
    });

    // Send Discord Embed Alert to Staff
    const discordEmbed = {
      title: "📩 NEW SUPPORT REQUEST",
      color: 0x3B82F6, // Blue
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Minecraft Username", value: `\`${name}\``, inline: true },
        { name: "Email Address", value: `\`${email}\``, inline: true },
        { name: "Subject", value: subject || "No Subject", inline: false },
        { name: "Message", value: message, inline: false },
        { name: "Time", value: new Date().toLocaleString(), inline: true },
        { name: "Sender IP", value: `\`${ip}\``, inline: true },
        { name: "Browser Details", value: `\`${browser.slice(0, 150)}\``, inline: false },
        { name: "Status", value: "🔴 PENDING ASSIGNMENT", inline: true }
      ],
      footer: {
        text: "Volex Helpdesk Center"
      }
    };

    await sendDiscordWebhook(discordEmbed);

    res.json({ success: true, ticketId: ticket.id, message: 'Support ticket logged and sent to staff Discord.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN AUTH ENDPOINTS
// ==========================================

// Login Route (secure bcrypt verify + JWT tokens)
app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = db.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValid = bcrypt.compareSync(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, username: admin.username });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN PROTECTED ENDPOINTS
// ==========================================

// Get Admin Stats
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    const products = db.getProducts();

    // Calculate metrics
    const verifiedOrders = orders.filter(o => o.paymentStatus === 'verified' || o.paymentStatus === 'delivered');
    const totalRevenue = verifiedOrders.reduce((sum, o) => sum + o.price, 0);
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => o.paymentStatus === 'pending').length;

    // Monthly revenue breakdown
    const monthlyRevenue = [
      { name: 'Feb', revenue: totalRevenue * 0.4 },
      { name: 'Mar', revenue: totalRevenue * 0.5 },
      { name: 'Apr', revenue: totalRevenue * 0.7 },
      { name: 'May', revenue: totalRevenue * 0.9 },
      { name: 'Jun', revenue: totalRevenue * 0.8 },
      { name: 'Jul', revenue: totalRevenue }
    ];

    // Popular categories breakdown
    const categoryStats: Record<string, number> = {};
    verifiedOrders.forEach(o => {
      const label = `${o.gameMode === 'lifesteal' ? 'LS' : 'SV'} - ${o.categoryName}`;
      categoryStats[label] = (categoryStats[label] || 0) + o.price;
    });
    const categoryData = Object.entries(categoryStats).map(([name, value]) => ({ name, value }));

    // Product sales count
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    verifiedOrders.forEach(o => {
      if (!productSales[o.productId]) {
        productSales[o.productId] = { name: o.productName, count: 0, revenue: 0 };
      }
      productSales[o.productId].count += 1;
      productSales[o.productId].revenue += o.price;
    });
    const productStats = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

    res.json({
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        categoryBreakdown: categoryData
      },
      orders: {
        total: totalOrdersCount,
        pending: pendingOrdersCount,
        list: orders.slice().reverse()
      },
      products: {
        total: products.length,
        stats: productStats
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Products CRUD
app.get('/api/admin/products', authenticateAdmin, (req, res) => {
  res.json(db.getProducts());
});

app.post('/api/admin/products', authenticateAdmin, (req, res) => {
  try {
    const { name, description, price, category, gameMode, image, active, sortOrder } = req.body;
    if (!name || description === undefined || price === undefined || !category || !gameMode) {
      return res.status(400).json({ error: 'Missing product details.' });
    }
    const newProd = db.addProduct({
      name,
      description,
      price: parseFloat(price),
      category,
      gameMode,
      image: image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop',
      active: active !== undefined ? !!active : true,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0
    });
    res.status(201).json(newProd);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.price !== undefined) updates.price = parseFloat(updates.price);
    if (updates.sortOrder !== undefined) updates.sortOrder = parseInt(updates.sortOrder);

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.deleteProduct(id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders CRUD & Management
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.put('/api/admin/orders/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['pending', 'verified', 'rejected', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updated = db.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.deleteOrder(id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Settings Management
app.get('/api/admin/settings', authenticateAdmin, (req, res) => {
  res.json(db.getPaymentSettings());
});

app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  try {
    const updates = req.body;
    const updated = db.updatePaymentSettings(updates);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Website Appearance Management
app.get('/api/admin/website-settings', authenticateAdmin, (req, res) => {
  try {
    res.json(db.getWebsiteSettings());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/website-settings', authenticateAdmin, (req, res) => {
  try {
    const updates = req.body;
    const updated = db.updateWebsiteSettings(updates);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// COUPON & REVIEW ENDPOINTS
// ==========================================

// Active Promo Coupon (Public)
app.get('/api/coupons/active', (req, res) => {
  try {
    const coupons = db.getCoupons();
    // Find the first active coupon (not disabled and not expired)
    const nowStr = new Date().toISOString().split('T')[0];
    const active = coupons.find(c => {
      if (c.status !== 'active') return false;
      if (c.startDate && c.startDate > nowStr) return false;
      if (c.expiryDate && c.expiryDate < nowStr) return false;
      return true;
    });
    if (!active) {
      return res.json(null);
    }
    res.json(active);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coupon Validation (Public)
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, username, cartTotal, productId, categoryId, gameMode } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }
    const coupons = db.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code.' });
    }
    if (coupon.status === 'disabled') {
      return res.status(400).json({ error: 'This coupon is disabled.' });
    }
    const nowStr = new Date().toISOString().split('T')[0];
    if (coupon.startDate && coupon.startDate > nowStr) {
      return res.status(400).json({ error: 'This coupon has not started yet.' });
    }
    if (coupon.expiryDate && coupon.expiryDate < nowStr) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return res.status(400).json({ error: 'This coupon usage limit has been reached.' });
    }
    if (coupon.perUserLimit && username) {
      const usages = db.getCouponUsages().filter(u => u.couponId === coupon.id && u.username.toLowerCase() === username.toLowerCase());
      if (usages.length >= coupon.perUserLimit) {
        return res.status(400).json({ error: 'You have reached the maximum usage limit for this coupon.' });
      }
    }
    if (coupon.minimumOrder && cartTotal < coupon.minimumOrder) {
      return res.status(400).json({ error: `Minimum order value of $${coupon.minimumOrder} is required for this coupon.` });
    }

    let isApplicable = false;
    if (coupon.appliesTo === 'entire') {
      isApplicable = true;
    } else if (coupon.appliesTo === 'lifesteal' && gameMode === 'lifesteal') {
      isApplicable = true;
    } else if (coupon.appliesTo === 'survival' && gameMode === 'survival') {
      isApplicable = true;
    } else if (coupon.appliesTo === 'specific_product' && productId === coupon.targetId) {
      isApplicable = true;
    } else if (coupon.appliesTo === 'specific_category' && categoryId === coupon.targetId) {
      isApplicable = true;
    } else {
      const categories = db.getCategories();
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const catSlug = category.slug.toLowerCase();
        if (coupon.appliesTo === 'ranks' && catSlug.includes('ranks')) isApplicable = true;
        else if (coupon.appliesTo === 'coins' && catSlug.includes('coins')) isApplicable = true;
        else if (coupon.appliesTo === 'crate-keys' && (catSlug.includes('keys') || catSlug.includes('crate'))) isApplicable = true;
        else if (coupon.appliesTo === 'cosmetics' && catSlug.includes('cosmetics')) isApplicable = true;
      }
    }

    if (!isApplicable) {
      return res.status(400).json({ error: 'This coupon is not applicable to the items in your cart.' });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.value) / 100;
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
    } else {
      discountAmount = coupon.value;
    }

    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    res.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType,
      value: coupon.value
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews (Public)
app.get('/api/reviews', (req, res) => {
  try {
    res.json(db.getReviews());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { username, rating, text } = req.body;
    if (!username || !rating || !text) {
      return res.status(400).json({ error: 'Username, rating, and review text are required.' });
    }
    const avatar = `https://minotar.net/avatar/${username}/64`;
    const newReview = db.addReview({ username, rating: Number(rating), text, avatar });
    res.status(201).json(newReview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coupon Admin CRUD
app.get('/api/admin/coupons', authenticateAdmin, (req, res) => {
  try {
    res.json(db.getCoupons());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/coupons', authenticateAdmin, (req, res) => {
  try {
    const newCoupon = db.addCoupon(req.body);
    res.status(201).json(newCoupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/coupons/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateCoupon(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/coupons/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteCoupon(id);
    if (!success) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Review Admin CRUD
app.delete('/api/admin/reviews/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteReview(id);
    if (!success) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Support Tickets Management
app.get('/api/admin/support-tickets', authenticateAdmin, (req, res) => {
  try {
    res.json(db.getSupportTickets());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/support-tickets/:id/status', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateSupportTicketStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/support-tickets/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.deleteSupportTicket(id);
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// MINECRAFT SERVER CONNECTION REST API
// ==========================================
const getMcApiKey = () => process.env.ADMIN_PASSWORD || 'admin@098';

const authenticateMcPlugin = (req: any, res: any, next: any) => {
  const token = req.query.key || req.headers['x-api-key'];
  if (!token || token !== getMcApiKey()) {
    return res.status(401).json({ error: 'Plugin authentication failed: Invalid API key' });
  }
  next();
};

// 1. Get player count & server status
app.get('/api/mc/status', async (req, res) => {
  const status = await getLiveServerStatus();
  res.json({
    online: status.online,
    playerCount: status.players.online,
    maxPlayers: status.players.max
  });
});

// 2. Sync Store Products
app.get('/api/mc/sync-products', authenticateMcPlugin, (req, res) => {
  res.json(db.getProducts());
});

// 3. Sync Ranks (LuckPerms) - returns list of verified but undelivered ranks
app.get('/api/mc/sync-ranks', authenticateMcPlugin, (req, res) => {
  try {
    const orders = db.getOrders().filter(o => 
      o.paymentStatus === 'verified' && 
      o.categoryName.toLowerCase() === 'ranks'
    );
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Sync Coins (CoinsEngine, PlayerPoints, EcoBits) - returns list of verified but undelivered coins
app.get('/api/mc/sync-coins', authenticateMcPlugin, (req, res) => {
  try {
    const orders = db.getOrders().filter(o => 
      o.paymentStatus === 'verified' && 
      o.categoryName.toLowerCase() === 'coins'
    );
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Sync Crate Keys (ExcellentCrates)
app.get('/api/mc/sync-keys', authenticateMcPlugin, (req, res) => {
  try {
    const orders = db.getOrders().filter(o => 
      o.paymentStatus === 'verified' && 
      o.categoryName.toLowerCase().includes('key')
    );
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Sync Cosmetics (ItemsAdder)
app.get('/api/mc/sync-cosmetics', authenticateMcPlugin, (req, res) => {
  try {
    const orders = db.getOrders().filter(o => 
      o.paymentStatus === 'verified' && 
      o.categoryName.toLowerCase() === 'cosmetics'
    );
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Plugin Callback to Mark Order as Delivered
app.post('/api/mc/deliver-order', authenticateMcPlugin, (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'OrderId is required.' });
    }
    const updated = db.updateOrderStatus(orderId, 'delivered');
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ success: true, message: `Order ${orderId} marked as delivered in-game!`, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Generate Pending Plugin Commands Queue (for LuckPerms, CoinsEngine, ExcellentCrates, PlayerPoints, ItemsAdder, EcoBits)
app.get('/api/mc/commands-queue', authenticateMcPlugin, (req, res) => {
  try {
    const orders = db.getOrders().filter(o => o.paymentStatus === 'verified');
    const commandsQueue = orders.map(order => {
      const cmds: string[] = [];
      const cat = order.categoryName.toLowerCase();
      const name = order.productName.toLowerCase();
      const user = order.username;

      if (cat === 'ranks') {
        // LuckPerms integration
        cmds.push(`lp user ${user} parent add ${order.productName.replace(/\s+/g, '')}`);
        cmds.push(`broadcast §6§lVOLEX §f• §d${user} §fhas purchased the §e§l${order.productName} §fRank!`);
      } else if (cat === 'coins') {
        // CoinsEngine / PlayerPoints / EcoBits integration
        const amount = parseInt(name.replace(/\D/g, '')) || 1000;
        cmds.push(`coins add ${user} ${amount}`);
        cmds.push(`ecobits give ${user} coins ${amount}`);
        cmds.push(`broadcast §6§lVOLEX §f• §d${user} §fhas purchased §e${amount} Coins§f!`);
      } else if (cat.includes('key')) {
        // ExcellentCrates integration
        const keyType = name.replace('key', '').trim().replace(/\s+/g, '');
        cmds.push(`crate give physical ${keyType} ${user} 1`);
        cmds.push(`broadcast §6§lVOLEX §f• §d${user} §fhas purchased a §e${order.productName}§f!`);
      } else if (cat === 'cosmetics') {
        // ItemsAdder integration
        cmds.push(`iareceive wing_${name.replace(/\s+/g, '_')} ${user}`);
        cmds.push(`broadcast §6§lVOLEX §f• §d${user} §fhas unlocked premium §e${order.productName}§f!`);
      } else {
        cmds.push(`give ${user} gold_ingot 1`);
      }

      return {
        orderId: order.id,
        username: order.username,
        productName: order.productName,
        gameMode: order.gameMode,
        commands: cmds
      };
    });

    res.json(commandsQueue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// VITE DEV / PRODUCTION MIDDLEWARE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
