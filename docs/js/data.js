// P53 product catalogue — built from the brand's Facebook campaign assets.
// Prices could not be retrieved from the Facebook page, so every price is `null`
// and renders as "Price TBA" until the client confirms.

export const SIZES_FULL = ['M', 'L', 'XL', 'XXL', '3XL', '4XL'];
export const SIZES_F = ['M', 'L', 'XL', 'XXL', '3XL'];

export const CATEGORIES = [
  { id: 'scrub-suit', name: 'Scrub Suits', blurb: 'Half-sleeve V-neck sets for long duty hours' },
  { id: 'three-quarter', name: 'Three-Quarter Sleeve', blurb: 'Elegant female-cut OT dresses' },
  { id: 'summer-lite', name: 'Summer Lite', blurb: 'Lightweight, breathable fabric' },
  { id: 'white-coat', name: 'White Coats', blurb: 'Classic lab & clinic coats' },
  { id: 'caps', name: 'Surgical Caps', blurb: 'Matching caps with ties' },
];

export const COLLECTIONS = ['Premium', 'Classic', 'Comfort', 'Summer Lite'];

/**
 * garment: parameters for the procedural 3D model + generated flat-lay
 *   type: 'suit' | 'coat' | 'cap'
 *   cut: 'male' | 'female'
 *   sleeve: 'half' | 'three-quarter' | 'long'
 *   neck: 'v' | 'round'
 *   pockets: features drawn on the model
 */
