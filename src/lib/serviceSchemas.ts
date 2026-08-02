import { z } from 'zod';

/**
 * REUSABLE FIELD SCHEMAS
 * Common validation patterns used across multiple services
 */

// Passport Number: 6-9 alphanumeric characters
export const passportNumberSchema = z
  .string()
  .min(6, 'Passport number must be at least 6 characters')
  .max(9, 'Passport number must not exceed 9 characters')
  .regex(/^[A-Z0-9]+$/, 'Passport number must contain only uppercase letters and numbers')
  .trim();

// Emirates ID: Format XXX-XXXX-XXXXXXX-X (15 digits with dashes)
export const emiratesIdSchema = z
  .string()
  .regex(
    /^\d{3}-\d{4}-\d{7}-\d{1}$/,
    'Emirates ID must be in format XXX-XXXX-XXXXXXX-X'
  )
  .trim();

// Nationality: List of UAE-recognized nationalities
const UAE_NATIONALITIES = [
  'AE', // United Arab Emirates
  'SA', // Saudi Arabia
  'KW', // Kuwait
  'BH', // Bahrain
  'QA', // Qatar
  'OM', // Oman
  'JO', // Jordan
  'SY', // Syria
  'LB', // Lebanon
  'PS', // Palestine
  'IQ', // Iraq
  'EG', // Egypt
  'SD', // Sudan
  'LY', // Libya
  'DZ', // Algeria
  'MA', // Morocco
  'TN', // Tunisia
  'YE', // Yemen
  'PK', // Pakistan
  'IN', // India
  'BD', // Bangladesh
  'LK', // Sri Lanka
  'NP', // Nepal
  'PH', // Philippines
  'ID', // Indonesia
  'MY', // Malaysia
  'TH', // Thailand
  'VN', // Vietnam
  'KH', // Cambodia
  'LA', // Laos
  'MM', // Myanmar
  'SG', // Singapore
  'CN', // China
  'JP', // Japan
  'KR', // South Korea
  'RU', // Russia
  'GB', // United Kingdom
  'US', // United States
  'CA', // Canada
  'AU', // Australia
  'FR', // France
  'DE', // Germany
  'IT', // Italy
  'ES', // Spain
  'NL', // Netherlands
  'BE', // Belgium
  'CH', // Switzerland
  'AT', // Austria
  'SE', // Sweden
  'NO', // Norway
  'DK', // Denmark
  'FI', // Finland
] as const;

export const nationalitySchema = z
  .enum(UAE_NATIONALITIES)
  .describe('Country code of UAE-recognized nationality');

// Date of Birth: Must be reasonable (18-120 years ago)
export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    },
    'Must be at least 18 years old'
  )
  .refine(
    (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age <= 120;
    },
    'Invalid date of birth'
  );

// Passport Expiry Date: Must be in the future
export const passportExpirySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today;
    },
    'Passport expiry date must be in the future'
  );

// Phone Number: UAE format (9-15 digits, optional +971 prefix)
export const phoneNumberSchema = z
  .string()
  .regex(
    /^(\+?971)?[0-9]{7,13}$/,
    'Phone number must be a valid UAE number (7-13 digits)'
  )
  .trim();

// Mobile Number: UAE specific (10-12 digits, optional +971 prefix)
export const mobileNumberSchema = z
  .string()
  .regex(
    /^(\+971|0)?[5][0-9]{8}$/,
    'Must be a valid UAE mobile number'
  )
  .trim();

// Transaction Number: Alphanumeric, typically 6-20 characters
export const transactionNumberSchema = z
  .string()
  .min(6, 'Transaction number must be at least 6 characters')
  .max(20, 'Transaction number must not exceed 20 characters')
  .regex(/^[A-Z0-9]+$/, 'Transaction number must contain only uppercase letters and numbers')
  .trim();

// Trade License Number: UAE format (digits only, typically 6-10 characters)
export const tradeLicenseNumberSchema = z
  .string()
  .regex(/^[0-9]{6,10}$/, 'Trade license number must be 6-10 digits')
  .trim();

// Labour Card Number: Alphanumeric (8-15 characters)
export const labourCardNumberSchema = z
  .string()
  .min(8, 'Labour card number must be at least 8 characters')
  .max(15, 'Labour card number must not exceed 15 characters')
  .trim();

