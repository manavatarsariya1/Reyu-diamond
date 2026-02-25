import api from "./axios";

// auth.service.ts
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  isVerified: boolean;
  accountStatus: "ACTIVE" | "DEACTIVE";
  isKycVerified: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
}

// Backend response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string;
}

export class AuthService {
  // LOGIN
  async login(payload: LoginPayload): Promise<User> {
    try {
      const response = await api.post<ApiResponse>("/auth/login", payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "Invalid email or password");
      }

      const { user, token } = response.data.data;
      // const userData = response.data.data;
      // const user: User = {
      //   id: userData.user._id || userData.user.id,
      //   username: userData.user.username,
      //   email: userData.user.email,
      //   role: userData.user.role,
      //   isVerified: userData.user.isVerified,
      // };

      // localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("token", JSON.stringify(token));

      return user;
    } catch (error: any) {
      // const errorMessage = error.response?.data?.errors || error.response?.data?.message || error.message || "Login failed";
      // throw new Error(errorMessage);

      throw {
        message:
          error.response?.data?.message ||
          "Login failed",
        details:
          error.response?.data?.errors ||
          error.message,
      };
    }
  }

  // REGISTER
  async register(payload: RegisterPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<ApiResponse>("/auth/register", payload);



      // console.log("hi")
      if (!response.data.success) {
        throw new Error(response.data?.errors || response.data.message || "Registration failed");
      }
      // console.log(response.data.errors)
      // if (response.data.success) {
      // }
      return {
        message: response.data?.message || response.data?.errors || "Registration successful",
      };

      // Since your backend doesn't return user data on registration,
      // we'll create a minimal user object
      // const user: User = {
      //   id: "", // Will be set after OTP verification
      //   username: payload.username,
      //   email: payload.email,
      //   role: "user",
      //   isVerified: false,
      // };


    } catch (error: any) {
      const errorMessage = error.response?.data?.errors || error.response?.data?.message || error.message || "Registration failed";
      console.log("Error in register:", errorMessage);
      throw {
        message:
          error.response?.data?.message ||
          "Registration failed",
        details:
          error.response?.data?.errors ||
          error.message,
      };
    }
  }

  // VERIFY OTP
  async verifyOtp(payload: VerifyOtpPayload): Promise<User> {
    try {
      // console.log("hwllo")
      console.log(payload)
      const response = await api.post<ApiResponse>("/auth/verify-otp", payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "OTP verification failed");
      }

      const { user, token } = response.data.data;

      // const user = userData ;

      // const user: User = {
      //   id: userData.user.id || userData.user._id,
      //   username: userData.user.username,
      //   email: userData.user.email,
      //   role: userData.user.role,
      //   isVerified: true,
      // };

      // Store user data after successful verification
      localStorage.setItem("currentUser", JSON.stringify(token));

      return {
        user,
        message: response.data?.message || "LoggedIn Successfully",
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "OTP verification failed";
      throw new Error(errorMessage);
    }
  }

  // RESEND OTP
  async resendOtp(payload: ResendOtpPayload): Promise<void> {
    try {
      const response = await api.post<ApiResponse>("/auth/resend-otp", payload);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to resend OTP";
      throw new Error(errorMessage);
    }
  }

  // LOGOUT
  async logout(): Promise<void> {
    try {
      // Call backend to clear cookie
      await api.post("/auth/logout");

      localStorage.removeItem("currentUser");
    } catch (error: any) {
      // Even if backend logout fails, clear local storage
      localStorage.removeItem("currentUser");
      throw new Error(error.response?.data?.message || "Logout failed");
    }
  }

  // GET CURRENT USER
  getCurrentUser(): User | null {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }

  // CHECK IF AUTHENTICATED
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export const authService = new AuthService();