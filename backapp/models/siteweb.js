const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CTASchema = new Schema({
  text: { type: String, required: true },
  href: { type: String, required: true }
}, { _id: false });  // Disable _id for this subdocument

const HeroSchema = new Schema({
  logoUrl: { type: String, default: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600' },
  headline: { type: String, default: 'Data to enrich your online business' },
  subheadline: { type: String, default: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.' },
  cta1: { type: CTASchema, default: () => ({ text: 'Get started', href: '#' }) },
  cta2: { type: CTASchema, default: () => ({ text: 'Learn more', href: '#' }) },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1498758536662-35b82cd15e29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2102&q=80' },
  color: { type: String, default: '#ffffff' }
}, { _id: false });  // Disable _id for this subdocument

const HeaderSchema = new Schema({
  logoUrl: { type: String, default: 'https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600' },
  loginHref: { type: String, default: '#' },
  navItems: [
    {
      name: { type: String, required: true },
      href: { type: String, required: true }
    }
  ],
  color: { type: String, default: '#ffffff' }
}, { _id: false });  // Disable _id for this subdocument

const ProductSchema = new Schema({
  color: { type: String, default: '#ffffff' }
}, { _id: false });  // Disable _id for this subdocument

const FooterSchema = new Schema({
  color: { type: String, default: '#ffffff' }
}, { _id: false });  // Disable _id for this subdocument

const WebsiteSchema = new Schema({
  header: { type: HeaderSchema },
  hero: { type: HeroSchema },
  footer: { type: FooterSchema },
  product: { type: ProductSchema }
});

const Website = mongoose.models.Website || mongoose.model('Website', WebsiteSchema);

module.exports = Website;
