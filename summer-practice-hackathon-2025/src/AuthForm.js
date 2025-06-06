import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkIfFirstUser = async () => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    return usersSnapshot.empty;
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("Toate câmpurile sunt obligatorii");
      return false;
    }
    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere");
      return false;
    }
    if (!email.includes("@")) {
      setError("Adresa de email nu este validă");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const isFirstUser = await checkIfFirstUser();
        
        // creez documentul utilizatorului in Firestore Database
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: isFirstUser ? "admin" : "user",
          createdAt: new Date(),
          isFirstUser: isFirstUser
        });

        if (isFirstUser) {
          alert("Felicitari! Sunteti primul utilizator si ati fost setat ca administrator.");
        }
      }
    } catch (err) {
      let errorMessage = "A aparut o eroare. Va rugam sa incercati din nou.";
      
      switch (err.code) {
        case "auth/user-not-found":
          errorMessage = "Nu exista un cont cu aceasta adresa de email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Parola introdusa este incorecta.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "Aceasta adresa de email este deja inregistrata.";
          break;
        case "auth/weak-password":
          errorMessage = "Parola este prea slaba. Va rugam sa folositi o parola mai puternica.";
          break;
        case "auth/invalid-email":
          errorMessage = "Adresa de email nu este valida.";
          break;
        default:
          console.error("Eroare de autentificare:", err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <form
        onSubmit={handleSubmit}
        className="card p-4 shadow-sm mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4">
          {isLogin ? "Autentificare" : "Înregistrare"}
        </h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="Introduceți adresa de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Parolă</label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="Introduceți parola"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button 
          className="btn btn-primary w-100 mb-3" 
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Se procesează...
            </>
          ) : (
            isLogin ? "Autentificare" : "Inregistrare"
          )}
        </button>

        <p className="text-center mb-0">
          {isLogin ? "Nu aveti cont?" : "Avti deja cont?"}{" "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Inregistrati-vs" : "Autentificati-va"}
          </button>
        </p>
      </form>
    </div>
  );
}
