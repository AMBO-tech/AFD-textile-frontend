import API, { getErrorMessage } from '@/api/api';

export interface OtpSendResponse {
  success: boolean;
  message: string;
  channel: 'SMS' | 'EMAIL';
}

/** Active un compte invité : définit le mot de passe à partir du jeton reçu par SMS / e-mail. */
export const setupPassword = async (token: string, nouveauMotDePasse: string): Promise<void> => {
  try {
    await API.post('/auth/setup-password', { token, nouveauMotDePasse });
  } catch (error) {
    throw new Error(getErrorMessage(error, "Impossible d'activer le compte."));
  }
};

/** Mot de passe oublié, étape 1 : envoie un code à 6 chiffres par SMS (ou e-mail pour le gérant). */
export const sendResetCode = async (identifier: string): Promise<OtpSendResponse> => {
  try {
    const response = await API.post<OtpSendResponse>('/auth/otp/send', { identifier });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Impossible d'envoyer le code."));
  }
};

/** Mot de passe oublié, étape 2 : valide le code et enregistre le nouveau mot de passe. */
export const resetPassword = async (
  identifier: string,
  otpCode: string,
  nouveauMotDePasse: string,
): Promise<void> => {
  try {
    await API.post('/auth/reset-password', { identifier, otpCode, nouveauMotDePasse });
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Impossible de réinitialiser le mot de passe.'));
  }
};
