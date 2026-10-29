// Turns the contact block in config.js into links. Empty values are skipped.

export function directLinks(contact) {
  const out = [];
  if (contact.email) out.push({ key: 'email', label: 'Email', value: contact.email, href: `mailto:${contact.email}` });
  if (contact.phone) out.push({ key: 'phone', label: 'Phone', value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}` });
  if (contact.whatsapp) out.push({ key: 'whatsapp', label: 'WhatsApp', value: `+${contact.whatsapp.replace(/\D/g, '')}`, href: `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}` });
  return out;
}

export function socialLinks(contact) {
  const out = [];
  if (contact.instagram) out.push({ key: 'instagram', label: 'Instagram', href: contact.instagram });
  if (contact.facebook) out.push({ key: 'facebook', label: 'Facebook', href: contact.facebook });
  if (contact.linkedin) out.push({ key: 'linkedin', label: 'LinkedIn', href: contact.linkedin });
  return out;
}

export function mapsHref(location) {
  if (!location.mapsUrl) return '';
  if (location.mapsUrl !== 'auto') return location.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.addressLines.join(', '))}`;
}