// Work Permit Number: Alphanumeric (8-15 characters)
export const workPermitNumberSchema = z
  .string()
  .min(8, 'Work permit number must be at least 8 characters')
  .max(15, 'Work permit number must not exceed 15 characters')
  .trim();

// Company Code: Numeric identifier (6-10 digits)
export const companyCodeSchema = z
  .string()
  .regex(/^[0-9]{6,10}$/, 'Company code must be 6-10 digits')
  .trim();

// Authority ID: Used for establishment card lookups
export const authorityIdSchema = z
  .string()
  .min(1, 'Authority ID is required')
  .max(50, 'Authority ID must not exceed 50 characters')
  .trim();

/**
 * SERVICE-SPECIFIC VALIDATION SCHEMAS
 */

// OVERSTAY_FINE: Check overstay fines
export const overstayFineSchema = z
  .object({
    passportNumber: passportNumberSchema,
    nationality: nationalitySchema,
    dateOfBirth: dateOfBirthSchema.optional(),
    emiratesId: emiratesIdSchema.optional(),
    uid: z.string().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.passportNumber && !data.emiratesId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either passport number or Emirates ID is required',
        path: ['passportNumber'],
      });
    }
  });

// TRAVEL_BAN: Check travel ban status
export const travelBanSchema = z
  .object({
    emiratesId: emiratesIdSchema,
    uid: z.string().min(1, 'UID is required'),
    mobileNumber: mobileNumberSchema,
    uaePassLinked: z.boolean().optional(),
  })
  .strict();

// ABSCONDING: Check absconding status with employment context
export const abscondingSchema = z
  .object({
    passportNumber: passportNumberSchema,
    nationality: nationalitySchema,
    emiratesId: emiratesIdSchema,
    isEmployed: z.boolean(),
    labourCardNumber: labourCardNumberSchema.optional(),
    workPermitNumber: workPermitNumberSchema.optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.isEmployed) {
        return !!data.labourCardNumber || !!data.workPermitNumber;
      }
      return true;
    },
    {
      message:
        'Labour card number or work permit number is required when employed',
      path: ['labourCardNumber'],
    }
  );

// INSIDE_OUTSIDE: Check if person is inside or outside UAE
export const insideOutsideSchema = z
  .object({
    passportNumber: passportNumberSchema,
    passportExpiryDate: passportExpirySchema,
    nationality: nationalitySchema,
    dateOfBirth: dateOfBirthSchema,
  })
  .strict();

// APPLICATION_STATUS: Track visa/EID/work permit application status
export const applicationStatusSchema = z
  .object({
    applicationType: z.enum(['visa', 'eid', 'workPermit'], {
      errorMap: () => ({
        message: 'Application type must be visa, eid, or workPermit',
      }),
    }),
    passportNumber: passportNumberSchema.optional(),
    emiratesId: emiratesIdSchema.optional(),
    applicationReferenceNumber: z.string().optional(),
    transactionNumber: transactionNumberSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const hasIdentifier =
      !!data.passportNumber ||
      !!data.emiratesId ||
      !!data.applicationReferenceNumber ||
      !!data.transactionNumber;

    if (!hasIdentifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'At least one identifier is required (passport, Emirates ID, application reference, or transaction number)',
        path: ['passportNumber'],
      });
    }
  });

// NAWAKAS: Federal tax system lookup
export const nawakasSchema = z
  .object({
    transactionNumber: transactionNumberSchema,
    passportNumber: passportNumberSchema,
  })
  .strict();

// ESTABLISHMENT_CARD: Look up establishment card information
export const establishmentCardSchema = z
  .object({
    tradeLicenseNumber: tradeLicenseNumberSchema,
    companyCode: companyCodeSchema.optional(),
    establishmentCardNumber: z
      .string()
      .min(1, 'Establishment card number must not be empty')
      .max(20, 'Establishment card number must not exceed 20 characters')
      .optional(),
    authorityId: authorityIdSchema,
  })
  .strict()
  .refine(
    (data) => {
      return !!data.tradeLicenseNumber || !!data.establishmentCardNumber;
    },
    {
      message: 'Either trade license number or establishment card number is required',
      path: ['tradeLicenseNumber'],
    }
  );

