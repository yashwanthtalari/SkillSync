"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";
import { UserRole } from "./types";
import { useRouter } from "next/navigation";

interface AuthUser {
  user_id: string;
  email: string;
  role: UserRole;
  token: string;
  profile_id: string;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session on mount
    const stored = localStorage.getItem("skill2pocket_user");
    const token = localStorage.getItem("skill2pocket_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("skill2pocket_user");
        localStorage.removeItem("skill2pocket_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post("/auth/login", { email, password: pass });
    const data = res.data;
    const authData: AuthUser = {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      token: data.access_token,
      profile_id: data.profile_id,
      full_name: data.full_name
    };
    localStorage.setItem("skill2pocket_token", data.access_token);
    localStorage.setItem("skill2pocket_user", JSON.stringify(authData));
    setUser(authData);

    if (data.role === "student") {
      router.push("/student/dashboard");
    } else {
      router.push("/client/dashboard");
    }
  };

  const register = async (payload: any) => {
    const res = await api.post("/auth/register", payload);
    const data = res.data;
    const authData: AuthUser = {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      token: data.access_token,
      profile_id: data.profile_id,
      full_name: data.full_name
    };
    localStorage.setItem("skill2pocket_token", data.access_token);
    localStorage.setItem("skill2pocket_user", JSON.stringify(authData));
    setUser(authData);

    if (data.role === "student") {
      router.push("/student/dashboard");
    } else {
      router.push("/client/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("skill2pocket_token");
    localStorage.removeItem("skill2pocket_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
