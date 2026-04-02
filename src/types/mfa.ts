// MFA types — matches foundation-sdk MFA API response shapes (snake_case keys)

export interface MfaStatusResponse {
  success: boolean;
  enrolled: boolean;
}

export interface MfaResultResponse {
  success: boolean;
  error: string | null;
}

export interface MfaEnrollRequest {
  email: string;
}

export interface MfaCodeRequest {
  code: string;
}