// EXPIRY_CHECKER: Check expiry dates for multiple document types
export const expiryCheckerSchema = z
  .object({
    checkOptions: z
      .array(
        z.enum(['passport', 'emiratesId', 'visa', 'workPermit', 'drivingLicense'], {
          errorMap: () => ({
            message: 'Invalid check option selected',
          }),
        })
      )
      .min(1, 'At least one document type must be selected'),
    passportNumber: passportNumberSchema.optional(),
    emiratesId: emiratesIdSchema.optional(),
    visaReferenceNumber: z.string().optional(),
    workPermitNumber: workPermitNumberSchema.optional(),
    drivingLicenseNumber: z
      .string()
      .min(1, 'Driving license number is required')
      .max(20, 'Driving license number must not exceed 20 characters')
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    // Validate conditional required fields based on checkOptions selections
    if (data.checkOptions.includes('passport') && !data.passportNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passport number is required when checking passport expiry',
        path: ['passportNumber'],
      });
    }

    if (data.checkOptions.includes('emiratesId') && !data.emiratesId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Emirates ID is required when checking Emirates ID expiry',
        path: ['emiratesId'],
      });
    }

    if (data.checkOptions.includes('workPermit') && !data.workPermitNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Work permit number is required when checking work permit expiry',
        path: ['workPermitNumber'],
      });
    }

    if (data.checkOptions.includes('drivingLicense') && !data.drivingLicenseNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Driving license number is required when checking driving license expiry',
        path: ['drivingLicenseNumber'],
      });
    }
  });

/**
 * VALIDATION SCHEMA MAP
 * Maps service types to their corresponding validation schemas
 */
export const validationSchemaMap = {
  OVERSTAY_FINE: overstayFineSchema,
  TRAVEL_BAN: travelBanSchema,
  ABSCONDING: abscondingSchema,
  INSIDE_OUTSIDE: insideOutsideSchema,
  APPLICATION_STATUS: applicationStatusSchema,
  NAWAKAS: nawakasSchema,
  ESTABLISHMENT_CARD: establishmentCardSchema,
  EXPIRY_CHECKER: expiryCheckerSchema,
} as const;

/**
 * Service type union for type safety
 */
export type ServiceType = keyof typeof validationSchemaMap;

/**
 * HELPER FUNCTION
 * Retrieves the validation schema for a specific service type
 */
export function getValidationSchema(serviceType: ServiceType) {
  const schema = validationSchemaMap[serviceType];

  if (!schema) {
    throw new Error(
      `No validation schema found for service type: ${serviceType}. Valid types are: ${Object.keys(validationSchemaMap).join(', ')}`
    );
  }

  return schema;
}

/**
 * TYPE EXPORTS
 * Infer TypeScript types from Zod schemas for use throughout the application
 */
export type OverstayFineInput = z.infer<typeof overstayFineSchema>;
export type TravelBanInput = z.infer<typeof travelBanSchema>;
export type AbscondingInput = z.infer<typeof abscondingSchema>;
export type InsideOutsideInput = z.infer<typeof insideOutsideSchema>;
export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
export type NawakasInput = z.infer<typeof nawakasSchema>;
export type EstablishmentCardInput = z.infer<typeof establishmentCardSchema>;
export type ExpiryCheckerInput = z.infer<typeof expiryCheckerSchema>;

/**
 * Unified input type for all services (discriminated union)
 */
export type ServiceInput =
  | (OverstayFineInput & { service: 'OVERSTAY_FINE' })
  | (TravelBanInput & { service: 'TRAVEL_BAN' })
  | (AbscondingInput & { service: 'ABSCONDING' })
  | (InsideOutsideInput & { service: 'INSIDE_OUTSIDE' })
  | (ApplicationStatusInput & { service: 'APPLICATION_STATUS' })
  | (NawakasInput & { service: 'NAWAKAS' })
  | (EstablishmentCardInput & { service: 'ESTABLISHMENT_CARD' })
  | (ExpiryCheckerInput & { service: 'EXPIRY_CHECKER' });
