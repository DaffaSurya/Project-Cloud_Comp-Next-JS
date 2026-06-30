import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("r.admin@kampus.ac.id");
  const [userName, setUserName] = useState("Rizky - Admin");
  const [userInitials, setUserInitials] = useState("R");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        const email = session.user.email || "r.admin@kampus.ac.id";
        setUserEmail(email);
        const parts = email.split("@")[0].split(".");
        const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        setUserName(name + " - Admin");
        setUserInitials(name.charAt(0).toUpperCase() || "R");
        setAuthLoading(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        const email = session.user?.email || "r.admin@kampus.ac.id";
        setUserEmail(email);
        const parts = email.split("@")[0].split(".");
        const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        setUserName(name + " - Admin");
        setUserInitials(name.charAt(0).toUpperCase() || "R");
        setAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return {
    authLoading,
    userEmail,
    userName,
    userInitials,
    handleLogout
  };
}
