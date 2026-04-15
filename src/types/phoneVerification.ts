// Phone Verification types — matches foundation-sdk phone_verification API response shapes

export interface SendCodeRequest {
  phone_number: string;
}

export interface SendCodeResponse {
  success: boolean;
  verification_id: string;
  message: string;
  code?: string; // Only present in dev mode (no sms_sender configured)
}

export interface VerifyCodeRequest {
  verification_id: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  phone_number?: string;
  message: string;
}

export interface PhoneVerificationStatus {
  success: boolean;
  is_verified: boolean;
  verified_phone: string | null;
}
