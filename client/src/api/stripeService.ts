import axiosInstance from './axios';

function getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}

export const stripeService = {
    /**
     * Create an onboarding link for a user to connect robustly with Stripe
     */
    onboardUser: async (): Promise<{ url: string }> => {
        const response = await axiosInstance.post<{ success: boolean; data: { url: string } }>(
            '/stripe/onboard',
            {},
            { headers: authHeaders() }
        );
        return response.data.data;
    },

    /**
     * Create a Payment Intent for Escrow
     */
    initiatePayment: async (dealId: string): Promise<{ clientSecret: string; paymentIntentId: string }> => {
        const response = await axiosInstance.post<{ success: boolean; data: { clientSecret: string; paymentIntentId: string } }>(
            '/stripe/payment-intent',
            { dealId },
            { headers: authHeaders() }
        );
        return response.data.data;
    },

    /**
     * Release payment from Escrow to the Seller
     */
    releaseEscrow: async (dealId: string): Promise<any> => {
        const response = await axiosInstance.post<{ success: boolean; data: any }>(
            '/stripe/release-payment',
            { dealId },
            { headers: authHeaders() }
        );
        return response.data;
    },

    /**
     * Refund payment from Escrow back to Buyer
     */
    refundEscrow: async (dealId: string): Promise<any> => {
        const response = await axiosInstance.post<{ success: boolean; data: any }>(
            '/stripe/refund-escrow',
            { dealId },
            { headers: authHeaders() }
        );
        return response.data;
    },

    /**
     * Buyer confirms delivery of the item, prompting escrow release
     */
    buyerConfirmDelivery: async (dealId: string, notes?: string): Promise<any> => {
        const response = await axiosInstance.post<{ success: boolean; data: any }>(
            '/stripe/buyer-confirm',
            { dealId, notes },
            { headers: authHeaders() }
        );
        return response.data;
    }
};
