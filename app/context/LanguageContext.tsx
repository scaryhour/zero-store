'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'EN' | 'CN';

interface Translations {
    [key: string]: {
        EN: string;
        CN: string;
    };
}

export const translations: Translations = {
    // Navbar
    'nav.collections': { EN: 'Collections', CN: '系列收藏' },
    'nav.apparel': { EN: 'Apparel', CN: '高端服饰' },
    'nav.footwear': { EN: 'Footwear', CN: '工业鞋履' },
    'nav.archive': { EN: 'Archive NO.', CN: '档案编号' },
    'nav.story': { EN: 'The Story', CN: '品牌故事' },
    'nav.track': { EN: 'Track Order', CN: '订单追踪' },

    // Cart/Wishlist
    'cart.title': { EN: 'Queue', CN: '项目队列' },
    'cart.ready': { EN: 'Ready for Processing', CN: '准备进入处理流程' },
    'cart.empty': { EN: 'No Data Found', CN: '未发现数据' },
    'cart.items': { EN: 'Archive Manifest', CN: '档案项目清单' },
    'cart.total': { EN: 'Total Valuation', CN: '结算总值' },
    'cart.promo': { EN: 'Access Code / Coupons', CN: '访问代码 / 优惠码' },
    'cart.promo_placeholder': { EN: 'ENTER CODE...', CN: '输入代码...' },
    'cart.apply': { EN: 'Apply', CN: '应用' },
    'cart.verifying': { EN: 'Verifying...', CN: '验证中...' },
    'cart.shipping': { EN: 'Free worldwide logistics.', CN: '全链路免费物流' },
    'cart.delete': { EN: 'Delete', CN: '移除项目' },
    'cart.checkout': { EN: 'Confirm Request', CN: '确认下单请求' },
    'cart.processing': { EN: 'Initializing Protocol...', CN: '正在初始化订单...' },
    'wishlist.title': { EN: 'Wishlist', CN: '收藏档案库' },
    'wishlist.empty': { EN: 'Inventory Empty', CN: '收藏夹空无一物' },
    'wishlist.saved': { EN: 'Saved Archive Pieces', CN: '已保存的档案单品' },
    'wishlist.view': { EN: 'View Resource', CN: '查看详情' },
    'wishlist.remove': { EN: 'Remove', CN: '移除' },
    'wishlist.disclaimer': { EN: '* Favorited items do not guarantee stock availability.', CN: '* 收藏不代表库存已锁定' },
    'wishlist.continue': { EN: 'Continue Exploration', CN: '继续探索品牌' },

    // Product Detail
    'product.acquire': { EN: 'Acquire Piece', CN: '获取单品' },
    'product.soldout': { EN: 'Sold Out', CN: '已售罄' },
    'product.select_size_instruction': { EN: 'Select Size to Acquire', CN: '请选择尺码以继续探测' },
    'product.specs': { EN: 'Technical Specs', CN: '技术规格说明' },
    'product.size_guide': { EN: 'Size Calibration', CN: '尺码标定' },

    // Home
    'home.auth': { EN: 'System Authorization: Level 4', CN: '系统访问授权：Level 4' },
    'home.btn_init': { EN: 'Initialize Access', CN: '初始化访问' },
    'home.archive_title': { EN: 'The Archive', CN: '品牌档案库' },
    'home.inventory_scanning': { EN: 'Scanning Cloud Storage...', CN: '正在扫描云端存储...' },
    'home.inventory_active': { EN: 'Active Inventory', CN: '活跃库存' },
    'home.sort_label': { EN: 'SORT BY', CN: '排序方式' },
    'home.sort_newest': { EN: 'NEWEST ARRIVALS', CN: '最新入库' },
    'home.sort_price_low': { EN: 'PRICE: LOW > HIGH', CN: '价格: 从低到高' },
    'home.sort_price_high': { EN: 'PRICE: HIGH > LOW', CN: '价格: 从高到低' },
    'about.title': { EN: 'THE PHILOSOPHY', CN: '品牌哲学' },
    'about.subtitle': { EN: 'ZERO-SYSTEM / METHODOLOGY', CN: 'ZERO-SYSTEM / 核心方法论' },
    'about.story': { EN: 'The Zero Archive is a curated collection of wearable engineering. We focus on technical durability, minimal interference, and the preservation of industrial utility.', CN: 'Zero Archive 是可穿戴工程的精选集合。我们专注于技术耐用性、最小化干扰以及工业实用性的保存。' },
    'about.stats_label': { EN: 'ARCHIVE UNITS DISPATCHED', CN: '已调度归档单位' },
    'product.reviews_title': { EN: 'ARCHIVAL FEEDBACK', CN: '归档反馈' },
    'product.reviews_empty': { EN: 'No entries in this archival node yet.', CN: '此归档节点尚无记录。' },
    'product.write_review': { EN: 'SUBMIT TECHNICAL REPORT', CN: '提交技术报告' },
    'product.rating_label': { EN: 'RATING', CN: '评分' },
    'product.comment_label': { EN: 'DETAILED OBSERVATION', CN: '详细观察' },
    'product.submit_btn': { EN: 'LOCK REPORT', CN: '锁定报告' },
    'profile.title': { EN: 'COLLECTOR PROFILE', CN: '收藏家档案' },
    'profile.subtitle': { EN: 'ARCHIVAL IDENTITY / NODE_ACCESS', CN: '归档身份 / 节点访问' },
    'profile.history_title': { EN: 'ACQUISITION HISTORY', CN: '收购历史' },
    'profile.no_orders': { EN: 'No active archival acquisitions found.', CN: '未发现活跃的归档收购记录。' },
    'profile.logout': { EN: 'SIGNAL_LOGOUT', CN: '信号登出' },
    'profile.stats_orders': { EN: 'UNITS SECURED', CN: '已锁定单位' },
    'home.probe_placeholder': { EN: 'PROBE ARCHIVE (NAME OR NO...)', CN: '搜索项目 (名称或编号...)' },
    'home.syncing': { EN: 'Syncing Data...', CN: '正在同步数据节点...' },
    'home.hero_btn': { EN: 'Secure Piece', CN: '立即锁定' },
    'home.inspect': { EN: 'Inspect Data', CN: '查看详情' },
    'product.scanning': { EN: 'Scanning Archive...', CN: '正在扫描档案库...' },
    'product.lost': { EN: 'Signal Lost / 404', CN: '信号丢失 / 404' },
    'product.return': { EN: 'Return to Base', CN: '返回基地' },
    'product.back': { EN: 'Back to Archive', CN: '返回档案库' },
    'product.active': { EN: 'System Active', CN: '系统已激活' },
    'product.design_specs': { EN: 'Design Specs', CN: '设计规格' },
    'product.select_size': { EN: 'Select Size', CN: '选择尺码' },
    'product.added': { EN: 'Added to Queue', CN: '已加入队列' },
    'product.logistics': { EN: 'Global Logistics', CN: '全球物流' },
    'product.authentic': { EN: 'Authentic-Scan', CN: '正品鉴定' },

    // Footer
    'footer.about': { EN: 'Archive Protocol', CN: '档案协议' },
    'footer.navigation': { EN: 'Archive Navigation', CN: '档案库导航' },
    'footer.legal': { EN: 'Legal Protocol', CN: '法律协议' },
    'footer.status': { EN: 'Global Status', CN: '全球节点状态' },
    'footer.newsletter': { EN: 'Sync with Newsletter', CN: '订阅新品档案' },
    'footer.newsletter_placeholder': { EN: 'SYNC@ARCHIVE.COM', CN: '输入电子邮箱...' },
    'footer.newsletter_success': { EN: 'Node Synchronized.', CN: '节点已同步' },
    'footer.newsletter_error': { EN: 'Connection Failed.', CN: '连接失败' },
    'footer.logistics_status': { EN: 'Worldwide Logistics Active', CN: '全球物流节点活跃' },
    'footer.encryption_status': { EN: 'Encrypted Transmission', CN: '加密传输系统已就绪' },
    'footer.uptime_status': { EN: 'System Uptime: 99.9%', CN: '系统在线：99.9%' },
    'track.title': { EN: 'Track Order', CN: '订单追踪' },
    'track.subtitle': { EN: 'Synchronize with your Archive Request', CN: '同步您的档案下单请求' },
    'track.placeholder': { EN: 'ENTER ARCHIVE ID (ORDER ID)', CN: '输入档案编号 (订单 ID)' },
    'track.error_not_found': { EN: 'Order not found in Zero Archive.', CN: '在档案库中未发现该订单' },
    'track.error_tech': { EN: 'Technical interference detected.', CN: '检测到系统技术干扰' },
    'track.status_payment': { EN: 'Payment Pending', CN: '支付待定' },
    'track.status_processing': { EN: 'Processing', CN: '处理中' },
    'track.status_shipped': { EN: 'Shipped', CN: '已出库' },
    'track.status_delivered': { EN: 'Delivered', CN: '已送达' },

    // New JD Style Footer
    'footer.newsletter_title': { EN: 'Be the first to know', CN: '第一时间获取动态' },
    'footer.newsletter_subtitle': { EN: 'Sign up for the latest Zero Store news, products and offers', CN: '订阅以获取 Zero Store 的最新资讯、产品和优惠' },
    'footer.shopping_title': { EN: 'Shopping with Zero', CN: '在 Zero 购物' },
    'footer.country_label': { EN: 'Country / Region', CN: '国家 / 地区' },
    'footer.payment_label': { EN: 'Payment methods', CN: '支付方式' },
    'footer.follow_us': { EN: 'Follow Us', CN: '关注我们' },
    'footer.all_collections': { EN: 'All Collections', CN: '所有系列' }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('EN');

    useEffect(() => {
        const saved = localStorage.getItem('zero_language') as Language;
        if (saved) setLanguage(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem('zero_language', language);
    }, [language]);

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
