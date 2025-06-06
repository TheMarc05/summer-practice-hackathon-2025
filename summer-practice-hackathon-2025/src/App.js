import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import AuthForm from "./AuthForm";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import UploadProject from "./UploadProject";
import ProjectsList from "./ProjectsList";
import ProjectDetails from "./ProjectDetails";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("User state changed:", user); // Debug log
      setUser(user);
      setLoading(false);
      
      if (user && location.pathname === "/") {
        navigate("/projects");
      }
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Eroare la deconectare:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Se incarca...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/projects">GitGud Projects</Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/projects">Lista Proiectelor</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/upload">Incarca Proiect</Link>
              </li>
            </ul>
            <div className="d-flex align-items-center">
              <span className="me-3">Bun venit, {user.email}</span>
              <button 
                className="btn btn-outline-danger" 
                onClick={handleSignOut}
              >
                Deconectare
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/upload" element={<UploadProject user={user} />} />
        <Route path="/projects" element={<ProjectsList user={user} />} />
        <Route path="/project/:id" element={<ProjectDetails user={user} />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </div>
  );
}

export default App;
