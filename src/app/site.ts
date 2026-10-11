import config from '../../site.config.json';

export const SITE = {
  ...config,
  emailHref: `mailto:${config.email}`,
  whatsappHref: `https://wa.me/${config.whatsapp}`,
  contactPhoneLinks: config.contactPhones.map(phone => ({
    label: phone,
    href: `tel:${phone.replace(/[^+\d]/g, '')}`
  })),
  mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(Object.values(config.address).join(', '))}`
} as const;
