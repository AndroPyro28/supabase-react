import { useEffect, useState } from "react";
import "./App.css";
import { Auth } from "./components/auth";
import TaskManager from "./components/task-manager";
import { supabase } from "./utils/supabase";
import { type Session } from "@supabase/supabase-js";
import { getSession, signOut } from "./utils/supabase";

function App() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const session = await getSession();
    setSession(session.data.session);
  };

  useEffect(() => {
    fetchSession();

    const {data: authListener} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => authListener.subscription.unsubscribe()
  }, []);

  return (
    <div>
      {(() => {
        if (session && session?.access_token && session?.user?.id) {
          return (
            <>
              <button onClick={signOut}>Sign out</button>
              <TaskManager session={session} />
            </>
          );
        }

        return <Auth />
      })()}
    </div>
  );
}

export default App;
