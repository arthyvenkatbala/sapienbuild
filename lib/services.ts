export interface Service {
  id: string;
  name: string;
  price: number;
  category: "photography" | "videography" | "other";
  default?: boolean;
}

export const SERVICES: Service[] = [
  { id: "trad_photo",        name: "Traditional Photography",                             price: 10000, category: "photography" },
  { id: "trad_video",        name: "Traditional Videography",                             price: 10000, category: "videography" },
  { id: "candid_photo_lead", name: "Candid Photography (Lead Photographer)",              price: 35000, category: "photography", default: true },
  { id: "candid_photo_add",  name: "Candid Photography (Additional Photographer)",        price: 20000, category: "photography" },
  { id: "candid_video",      name: "Candid Videography",                                  price: 35000, category: "videography" },
  { id: "drone",             name: "Drone Coverage",                                      price: 10000, category: "other" },
  { id: "livestream",        name: "HD Live Streaming",                                   price: 10000, category: "other" },
  { id: "album",             name: 'Photo Album (12"x15" Layflat, 80 pages)',             price: 20000, category: "other" },
  { id: "couple_shoot",      name: "Couple Shoot",                                        price: 20000, category: "other" },
];
