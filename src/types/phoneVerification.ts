// Phone Verification types — matches foundation-sdk phone_verification API response shapes

export interface SendCodeRequest {
  phone_number: string;
}

export interface SendCodeResponse {
  success: boolean;
  verification_id: string;
  message: string;
  // NO `code` field. foundation-sdk used to return the OTP whenever no
  // sms_sender was configured — a "dev mode" gated on service presence, which
  // meant any app registering the blueprint without Twilio shipped a public
  // endpoint handing out codes for any phone number. That branch is removed;
  // local development wires an explicit sms_sender that logs the code instead.
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
