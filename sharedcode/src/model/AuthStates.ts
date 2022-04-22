export const REGISTER = "Register";
export const CONFIRM_REGISTRATION = "ConfirmRegistration";
export const SIGN_IN = "SignIn";
export const CONFIRM_SIGN_IN = "ConfirmSignIn";
export const SIGNED_OUT = "SignedOut";
export const SIGNED_IN = "SignedIn";
export const FORGOT_PASSWORD_REQUEST = "ForgotPasswordRequest";
export const FORGOT_PASSWORD_SUBMIT = "ForgotPasswordSubmit";
export const RESET_PASSWORD = "ResetPassword";
export const NEW_PASSWORD_REQUIRED = "NewPasswordRequired";
export const TOTP_SETUP = "TOTPSetup";

export type AuthState =
  | typeof REGISTER
  | typeof CONFIRM_REGISTRATION
  | typeof SIGN_IN
  | typeof CONFIRM_SIGN_IN
  | typeof SIGNED_OUT
  | typeof SIGNED_IN
  | typeof FORGOT_PASSWORD_REQUEST
  | typeof FORGOT_PASSWORD_SUBMIT
  | typeof RESET_PASSWORD
  | typeof NEW_PASSWORD_REQUIRED
  | typeof TOTP_SETUP;

export const MFA_OPTION_TOTP = "TOTP";
export const MFA_OPTION_SMS = "SMS";
export const MFA_OPTION_NONE = "NOMFA";

export type MfaOption =
  | typeof MFA_OPTION_TOTP
  | typeof MFA_OPTION_SMS
  | typeof MFA_OPTION_NONE;

export const SOFTWARE_TOKEN_MFA = "SOFTWARE_TOKEN_MFA";
export const SMS_MFA = "SMS_MFA";
export const NO_MFA = "NOMFA";

export type MfaType =
  | typeof SOFTWARE_TOKEN_MFA
  | typeof SMS_MFA
  | typeof NO_MFA;

// The Amplify signin response type is incorrect - fixing here
export const CHALLENGE_NEW_PASSWORD_REQUIRED = "NEW_PASSWORD_REQUIRED";
export const MFA_SETUP = "MFA_SETUP";

export type SignInChallengeName =
  | typeof SOFTWARE_TOKEN_MFA
  | typeof SMS_MFA
  | typeof CHALLENGE_NEW_PASSWORD_REQUIRED
  | typeof MFA_SETUP;
