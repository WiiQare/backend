export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum UserRole {
  WIIQARE_ADMIN = 'WIIQARE_ADMIN',
  WIIQARE_MANAGER = 'WIIQARE_MANAGER',
  PAYER = 'PAYER',
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
}

export enum UserType {
  PAYER = 'PAYER',
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
}

export enum VoucherStatus {
  CLAIMED = 'CLAIMED',
  UNCLAIMED = 'UNCLAIMED',
  BURNED = 'BURNED',
  PENDING = 'PENDING',
}

export enum InviteType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}
export enum BusinessType {
  CLINIC = 'CLINIC',
  PHARMACY = 'PHARMACY',
  HOSPITAL = 'HOSPITAL',
  DENTIST = 'DENTIST',
  MEDICAL_CABINET = 'MEDICAL_CABINET',
}
