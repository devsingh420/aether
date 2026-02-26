import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'fruits' },
            update: {},
            create: {
                name: 'Fruits',
                slug: 'fruits',
                icon: '🍎',
                sortOrder: 1,
                subcategories: {
                    create: [
                        { name: 'Tropical Fruits', slug: 'tropical', sortOrder: 1 },
                        { name: 'Berries', slug: 'berries', sortOrder: 2 },
                        { name: 'Citrus', slug: 'citrus', sortOrder: 3 },
                        { name: 'Stone Fruits', slug: 'stone-fruits', sortOrder: 4 },
                    ],
                },
            },
        }),
        prisma.category.upsert({
            where: { slug: 'vegetables' },
            update: {},
            create: {
                name: 'Vegetables',
                slug: 'vegetables',
                icon: '🥬',
                sortOrder: 2,
                subcategories: {
                    create: [
                        { name: 'Leafy Greens', slug: 'leafy-greens', sortOrder: 1 },
                        { name: 'Root Vegetables', slug: 'root', sortOrder: 2 },
                        { name: 'Alliums', slug: 'alliums', sortOrder: 3 },
                        { name: 'Nightshades', slug: 'nightshades', sortOrder: 4 },
                    ],
                },
            },
        }),
        prisma.category.upsert({
            where: { slug: 'grains' },
            update: {},
            create: {
                name: 'Grains & Rice',
                slug: 'grains',
                icon: '🌾',
                sortOrder: 3,
                subcategories: {
                    create: [
                        { name: 'Rice', slug: 'rice', sortOrder: 1 },
                        { name: 'Wheat', slug: 'wheat', sortOrder: 2 },
                        { name: 'Ancient Grains', slug: 'ancient', sortOrder: 3 },
                    ],
                },
            },
        }),
        prisma.category.upsert({
            where: { slug: 'herbs' },
            update: {},
            create: {
                name: 'Herbs & Spices',
                slug: 'herbs',
                icon: '🌿',
                sortOrder: 4,
                subcategories: {
                    create: [
                        { name: 'Fresh Herbs', slug: 'fresh', sortOrder: 1 },
                        { name: 'Dried Spices', slug: 'dried', sortOrder: 2 },
                        { name: 'Aromatics', slug: 'aromatics', sortOrder: 3 },
                    ],
                },
            },
        }),
    ]);
    console.log('Categories created');
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aetherproduce.com' },
        update: {},
        create: {
            email: 'admin@aetherproduce.com',
            passwordHash: adminPassword,
            name: 'Admin',
            role: 'ADMIN',
            type: 'INDIVIDUAL',
            verified: true,
        },
    });
    console.log('Admin user created');
    // Create farm owners and farms
    const farmOwnerPassword = await bcrypt.hash('farm123', 12);
    // Farm 1: Kasem Farms
    const kasemOwner = await prisma.user.upsert({
        where: { email: 'kasem@farm.com' },
        update: {},
        create: {
            email: 'kasem@farm.com',
            passwordHash: farmOwnerPassword,
            name: 'Kasem Charoensuk',
            role: 'FARM_OWNER',
            type: 'BUSINESS',
            verified: true,
            company: 'Kasem Farms Co., Ltd.',
        },
    });
    const kasemFarm = await prisma.farm.upsert({
        where: { slug: 'kasem-farms' },
        update: {},
        create: {
            ownerId: kasemOwner.id,
            name: 'Kasem Farms',
            slug: 'kasem-farms',
            location: 'Mae Suai District',
            province: 'Chiang Rai',
            description: 'Three-generation family farm specializing in premium highland produce. Our cool climate and rich soil produce exceptional avocados and mangoes.',
            image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800',
            size: '120 rai',
            established: 1987,
            rating: 4.97,
            reviewCount: 312,
            verified: true,
            coldChain: true,
            escrowEnabled: true,
            deliveryBangkok: '2-3 days',
            deliveryRegional: '3-5 days',
            certifications: {
                create: [
                    { name: 'GlobalGAP', issuedBy: 'GlobalGAP' },
                    { name: 'Organic Thailand', issuedBy: 'ACT' },
                ],
            },
        },
    });
    // Farm 2: Sombat Organics
    const sombatOwner = await prisma.user.upsert({
        where: { email: 'sombat@farm.com' },
        update: {},
        create: {
            email: 'sombat@farm.com',
            passwordHash: farmOwnerPassword,
            name: 'Sombat Prasert',
            role: 'FARM_OWNER',
            type: 'BUSINESS',
            verified: true,
            company: 'Sombat Organics',
        },
    });
    const sombatFarm = await prisma.farm.upsert({
        where: { slug: 'sombat-organics' },
        update: {},
        create: {
            ownerId: sombatOwner.id,
            name: 'Sombat Organics',
            slug: 'sombat-organics',
            location: 'San Sai District',
            province: 'Chiang Mai',
            description: 'Certified organic farm growing premium jasmine rice and traditional Thai herbs using ancient farming methods.',
            image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
            size: '200 rai',
            established: 1995,
            rating: 4.89,
            reviewCount: 187,
            verified: true,
            coldChain: false,
            escrowEnabled: true,
            deliveryBangkok: '2-3 days',
            deliveryRegional: '4-6 days',
            certifications: {
                create: [
                    { name: 'USDA Organic', issuedBy: 'USDA' },
                    { name: 'EU Organic', issuedBy: 'EU Commission' },
                    { name: 'Organic Thailand', issuedBy: 'ACT' },
                ],
            },
        },
    });
    // Farm 3: Niran Hill Growers
    const niranOwner = await prisma.user.upsert({
        where: { email: 'niran@farm.com' },
        update: {},
        create: {
            email: 'niran@farm.com',
            passwordHash: farmOwnerPassword,
            name: 'Niran Jitaroon',
            role: 'FARM_OWNER',
            type: 'BUSINESS',
            verified: true,
            company: 'Niran Hill Growers',
        },
    });
    const niranFarm = await prisma.farm.upsert({
        where: { slug: 'niran-hill-growers' },
        update: {},
        create: {
            ownerId: niranOwner.id,
            name: 'Niran Hill Growers',
            slug: 'niran-hill-growers',
            location: 'Pua District',
            province: 'Nan',
            description: 'High-altitude specialty farm known for strawberries and heirloom tomatoes. Cool mountain climate produces exceptional sweetness.',
            image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800',
            size: '80 rai',
            established: 2008,
            rating: 4.94,
            reviewCount: 241,
            verified: true,
            coldChain: true,
            escrowEnabled: true,
            deliveryBangkok: '2-3 days',
            deliveryRegional: '3-4 days',
            certifications: {
                create: [
                    { name: 'Thai GAP', issuedBy: 'DOA Thailand' },
                    { name: 'PGS Organic', issuedBy: 'Northern Organic Network' },
                ],
            },
        },
    });
    // Farm 4: Pracha Fresh
    const prachaOwner = await prisma.user.upsert({
        where: { email: 'pracha@farm.com' },
        update: {},
        create: {
            email: 'pracha@farm.com',
            passwordHash: farmOwnerPassword,
            name: 'Pracha Wongsawat',
            role: 'FARM_OWNER',
            type: 'BUSINESS',
            verified: true,
            company: 'Pracha Fresh',
        },
    });
    const prachaFarm = await prisma.farm.upsert({
        where: { slug: 'pracha-fresh' },
        update: {},
        create: {
            ownerId: prachaOwner.id,
            name: 'Pracha Fresh',
            slug: 'pracha-fresh',
            location: 'Ban Chang District',
            province: 'Rayong',
            description: 'Eastern region durian specialists with 35 years of expertise. Known for Monthong and Chanee varieties with perfect ripeness.',
            image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800',
            size: '150 rai',
            established: 1989,
            rating: 4.82,
            reviewCount: 98,
            verified: false,
            coldChain: true,
            escrowEnabled: false,
            deliveryBangkok: 'Same day',
            deliveryRegional: '1-2 days',
            certifications: {
                create: [
                    { name: 'Thai GAP', issuedBy: 'DOA Thailand' },
                ],
            },
        },
    });
    // Farm 5: Arunee Gardens
    const aruneeOwner = await prisma.user.upsert({
        where: { email: 'arunee@farm.com' },
        update: {},
        create: {
            email: 'arunee@farm.com',
            passwordHash: farmOwnerPassword,
            name: 'Arunee Kittisak',
            role: 'FARM_OWNER',
            type: 'BUSINESS',
            verified: true,
            company: 'Arunee Gardens',
        },
    });
    const aruneeFarm = await prisma.farm.upsert({
        where: { slug: 'arunee-gardens' },
        update: {},
        create: {
            ownerId: aruneeOwner.id,
            name: 'Arunee Gardens',
            slug: 'arunee-gardens',
            location: 'Tha Muang District',
            province: 'Kanchanaburi',
            description: 'Modern hydroponic facility producing premium leafy greens year-round. State-of-the-art climate control ensures consistent quality.',
            image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800',
            size: '25 rai',
            established: 2019,
            rating: 4.91,
            reviewCount: 156,
            verified: true,
            coldChain: true,
            escrowEnabled: true,
            deliveryBangkok: 'Same day',
            deliveryRegional: '1-2 days',
            certifications: {
                create: [
                    { name: 'GlobalGAP', issuedBy: 'GlobalGAP' },
                    { name: 'Thai GAP', issuedBy: 'DOA Thailand' },
                    { name: 'Q Mark', issuedBy: 'ACFS' },
                ],
            },
        },
    });
    console.log('Farms created');
    // Create products
    const products = await Promise.all([
        // Kasem Farms products
        prisma.product.upsert({
            where: { farmId_slug: { farmId: kasemFarm.id, slug: 'hass-avocados' } },
            update: {},
            create: {
                farmId: kasemFarm.id,
                name: 'Hass Avocados',
                slug: 'hass-avocados',
                category: 'fruits',
                subcategory: 'tropical',
                description: 'Premium Hass avocados grown at 800m elevation for optimal creaminess. Hand-selected for perfect ripeness and rich, nutty flavor.',
                specifications: ['Elevation: 800m', 'Organic certified', 'Hand-harvested', 'Cold chain maintained', 'Fat content: 15-20%'],
                grade: 'A',
                images: [
                    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800',
                    'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800',
                ],
                unit: 'kg',
                retailUnit: 'box',
                retailQty: 2,
                retailPrice: 320,
                pricingTiers: [
                    { min: 100, max: 499, price: 285 },
                    { min: 500, max: 999, price: 265 },
                    { min: 1000, max: 10000, price: 245 },
                ],
                moqRetail: 10,
                moqWholesale: 100,
                stock: 4200,
                harvestSchedule: 'Year-round, peak Jun-Sep',
                shelfLife: '7-10 days at room temp',
                storageTemp: '5-12°C',
                needsColdChain: true,
                batchId: 'KF-AVO-2024-047',
            },
        }),
        prisma.product.upsert({
            where: { farmId_slug: { farmId: kasemFarm.id, slug: 'nam-dok-mai-mangoes' } },
            update: {},
            create: {
                farmId: kasemFarm.id,
                name: 'Nam Dok Mai Mangoes',
                slug: 'nam-dok-mai-mangoes',
                category: 'fruits',
                subcategory: 'tropical',
                description: 'Thailand\'s most prized mango variety. Golden flesh with honey-like sweetness and no fiber. Perfect for export quality.',
                specifications: ['Brix level: 18-22', 'Hand-wrapped on tree', 'Carbide-free ripening', 'Individual grading', 'Export quality'],
                grade: 'A',
                images: [
                    'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
                ],
                unit: 'kg',
                retailUnit: 'box',
                retailQty: 3,
                retailPrice: 180,
                pricingTiers: [
                    { min: 100, max: 499, price: 165 },
                    { min: 500, max: 999, price: 150 },
                    { min: 1000, max: 10000, price: 135 },
                ],
                moqRetail: 10,
                moqWholesale: 100,
                stock: 6500,
                harvestSchedule: 'Mar-Jun peak season',
                shelfLife: '5-7 days at room temp',
                storageTemp: '12-14°C',
                needsColdChain: true,
                batchId: 'KF-MNG-2024-089',
            },
        }),
        // Sombat Organics products
        prisma.product.upsert({
            where: { farmId_slug: { farmId: sombatFarm.id, slug: 'dok-mali-jasmine-rice' } },
            update: {},
            create: {
                farmId: sombatFarm.id,
                name: 'Dok Mali Jasmine Rice',
                slug: 'dok-mali-jasmine-rice',
                category: 'grains',
                subcategory: 'rice',
                description: 'Hom Mali rice from Chiang Mai highlands. Aromatic, long-grain with natural jasmine fragrance. Single-origin, traceable to our fields.',
                specifications: ['2024 harvest', 'Single origin', 'Moisture: 14%', 'Broken: <4%', 'Natural sun-dried'],
                grade: 'A',
                images: [
                    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
                ],
                unit: 'kg',
                retailUnit: 'bag',
                retailQty: 5,
                retailPrice: 45,
                pricingTiers: [
                    { min: 500, max: 1999, price: 42 },
                    { min: 2000, max: 4999, price: 38 },
                    { min: 5000, max: 50000, price: 35 },
                ],
                moqRetail: 10,
                moqWholesale: 500,
                stock: 38000,
                harvestSchedule: 'Nov-Dec harvest',
                shelfLife: '12 months sealed',
                storageTemp: 'Room temperature, dry',
                needsColdChain: false,
                batchId: 'SO-JAS-2024-003',
            },
        }),
        prisma.product.upsert({
            where: { farmId_slug: { farmId: sombatFarm.id, slug: 'fresh-galangal' } },
            update: {},
            create: {
                farmId: sombatFarm.id,
                name: 'Fresh Galangal',
                slug: 'fresh-galangal',
                category: 'herbs',
                subcategory: 'aromatics',
                description: 'Young galangal with pink tips, essential for authentic Thai cooking. Organic grown, hand-harvested for peak freshness.',
                specifications: ['Young shoots', 'Organic certified', 'Hand-harvested', 'Cleaned & trimmed', 'High essential oil content'],
                grade: 'B',
                images: [
                    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800',
                ],
                unit: 'kg',
                retailUnit: 'bag',
                retailQty: 0.5,
                retailPrice: 85,
                pricingTiers: [
                    { min: 50, max: 199, price: 75 },
                    { min: 200, max: 499, price: 68 },
                    { min: 500, max: 5000, price: 60 },
                ],
                moqRetail: 10,
                moqWholesale: 50,
                stock: 3200,
                harvestSchedule: 'Year-round',
                shelfLife: '2-3 weeks refrigerated',
                storageTemp: '10-12°C',
                needsColdChain: false,
                batchId: 'SO-GAL-2024-156',
            },
        }),
        // Niran Hill Growers products
        prisma.product.upsert({
            where: { farmId_slug: { farmId: niranFarm.id, slug: 'royal-project-strawberries' } },
            update: {},
            create: {
                farmId: niranFarm.id,
                name: 'Royal Project Strawberries',
                slug: 'royal-project-strawberries',
                category: 'fruits',
                subcategory: 'berries',
                description: 'Sweet highland strawberries from Royal Project cultivation methods. Grown at 1,200m for exceptional sweetness and firm texture.',
                specifications: ['Elevation: 1,200m', 'Brix: 12-14', 'Day-neutral variety', 'Hand-picked daily', 'Pre-cooled'],
                grade: 'A',
                images: [
                    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
                ],
                unit: 'kg',
                retailUnit: 'punnet',
                retailQty: 0.25,
                retailPrice: 189,
                pricingTiers: [
                    { min: 20, max: 99, price: 175 },
                    { min: 100, max: 299, price: 160 },
                    { min: 300, max: 2000, price: 145 },
                ],
                moqRetail: 10,
                moqWholesale: 20,
                stock: 1200,
                harvestSchedule: 'Nov-Apr peak',
                shelfLife: '3-5 days refrigerated',
                storageTemp: '2-4°C',
                needsColdChain: true,
                batchId: 'NH-STR-2024-234',
            },
        }),
        prisma.product.upsert({
            where: { farmId_slug: { farmId: niranFarm.id, slug: 'heirloom-cherry-tomatoes' } },
            update: {},
            create: {
                farmId: niranFarm.id,
                name: 'Heirloom Cherry Tomatoes',
                slug: 'heirloom-cherry-tomatoes',
                category: 'vegetables',
                subcategory: 'nightshades',
                description: 'Mixed heirloom varieties in red, yellow, and purple. Intense flavor from slow mountain ripening. Perfect for salads and premium dishes.',
                specifications: ['Mixed varieties', 'Vine-ripened', 'Open-pollinated seeds', 'Mountain grown', 'Hand-selected'],
                grade: 'A',
                images: [
                    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
                ],
                unit: 'kg',
                retailUnit: 'punnet',
                retailQty: 0.3,
                retailPrice: 145,
                pricingTiers: [
                    { min: 20, max: 99, price: 130 },
                    { min: 100, max: 299, price: 115 },
                    { min: 300, max: 1500, price: 100 },
                ],
                moqRetail: 10,
                moqWholesale: 20,
                stock: 900,
                harvestSchedule: 'Year-round',
                shelfLife: '7-10 days refrigerated',
                storageTemp: '10-15°C',
                needsColdChain: false,
                batchId: 'NH-TOM-2024-178',
            },
        }),
        // Pracha Fresh products
        prisma.product.upsert({
            where: { farmId_slug: { farmId: prachaFarm.id, slug: 'monthong-durian' } },
            update: {},
            create: {
                farmId: prachaFarm.id,
                name: 'Monthong Durian',
                slug: 'monthong-durian',
                category: 'fruits',
                subcategory: 'tropical',
                description: 'Thailand\'s most popular durian variety. Creamy, custard-like flesh with mild, sweet flavor. Harvested at optimal ripeness.',
                specifications: ['Weight: 3-4 kg average', 'Mature: 120+ days', 'Ripeness tested', 'Chemical-free ripening', 'Same-day harvest'],
                grade: 'B',
                images: [
                    'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?w=800',
                ],
                unit: 'kg',
                retailUnit: 'whole',
                retailQty: 3.5,
                retailPrice: 280,
                pricingTiers: [
                    { min: 100, max: 499, price: 250 },
                    { min: 500, max: 999, price: 225 },
                    { min: 1000, max: 5000, price: 200 },
                ],
                moqRetail: 10,
                moqWholesale: 100,
                stock: 2800,
                harvestSchedule: 'Apr-Aug peak',
                shelfLife: '2-3 days at room temp',
                storageTemp: '15-20°C',
                needsColdChain: true,
                batchId: 'PF-DUR-2024-067',
            },
        }),
        // Arunee Gardens products
        prisma.product.upsert({
            where: { farmId_slug: { farmId: aruneeFarm.id, slug: 'hydroponic-baby-cos' } },
            update: {},
            create: {
                farmId: aruneeFarm.id,
                name: 'Hydroponic Baby Cos',
                slug: 'hydroponic-baby-cos',
                category: 'vegetables',
                subcategory: 'leafy-greens',
                description: 'Crisp, tender baby cos lettuce grown in controlled hydroponic environment. Consistently perfect leaves, pesticide-free.',
                specifications: ['Hydroponic grown', 'Pesticide-free', 'Climate controlled', 'Root-on option', 'Daily harvest'],
                grade: 'A',
                images: [
                    'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800',
                ],
                unit: 'kg',
                retailUnit: 'head',
                retailQty: 0.15,
                retailPrice: 65,
                pricingTiers: [
                    { min: 50, max: 199, price: 58 },
                    { min: 200, max: 499, price: 52 },
                    { min: 500, max: 5000, price: 45 },
                ],
                moqRetail: 10,
                moqWholesale: 50,
                stock: 5000,
                harvestSchedule: 'Year-round',
                shelfLife: '7-10 days refrigerated',
                storageTemp: '2-5°C',
                needsColdChain: true,
                batchId: 'AG-COS-2024-445',
            },
        }),
    ]);
    console.log('Products created');
    // Create a demo buyer user
    const buyerPassword = await bcrypt.hash('buyer123', 12);
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@demo.com' },
        update: {},
        create: {
            email: 'buyer@demo.com',
            passwordHash: buyerPassword,
            name: 'Demo Buyer',
            role: 'BUYER',
            type: 'INDIVIDUAL',
            verified: true,
            addresses: {
                create: {
                    label: 'Home',
                    name: 'Demo Buyer',
                    phone: '081-234-5678',
                    address: '123 Sukhumvit Road',
                    subdistrict: 'Klongtoey',
                    district: 'Klongtoey',
                    province: 'Bangkok',
                    postalCode: '10110',
                    isDefault: true,
                },
            },
        },
    });
    // Create a business buyer
    const businessBuyer = await prisma.user.upsert({
        where: { email: 'restaurant@demo.com' },
        update: {},
        create: {
            email: 'restaurant@demo.com',
            passwordHash: buyerPassword,
            name: 'Chef Somchai',
            role: 'BUYER',
            type: 'BUSINESS',
            company: 'Thai Fusion Restaurant',
            verified: true,
            addresses: {
                create: {
                    label: 'Restaurant',
                    name: 'Chef Somchai',
                    phone: '02-345-6789',
                    address: '456 Silom Road',
                    subdistrict: 'Silom',
                    district: 'Bangrak',
                    province: 'Bangkok',
                    postalCode: '10500',
                    isDefault: true,
                },
            },
        },
    });
    console.log('Demo users created');
    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Admin: admin@aetherproduce.com / admin123');
    console.log('Farm Owner: kasem@farm.com / farm123');
    console.log('Buyer: buyer@demo.com / buyer123');
    console.log('Business: restaurant@demo.com / buyer123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map