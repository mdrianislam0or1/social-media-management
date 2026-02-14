
export interface UpdateFcmTokenData {
  fcmToken: string;
}

export interface UpdateFcmTokenResponse {
  success: boolean;
  message: string;
}

export const updateFcmToken = async (fcmToken: string): Promise<UpdateFcmTokenResponse> => {
  try {
    // This endpoint should be implemented in your backend
    // For now, we'll just log it since the backend might not have this endpoint yet
    console.log('Updating FCM token:', fcmToken);

    // Uncomment when backend supports FCM token update
    // const response = await api.post<UpdateFcmTokenResponse>('/user/fcm-token', { fcmToken });
    // return response.data;

    // Return success for now
    return {
      success: true,
      message: 'FCM token updated (client-side only)',
    };
  } catch (error: any) {
    console.error('Error updating FCM token:', error);
    // Don't throw error, just log it
    return {
      success: false,
      message: 'Failed to update FCM token',
    };
  }
};
