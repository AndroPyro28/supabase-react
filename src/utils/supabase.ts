import { createClient } from "@supabase/supabase-js";

const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;
const PROJECT_URL = import.meta.env.VITE_SUPABASE_PROJECT_URL;
export const supabase = createClient(PROJECT_URL, API_KEY);

export const getSession = async () => {
  const session = await supabase.auth.getSession();
  return session;
};

export const signOut = async () => {
  const response = await supabase.auth.signOut();
  // window.location.reload();
  return response;
};

export const signUp = async (email: string, password: string) => {
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error signing up:", error.message);
    return;
  }
};

export const signInWithPassword = async (email: string, password: string) => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error.message);
    return;
  }
  // window.location.reload();
};

export default supabase;
