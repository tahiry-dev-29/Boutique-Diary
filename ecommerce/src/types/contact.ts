import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Veuillez entrer un numéro de téléphone valide"
    ),
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est requis"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export interface ContactResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface ContactInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    weekend: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}
