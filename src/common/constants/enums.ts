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

export enum SenderType {
  PAYER = 'PAYER',
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
}

export enum ReceiverType {
  PATIENT = 'PATIENT',
  PROVIDER = 'PROVIDER',
  WII_QARE = 'WII_QARE',
}

export enum VoucherStatus {
  UNCLAIMED = 'UNCLAIMED',
  CLAIMED = 'CLAIMED',
  PENDING = 'PENDING',
  BURNED = 'BURNED',
  // SPLIT = 'SPLIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESSFUL = 'SUCCESSFUL',
  PAID_OUT = 'PAID_OUT',
  // SPLIT = 'SPLIT'
}

export enum ReferralStatus {
  REDEEMED = 'REDEEMED',
  NOT_REDEEMED = 'NOT_REDEEMED',
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
