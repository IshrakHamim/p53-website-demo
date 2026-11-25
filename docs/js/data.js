// P53 catalogue: one product per STYLE, with colours as variants.
// Each colour carries its own original reference photos (from P53's Facebook page),
// which the 3D preview for that colour is modelled from.
// Prices could not be retrieved from Facebook, so every price is null → "Price TBA".

export const CATEGORIES = [
  { id: 'scrub-sets', name: 'Scrub Sets' },
  { id: 'three-quarter', name: 'Three-Quarter Sets' },
  { id: 'white-coats', name: 'White Coats' },
  { id: 'caps', name: 'Caps' },
];

const FULL = ['M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const FEM = ['M', 'L', 'XL', 'XXL', '3XL'];

export const PRODUCTS = [
  {
    slug: 'premium-scrub-set',
    name: 'Premium Scrub Set',
    category: 'scrub-sets',
    gender: 'unisex', // offered in a men's and a women's cut
    womenDefault: 'navy',
    sizes: FULL,
    price: null,
    badge: 'Best seller',
    chart: { men: 'scrub-suit', women: 'female-scrub' },
    description:
      'Our signature half-sleeve V-neck set. Premium fabric that is soft, durable and breathable, built for long duty hours, with a P53-embroidered chest pocket.',
    features: ['Premium quality fabric', 'Breathable, all-day comfort', 'Chest pocket + 2 front pockets', 'Elastic waist trousers with drawstring', 'Embroidered P53 logo'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
    colors: [
      { id: 'black', name: 'Black', hex: '#1d1f24', photos: ['black-premium.jpg', 'black-premium-2.jpg'] },
      { id: 'navy', name: 'Navy Blue', hex: '#1c2a5a', photos: ['navy-classic.jpg'], garment: { shoulderLoop: true }, note: 'Includes ID shoulder loop and zipper trousers' },
      { id: 'slate-grey', name: 'Slate Grey', hex: '#565d66', photos: ['slate-grey.jpg', 'slate-grey-folded.jpg'] },
      { id: 'sea-green', name: 'Sea Green', hex: '#2f6f63', photos: ['sea-green.jpg'] },
      { id: 'sage-green', name: 'Sage Green', hex: '#4f5e3c', photos: ['sage-green.jpg'] },
      { id: 'maroon', name: 'Maroon', hex: '#5a1a26', photos: ['maroon.jpg'], garment: { cargo: true } },
    ],
  },
  {
    slug: 'summer-lite-scrub-set',
    name: 'Summer Lite Scrub Set',
    category: 'scrub-sets',
    gender: 'men',
    sizes: FULL,
    price: null,
    badge: 'Lightweight',
    chart: { men: 'scrub-suit' },
    description: 'The summer version of our classic. Lite-weight fabric that stays cool, soft and breathable through the hottest shifts. Half sleeve only.',
    features: ['Lite-weight summer fabric', 'Cool & breathable', 'Half sleeve', 'Functional pockets'],
    garment: { type: 'suit', cut: 'male', sleeve: 'half', neck: 'v', chestPocket: true },
    colors: [
      { id: 'teal-green', name: 'Teal Green', hex: '#1f8f72', photos: ['teal-green.jpg'] },
      { id: 'azure-blue', name: 'Azure Blue', hex: '#3a86cf', photos: ['azure-blue.jpg'] },
    ],
  },
  {
    slug: 'three-quarter-sleeve-set',
    name: 'Three-Quarter Sleeve Set',
    category: 'three-quarter',
    gender: 'women',
    sizes: FEM,
    price: null,
    badge: 'Female cut',
    chart: { women: 'female-scrub' },
    description: 'Designed exclusively for female doctors. An elegant three-quarter sleeve with a tailored fit, side slits and functional pockets.',
    features: ['Tailored female cut', 'Elegant three-quarter sleeve', 'Functional pockets', 'Soft, skin-friendly fabric'],
    garment: { type: 'suit', cut: 'female', sleeve: 'three-quarter', neck: 'v', chestPocket: false },
    colors: [
      { id: 'lavender', name: 'Lavender Mist', hex: '#8f86d6', photos: ['lavender-mist.jpg'], note: 'Summer lite fabric' },
      { id: 'dark-blue', name: 'Dark Blue', hex: '#17204a', photos: ['dark-blue-34.jpg'], garment: { neck: 'round' } },
      { id: 'white', name: 'White', hex: '#f1f1ee', photos: ['white-34.jpg'], embroidery: true, note: 'Name embroidery available' },
    ],
  },
  {
    slug: 'female-cut-scrub-set',
    name: 'Female-Cut Scrub Set',
    category: 'scrub-sets',
    gender: 'women',
    sizes: FEM,
    price: null,
    chart: { women: 'female-scrub' },
    description: 'A half-sleeve set tailored for a smart, professional female fit, with multiple functional pockets.',
    features: ['Female cut design', 'Premium quality fabric', 'Multiple pockets', 'Breathable'],
    garment: { type: 'suit', cut: 'female', sleeve: 'half', neck: 'v', chestPocket: false },
    colors: [{ id: 'ocean-blue', name: 'Ocean Blue', hex: '#2fa6c9', photos: ['ocean-blue.jpg'] }],
  },
  {
    slug: 'white-coat',
    name: 'Classic White Coat',
    category: 'white-coats',
    gender: 'unisex',
    sizes: ['M', 'L', 'XL', 'XXL'],
    price: null,
    badge: 'Coming soon',
    chart: { men: 'white-coat', women: 'white-coat' },
    description: 'A crisp clinic coat with notch lapels, a breast pocket and two patch pockets.',
    features: ['Notch lapel collar', 'Breast pocket + 2 patch pockets', 'Front button closure', 'Name embroidery available'],
    garment: { type: 'coat', cut: 'male', sleeve: 'long', neck: 'v' },
    colors: [{ id: 'white', name: 'White', hex: '#f4f4f2', photos: [], embroidery: true }],
  },
  {
    slug: 'surgical-cap',
    name: 'Surgical Cap',
    category: 'caps',
    gender: 'unisex',
    sizes: ['Free size'],
    price: null,
    chart: null,
    description: 'Matching surgical cap with back ties and a woven P53 label, made to pair with every P53 set.',
    features: ['Adjustable back ties', 'Woven P53 label', 'Matches every P53 set'],
    garment: { type: 'cap' },
    colors: [
      { id: 'slate-grey', name: 'Slate Grey', hex: '#565d66', photos: ['slate-grey-folded.jpg'] },
      { id: 'black', name: 'Black', hex: '#1d1f24', photos: ['black-premium-2.jpg'] },
      { id: 'navy', name: 'Navy Blue', hex: '#1c2a5a', photos: [] },
      { id: 'sea-green', name: 'Sea Green', hex: '#2f6f63', photos: [] },
      { id: 'maroon', name: 'Maroon', hex: '#5a1a26', photos: [] },
    ],
  },
];

// Size charts transcribed from the client's charts (inches).
// The supplied chart images are cropped, so row labels and larger sizes need confirming.
export const SIZE_CHARTS = {
  'female-scrub': {
    title: "Women's cut",
    sizes: ['M', 'L', 'XL', 'XXL', '3XL'],
    rows: [
      ['Chest', 39, 41, 43, null, null],
      ['Top length', 25.5, 26.5, 27.5, null, null],
      ['Sleeve', 8.5, 9, 9, null, null],
      ['Waist (elastic)', 37, 37, 38, null, null],
    ],
  },
  'scrub-suit': {
    title: "Men's cut",
    sizes: ['M', 'L', 'XL', 'XXL', '3XL', '4XL'],
    rows: [
      ['Chest', 40, 42, 44, null, null, null],
      ['Top length', 23, 23.5, 24, null, null, null],
      ['Trouser length', 38, 39, 40, null, null, null],
    ],
  },
  'white-coat': {
    title: 'White coat',
    sizes: ['M', 'L', 'XL', 'XXL'],
    rows: [
      ['Chest', 40, 42, null, null],
      ['Length', 34, 35, null, null],
      ['Sleeve', 21.5, 22, null, null],
      ['Cuff', 7.5, 8, null, null],
    ],
  },
};

export const TESTIMONIALS = [
  { name: 'Dr. Kawser Alam', role: 'Cardiac Anaesthesiologist · Chittagong Medical College Hospital', product: 'Premium Scrub Set · Black', img: 'black-premium-2.jpg' },
  { name: 'Dr. Russell & Dr. Shiam', role: 'Islam Dental Care, Feni', product: 'Premium Scrub Set · Sage Green', img: 'sage-green.jpg' },
  { name: 'Dr. Joya Devi', role: 'Name embroidery', product: 'Three-Quarter Sleeve Set · White', img: 'white-34.jpg' },
];

export const FACEBOOK_URL = 'https://www.facebook.com/p53ltd';

export const getProduct = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const getColour = (p, id) => p.colors.find((c) => c.id === id) || p.colors[0];
export const formatPrice = (p) => (p.price == null ? 'Price TBA' : `৳ ${p.price.toLocaleString('en-IN')}`);
export const forGender = (g) => PRODUCTS.filter((p) => g === 'all' || p.gender === g || p.gender === 'unisex');