export const PRODUCTS = [
  {
    slug: 'black-premium-scrub-suit',
    name: 'Black Premium Scrub Suit',
    collection: 'Premium',
    gender: 'unisex',
    categories: ['scrub-suit'],
    color: { name: 'Black', hex: '#1d1f24' },
    price: null,
    sizes: SIZES_FULL,
    badge: 'Best seller',
    photos: ['black-premium.jpg', 'black-premium-2.jpg'],
    description:
      'Our signature black OT set. Premium quality fabric that is soft, durable and long lasting, with a modern V-neck and a smart, professional finish for long duty hours.',
    features: ['Premium quality fabric', 'Breathable — stay cool all day', 'Comfortable for long duty hours', 'Modern V-neck design', 'P53 embroidered chest logo'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true, shoulderLoop: false },
  },
  {
    slug: 'navy-blue-premium-classic-ot-dress',
    name: 'Navy Blue Premium Classic OT Dress',
    collection: 'Classic',
    gender: 'unisex',
    categories: ['scrub-suit'],
    color: { name: 'Navy Blue', hex: '#1c2a5a' },
    price: null,
    sizes: SIZES_FULL,
    badge: 'Men & Women',
    photos: ['navy-classic.jpg'],
    description:
      'The everyday classic, designed for doctors. Comes with a shoulder loop for your ID, a chest pocket, two front pockets and a zippered trouser with three pockets.',
    features: ['Shoulder loop for holding ID', '1 chest pocket + 2 front pockets', 'Zipper added on trouser', '3 trouser pockets (2 side, 1 back)', 'Durable, breathable, lightweight'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true, shoulderLoop: true },
  },
  {
    slug: 'slate-grey-scrub-suit',
    name: 'Slate Grey Scrub Suit',
    collection: 'Premium',
    gender: 'unisex',
    categories: ['scrub-suit'],
    color: { name: 'Slate Grey', hex: '#565d66' },
    price: null,
    sizes: SIZES_FULL,
    photos: ['slate-grey.jpg', 'slate-grey-folded.jpg'],
    description:
      'A refined slate grey that hides the wear of a long shift. Smart look, comfortable fit and a professional finish — set includes top, trouser and matching cap.',
    features: ['Premium quality fabric', 'Breathable', 'Comfortable for long duty hours', 'Modern V-neck design', 'Matching cap available'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
  },
  {
    slug: 'sea-green-premium-ot-dress',
    name: 'Sea Green Premium OT Dress',
    collection: 'Premium',
    gender: 'men',
    categories: ['scrub-suit'],
    color: { name: 'Sea Green', hex: '#2f6f63' },
    price: null,
    sizes: SIZES_FULL,
    badge: 'Back in stock',
    photos: ['sea-green.jpg'],
    description: 'One of our best-selling OT dresses is back. Premium quality, half sleeve, in a calm surgical sea green.',
    features: ['Premium quality', 'Half sleeve', 'Colour: Sea Green', 'Limited quantity'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
  },
  {
    slug: 'sage-green-premium-ot-dress',
    name: 'Sage Green Premium OT Dress',
    collection: 'Premium',
    gender: 'men',
    categories: ['scrub-suit'],
    color: { name: 'Sage Green', hex: '#4f5e3c' },
    price: null,
    sizes: SIZES_FULL,
    photos: ['sage-green.jpg'],
    description: 'Worn by the team at Islam Dental Care, Feni. Premium, breathable and lightweight with an all-day comfortable fit.',
    features: ['Premium quality fabric', 'Breathable & lightweight', 'Professional look', 'Designed for doctors'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
  },
  {
    slug: 'maroon-premium-ot-dress',
    name: 'Maroon Premium OT Dress',
    collection: 'Premium',
    gender: 'men',
    categories: ['scrub-suit'],
    color: { name: 'Maroon', hex: '#5a1a26' },
    price: null,
    sizes: SIZES_FULL,
    photos: ['maroon.jpg'],
    description: 'Comfort, durability and a professional look. Half sleeve only, in a rich maroon with cargo-pocket trousers.',
    features: ['Premium fabric', 'Soft & breathable', 'Long lasting', 'Half sleeve only'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true, cargo: true },
  },
  {
    slug: 'teal-green-comfort-ot-dress',
    name: 'Teal Green Comfort OT Dress',
    collection: 'Comfort',
    gender: 'men',
    categories: ['scrub-suit', 'summer-lite'],
    color: { name: 'Teal Green', hex: '#1f8f72' },
    price: null,
    sizes: SIZES_FULL,
    photos: ['teal-green.jpg'],
    description: 'Crafted for doctors who want comfort, hygiene and performance. Lite-weight fabric that stays soft, breathable and fresh.',
    features: ['Lite weight fabric', 'Cool & breathable', 'Functional pockets', 'Only for doctors'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
  },
  {
    slug: 'azure-blue-classic-ot-dress',
    name: 'Azure Blue Classic OT Dress',
    collection: 'Summer Lite',
    gender: 'men',
    categories: ['scrub-suit', 'summer-lite'],
    color: { name: 'Azure Blue', hex: '#3a86cf' },
    price: null,
    sizes: SIZES_FULL,
    photos: ['azure-blue.jpg'],
    description: 'Lite-weight summer version of our classic. Soft, comfortable and breathable — half sleeve only.',
    features: ['Lightweight & breathable', 'Soft & comfortable', 'Half sleeve only', 'Summer version fabric'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
  },
  {
    slug: 'ocean-blue-scrub-suit',
    name: 'Ocean Blue Scrub Suit',
    collection: 'Premium',
    gender: 'women',
    categories: ['scrub-suit'],
    color: { name: 'Ocean Blue', hex: '#2fa6c9' },
    price: null,
    sizes: SIZES_F,
    photos: ['ocean-blue.jpg'],
    description: 'Tailored female cut for a smart and professional look. Multiple functional pockets for your essentials.',
    features: ['Premium quality fabric', 'Female cut design', 'Breathable', 'Multiple pockets', 'Comfortable for long duty hours'],
    garment: { type: 'suit', cut: 'female', sleeve: 'half', neck: 'v', chestPocket: false },
  },
  {
    slug: 'lavender-mist-three-quarter-scrub-suit',
    name: 'Lavender Mist Three-Quarter Sleeve Scrub Suit',
    collection: 'Summer Lite',
    gender: 'women',
    categories: ['three-quarter', 'summer-lite'],
    color: { name: 'Lavender Mist', hex: '#8f86d6' },
    price: null,
    sizes: SIZES_F,
    badge: 'New',
    photos: ['lavender-mist.jpg'],
    description: 'Summer version. Lite-weight fabric that keeps you fresh all day, with a stylish three-quarter sleeve. Designed exclusively for female doctors.',
    features: ['Lite weight fabric', 'Cool & breathable', 'Three-quarter sleeve', 'Functional pockets', 'Only for female'],
    garment: { type: 'suit', cut: 'female', sleeve: 'three-quarter', neck: 'v', chestPocket: false },
  },
  {
    slug: 'dark-blue-three-quarter-ot-dress',
    name: 'Dark Blue Premium Three-Quarter OT Dress',
    collection: 'Premium',
    gender: 'women',
    categories: ['three-quarter'],
    color: { name: 'Dark Blue', hex: '#17204a' },
    price: null,
    sizes: SIZES_F,
    photos: ['dark-blue-34.jpg'],
    description: 'Premium three-quarter sleeve OT dress for female doctors. Soft, skin-friendly fabric with a comfortable fit for long working hours.',
    features: ['Premium quality fabric', 'Comfortable fit', 'Three-quarter sleeve', 'Functional pockets', 'Durable & easy care'],
    garment: { type: 'suit', cut: 'female', sleeve: 'three-quarter', neck: 'round', chestPocket: false },
  },
  {
    slug: 'white-three-quarter-ot-dress',
    name: 'White Three-Quarter Sleeve OT Dress',
    collection: 'Premium',
    gender: 'women',
    categories: ['three-quarter'],
    color: { name: 'White', hex: '#f1f1ee' },
    price: null,
    sizes: SIZES_F,
    badge: 'Name embroidery',
    photos: ['white-34.jpg'],
    description: 'Designed exclusively for female doctors. Elegant three-quarter sleeve with optional name embroidery (up to 15 letters).',
    features: ['Soft & comfortable fabric', 'Elegant three-quarter sleeve', 'Professional fit', 'Functional pockets', 'Custom name embroidery'],
    garment: { type: 'suit', cut: 'female', sleeve: 'three-quarter', neck: 'v', chestPocket: false },
    embroidery: true,
  },
  {
    slug: 'classic-white-coat',
    name: 'Classic White Coat',
    collection: 'Classic',
    gender: 'unisex',
    categories: ['white-coat'],
    color: { name: 'White', hex: '#f4f4f2' },
    price: null,
    sizes: ['M', 'L', 'XL', 'XXL'],
    badge: 'Coming soon',
    photos: [],
    description: 'A crisp clinic coat with notch lapels, breast pocket and two patch pockets. Size chart available — photography coming soon.',
    features: ['Notch lapel collar', 'Breast pocket + 2 patch pockets', 'Front button closure', 'Name embroidery available'],
    garment: { type: 'coat', cut: 'male', sleeve: 'long', neck: 'v' },
    embroidery: true,
  },
  {
    slug: 'p53-surgical-cap',
    name: 'P53 Surgical Cap',
    collection: 'Classic',
    gender: 'unisex',
    categories: ['caps'],
    color: { name: 'Slate Grey', hex: '#565d66' },
    variants: ['#565d66', '#1d1f24', '#1c2a5a', '#2f6f63', '#5a1a26'],
    price: null,
    sizes: ['Free size'],
    photos: ['slate-grey-folded.jpg'],
    description: 'Matching surgical cap with back ties and a woven P53 label. Available in every scrub colour.',
    features: ['Adjustable back ties', 'Woven P53 label', 'Matches every P53 scrub'],
    garment: { type: 'cap' },
  },
];

// Size charts transcribed from the client's charts (inches).
// The supplied chart images are cropped, so row labels and the larger sizes are marked to confirm.
export const SIZE_CHARTS = [
  {
    id: 'female-scrub',
    title: 'Female Scrub (three-quarter & female cut)',
    note: 'Lavender, Black & Navy Blue premium female scrubs.',
    img: 'female-scrub.jpg',
    sizes: ['M', 'L', 'XL', 'XXL', '3XL'],
    rows: [
      ['Top — Chest', 39, 41, 43, null, null],
      ['Top — Length', 25.5, 26.5, 27.5, null, null],
      ['Top — Sleeve', 8.5, 9, 9, null, null],
      ['Trouser — Waist (elastic)', 37, 37, 38, null, null],
    ],
  },
  {
    id: 'scrub-suit',
    title: 'Scrub Suit / OT Dress (half sleeve)',
    note: 'All half-sleeve V-neck sets.',
    img: 'scrub-suit.jpg',
    sizes: ['M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    rows: [
      ['Top — Chest', 40, 42, 44, null, null, null],
      ['Trouser — Length', 38, 39, 40, null, null, null],
      ['Top — Length', 23, 23.5, 24, null, null, null],
    ],
  },
  {
    id: 'white-coat',
    title: 'White Coat',
    note: 'Classic white coat.',
    img: 'white-coat.jpg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    rows: [
      ['Chest', 40, 42, null, null],
      ['Length', 34, 35, null, null],
      ['Sleeve', 21.5, 22, null, null],
      ['Cuff', 7.5, 8, null, null],
    ],
  },
];

export const TESTIMONIALS = [
  { name: 'Dr. Kawser Alam', role: 'Cardiac Anaesthesiologist · Chittagong Medical College Hospital', product: 'Black Premium OT Dress', img: 'black-premium-2.jpg' },
  { name: 'Dr. Russell & Dr. Shiam', role: 'Islam Dental Care, Feni', product: 'Sage Green Premium OT Dress', img: 'sage-green.jpg' },
  { name: 'Dr. Joya Devi', role: 'Female doctor · Name embroidery', product: 'White Three-Quarter OT Dress', img: 'white-34.jpg' },
];

export const FACEBOOK_URL = 'https://www.facebook.com/p53ltd';

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const formatPrice = (p) => (p.price == null ? 'Price TBA' : `৳ ${p.price.toLocaleString('en-IN')}`);
