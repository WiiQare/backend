export const _400 = {
  MALFORMED_INPUTS_PROVIDED: {
    code: 'MALFORMED_INPUTS_PROVIDED',
    description:
      'Certaines des données fournies sont manquantes ou non autorisées',
  },
  PASSWORD_MISMATCH: {
    code: 'PASSWORD_MISMATCH',
    description: 'Les mots de passe ne correspondent pas!',
  },
  EMAIL_REQUIRED: {
    code: 'EMAIL_REQUIRED',
    description: "L'e-mail est requis!",
  },
  PHONE_NUMBER_REQUIRED: {
    code: 'PHONE_NUMBER_REQUIRED',
    description: 'Le numéro de téléphone est requis!',
  },
  VOUCHER_PROCESS: {
    code: 'WAIT_VOUCHER_PROCESS',
    description: 'Le voucher est en cours de traitement!',
  },
};

export const _401 = {
  AUTH_INVALID_TOKEN: {
    code: 'AUTH_INVALID_TOKEN',
    description: 'Invalid JWToken',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    description: 'Provided JWToken is expired',
  },
  MALFORMED_TOKEN: {
    code: 'MALFORMED_TOKEN',
    description: 'Provided JwToken is malformed.',
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    description: 'Les informations fournies sont incorrectes',
  },
};

export const _403 = {
  EMAIL_VERIFICATION_REQUIRED: {
    code: 'EMAIL_VERIFICATION_REQUIRED',
    description: "L'e-mail n'est pas vérifié ou la vérification a expiré!",
  },
  OTP_VERIFICATION_FAILED: {
    code: 'OTP_VERIFICATION_FAILED',
    description:
      'La vérification du mot de passe une fois a échoué, doit être vérifiée à nouveau!',
  },
  USER_ACCOUNT_NOT_ACTIVE: {
    code: 'USER_ACCOUNT_NOT_ACTIVE',
    description: 'Compte utilisateur non actif!',
  },
  USER_ACCOUNT_ALREADY_EXIST: {
    code: 'USER_ACCOUNT_ALREADY_EXIST',
    description: 'Le compte utilisateur existe déjà!',
  },
  PATIENT_ALREADY_EXISTS: {
    code: 'PATIENT_ALREADY_EXISTS',
    description: 'Patient déjà inscrit!',
  },
  INVALID_RESET_TOKEN: {
    code: 'INVALID_RESET_TOKEN',
    description: 'Le code de réinitialisation fourni non valide !',
  },
  INVALID_EMAIL_VERIFICATION_TOKEN: {
    code: 'INVALID_EMAIL_VERIFICATION_TOKEN',
    description: "Le lien de vérification d'e-mail fourni non valide!",
  },
  ACCESS_NOT_ALLOWED: {
    code: 'ACCESS_NOT_ALLOWED',
    description: 'Accès non autorisé!',
  },
  ONLY_OWNER_CAN_SEND_VOUCHER: {
    code: 'ONLY_OWNER_CAN_SEND_VOUCHER',
    description: 'Seul le propriétaire du compte peut envoyer un bon!',
  },
  INVALID_VOUCHER_TRANSFER_VERIFICATION_CODE: {
    code: 'INVALID_VOUCHER_TRANSFER_VERIFICATION_CODE',
    description: 'Invalid voucher transfer verification code provided!',
  },
};

export const _404 = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    description: 'Utilisateur non trouvé!',
  },
  PAYER_NOT_FOUND: {
    code: 'PAYER_NOT_FOUND',
    description: 'Expart introuvable!',
  },
  PATIENT_NOT_FOUND: {
    code: 'PATIENT_NOT_FOUND',
    description: 'Patient introuvable!',
  },
  PROVIDER_NOT_FOUND: {
    code: 'PROVIDER_NOT_FOUND',
    description: 'Fournisseur introuvable!',
  },
  PACKAGE_NOT_FOUND: {
    code: 'PACKAGE_NOT_FOUND',
    description: 'Package introuvable!',
  },
  INVALID_TRANSACTION_HASH: {
    code: 'INVALID_TRANSACTION_HASH',
    description: 'Le code de transaction fourni est invalide!',
  },
  VOUCHER_USED: {
    code: 'VOUCHER_USED',
    description: 'Ce bon a déjà été utilisé!',
  },
};

export const _409 = {
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    description: 'Utilisateur déjà enregistré!',
  },
};

export const _500 = {
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    description: "Quelque chose s'est passé de manière inattendue!",
  },
};
