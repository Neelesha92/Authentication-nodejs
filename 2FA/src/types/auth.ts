export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}
