"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Refine, AuthProvider } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router/app";
import { dataProvider } from "@refinedev/supabase";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { INITIAL_QUESTS, INITIAL_CATEGORIES, INITIAL_BADGES } from "@/lib/data/initialData";

// Fallback client for dataProvider to prevent crash when env is not configured yet
const clientForProvider = supabase || createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-realm.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
);

interface AdminAuthContextType {
  isAdmin: boolean;
  role: "admin" | "user" | null;
  isLoading: boolean;
  currentUser: any | null;
  toggleDemoAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  role: null,
  isLoading: true,
  currentUser: null,
  toggleDemoAdmin: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth and role
  useEffect(() => {
    let isMounted = true;

    async function checkRole() {
      setIsLoading(true);

      // If Supabase is not configured (Demo Mode)
      if (!isSupabaseConfigured || !supabase) {
        // In local demo mode, check localStorage for demo admin role or default to admin for ease of testing
        const savedDemoRole = localStorage.getItem("misiku_demo_role") as "admin" | "user" || "admin";
        if (isMounted) {
          setRole(savedDemoRole);
          setCurrentUser({
            id: "demo-admin-id",
            email: "admin@misiku.realm",
            username: "Grandmaster Admin",
          });
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) {
            setRole(null);
            setCurrentUser(null);
            setIsLoading(false);
          }
          return;
        }

        setCurrentUser(session.user);

        // Fetch user profile to check role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, username")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          // If profile has no role yet or error, default to user
          if (isMounted) {
            setRole("user");
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setRole((profile.role as "admin" | "user") || "user");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Admin role check error:", err);
        if (isMounted) {
          setRole("user");
          setIsLoading(false);
        }
      }
    }

    checkRole();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDemoAdmin = () => {
    const nextRole = role === "admin" ? "user" : "admin";
    setRole(nextRole);
    localStorage.setItem("misiku_demo_role", nextRole);
  };

  const authProvider: AuthProvider = {
    login: async () => ({ success: true, redirectTo: "/admin" }),
    logout: async () => {
      if (supabase) await supabase.auth.signOut();
      setRole(null);
      setCurrentUser(null);
      return { success: true, redirectTo: "/" };
    },
    check: async () => {
      if (role === "admin") return { authenticated: true };
      return {
        authenticated: false,
        error: new Error("Hanya Administrator yang memiliki akses ke panel ini."),
        redirectTo: "/",
      };
    },
    onError: async (error) => {
      console.error("Refine Auth Error:", error);
      return { error };
    },
    getPermissions: async () => role,
    getIdentity: async () => ({
      id: currentUser?.id,
      name: currentUser?.username || currentUser?.email || "Admin",
      email: currentUser?.email,
      role,
    }),
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin: role === "admin",
        role,
        isLoading,
        currentUser,
        toggleDemoAdmin,
      }}
    >
      <Refine
        dataProvider={dataProvider(clientForProvider)}
        routerProvider={routerProvider}
        authProvider={authProvider}
        resources={[
          {
            name: "quests",
            list: "/admin/quests",
            show: "/admin/quests",
            create: "/admin/quests",
            edit: "/admin/quests",
            meta: { label: "Quests" },
          },
          {
            name: "profiles",
            list: "/admin/users",
            show: "/admin/users",
            edit: "/admin/users",
            meta: { label: "Adventurers" },
          },
          {
            name: "categories",
            list: "/admin/categories",
            show: "/admin/categories",
            create: "/admin/categories",
            edit: "/admin/categories",
            meta: { label: "Categories" },
          },
          {
            name: "badges",
            list: "/admin/badges",
            show: "/admin/badges",
            create: "/admin/badges",
            edit: "/admin/badges",
            meta: { label: "Badges" },
          },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
        }}
      >
        {children}
      </Refine>
    </AdminAuthContext.Provider>
  );
}

