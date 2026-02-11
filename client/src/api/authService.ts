// auth.service.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserStored extends User {
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export class AuthService {
  // LOGIN
  async login(payload: LoginPayload): Promise<User> {
    const users: UserStored[] = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(u => u.email === payload.email && u.password === payload.password);

    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem("currentUser", JSON.stringify(safeUser));
      return safeUser;
    }

    throw new Error("Invalid email or password");
  }

  // REGISTER
  async register(payload: RegisterPayload): Promise<User> {
    const users: UserStored[] = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === payload.email)) {
      throw new Error("User already exists");
    }
    console.log("hi")

    const newUser: UserStored = { ...payload, id: Date.now().toString() };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem("currentUser");
  }

  // GET CURRENT USER
  getCurrentUser(): User | null {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }
}

// Export a singleton instance

// AuthService is a class
// new AuthService() creates an instance (or copy) of the class
// That instance (authService) has all the methods: login, register, logout, getCurrentUser and we can use it anywhere in our app
export const authService = new AuthService();
