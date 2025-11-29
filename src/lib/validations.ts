import { z } from 'zod';

// List of Indian states and union territories
export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const UNIVERSITY_TYPES = ['CENTRAL', 'STATE', 'PRIVATE', 'DEEMED'] as const;

export const universityRegistrationSchema = z
  .object({
    legalName: z
      .string()
      .min(3, 'University legal name must be at least 3 characters')
      .max(255, 'University legal name must not exceed 255 characters'),

    type: z.enum(UNIVERSITY_TYPES, {
      errorMap: () => ({ message: 'Please select a valid university type' }),
    }),

    state: z.enum(INDIAN_STATES_AND_UTS, {
      errorMap: () => ({ message: 'Please select a valid Indian state or union territory' }),
    }),

    ugcReference: z
      .string()
      .max(255, 'UGC reference must not exceed 255 characters')
      .optional()
      .or(z.literal('')),

    aisheCode: z
      .string()
      .regex(/^[A-Z]-[0-9]{3,6}$/, 'AISHE code must follow pattern: A-123456')
      .optional()
      .or(z.literal('')),

    websiteDomain: z
      .string()
      .min(3, 'Website domain is required')
      .regex(
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i,
        'Please enter a valid domain (e.g., example.edu.in)'
      ),

    registrarOfficialEmail: z
      .string()
      .email('Please enter a valid email address'),

    walletAddress: z
      .string()
      .regex(
        /^0x[a-fA-F0-9]{40}$/,
        'Invalid wallet address. Must be a valid Ethereum address (0x...)'
      ),
  })
  .refine(
    (data) => {
      const emailDomain = data.registrarOfficialEmail.split('@')[1]?.toLowerCase();
      const websiteDomain = data.websiteDomain.toLowerCase();

      // Check if email domain matches website domain
      if (emailDomain === websiteDomain) {
        return true;
      }

      // Check if email ends with .edu.in or .ac.in
      if (emailDomain?.endsWith('.edu.in') || emailDomain?.endsWith('.ac.in')) {
        return true;
      }

      return false;
    },
    {
      message: 'Registrar email must match university domain, end with .edu.in, or .ac.in',
      path: ['registrarOfficialEmail'],
    }
  );

export type UniversityRegistrationFormData = z.infer<typeof universityRegistrationSchema>;
