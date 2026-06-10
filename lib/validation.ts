import { z } from "zod";

const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;

export const websiteEnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(phoneRegex, "Invalid phone number format"),

  services: z
    .array(z.string().max(100))
    .max(10)
    .optional()
    .default([]),

  eventtype: z.string().trim().max(200).optional(),

  message: z
    .string()
    .trim()
    .min(10, "Please write at least a brief message (10+ characters)")
    .max(2000, "Message is too long (max 2000 characters)"),

  // Honeypot field — must be empty; bots fill it, humans don't see it
  _honeypot: z.string().max(0, "Bot detected").optional(),
});

export const internalLeadSchema = z.object({
  clientname: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20)
    .regex(phoneRegex, "Invalid phone number format"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  source: z.string().trim().max(100).optional(),
  eventtype: z.string().trim().max(200).optional(),
  campaign: z.string().trim().max(2000).optional(),
});

export type WebsiteEnquiry = z.infer<typeof websiteEnquirySchema>;
export type InternalLead = z.infer<typeof internalLeadSchema>;
