import React, { useEffect, useState } from "react";
import AuthForm from "./AuthForm";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import UploadProject from "./UploadProject";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) return <AuthForm />;

  return (
    <div>
      <button onClick={() => signOut(auth)}>Logout</button>
      <UploadProject user={user} />
    </div>
  );
}

export default App;
