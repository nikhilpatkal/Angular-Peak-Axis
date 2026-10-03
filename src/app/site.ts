import config from '../../site.config.json';

export const SITE = {
  ...config,
  emailHref: `mailto:${config.email}`,
  whatsappHref: `https://wa.me/${config.whatsapp}`,
  mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(Object.values(config.address).join(', '))}`
} as const;
