import React, { useEffect, useState } from "react";
import AuthForm from "./AuthForm";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) return <AuthForm />;

  return (
    <div>
      <h1>Bine ai venit, {user.email}</h1>
      <button onClick={() => signOut(auth)}>Logout</button>
      {/* aici vom adauga cod, auto-review etc. */}
    </div>
  );
}

export default App;
