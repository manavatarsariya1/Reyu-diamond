import api from "./axios";
import { DiamondShape, DiamondColor, DiamondClarity, DiamondCertification, type DiamondPreference } from "@/types/preference";

export interface SubmitPreferencePayload {
  shape: DiamondShape;
  carat: number;
  color: DiamondColor;
  clarity: DiamondClarity;
  lab: DiamondCertification;
  location: string;
  budget: number;
}

// Backend response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string;
}

export class PreferenceService {
  private getToken() {
    return JSON.parse(localStorage.getItem("token") || "\"\"");
  }

  private authHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  async submitPreference(payload: SubmitPreferencePayload): Promise<DiamondPreference> {
    try {
      const response = await api.post<ApiResponse<DiamondPreference>>("/requirements", payload, {
        headers: this.authHeaders(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to submit preference");
      }

      return response.data.data!;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Failed to submit preference",
        details: error.response?.data?.errors || error.message,
      };
    }
  }

  async updatePreference(id: string, payload: Partial<SubmitPreferencePayload>): Promise<DiamondPreference> {
    try {
      const response = await api.put<ApiResponse<DiamondPreference>>(`/requirements/${id}`, payload, {
        headers: this.authHeaders(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update preference");
      }

      return response.data.data!;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Failed to update preference",
        details: error.response?.data?.errors || error.message,
      };
    }
  }

  async fetchMyRequirements(): Promise<DiamondPreference[]> {
    try {
      const response = await api.get<ApiResponse<DiamondPreference[]>>("/requirements/my-requirement", {
        headers: this.authHeaders(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch preferences");
      }

      return response.data.data!;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Failed to fetch preferences",
        details: error.response?.data?.errors || error.message,
      };
    }
  }

  async deletePreference(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse>(`/requirements/${id}`, {
        headers: this.authHeaders(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete preference");
      }
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || "Failed to delete preference",
        details: error.response?.data?.errors || error.message,
      };
    }
  }
}

export const preferenceService = new PreferenceService();