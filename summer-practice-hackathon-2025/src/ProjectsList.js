import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";
import ApproveButton from "./ApproveButton";

function ProjectsList({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verifică dacă utilizatorul curent este administrator
    console.log("Current user:", user); // Debug log
    if (user && user.uid === "CCksLUT4sbMB29C9vLmufH7osX23") {
      console.log("User is admin"); // Debug log
      setIsAdmin(true);
    } else {
      console.log("User is not admin"); // Debug log
      setIsAdmin(false);
    }
  }, [user]);

  // Funcție pentru refresh proiecte
  const refreshProjects = async () => {
    try {
      setLoading(true);
      let constraints = [];
      if (filter === "approved") {
        constraints.push(where("approved", "==", true));
      } else if (filter === "pending") {
        constraints.push(where("approved", "==", false));
      }
      // FĂRĂ orderBy("createdAt", "desc") pentru test index
      const projectsQuery = query(collection(db, "projects"), ...constraints);
      const querySnapshot = await getDocs(projectsQuery);
      const projectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsList);
      setError(null);
    } catch (err) {
      setError("Nu s-au putut încărca proiectele. Vă rugăm să încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
    setSearchTerm(""); // Resetare search la schimbarea filtrului
    // eslint-disable-next-line
  }, [filter]);

  // Filtrare robustă pentru proiecte și acces
  const filteredProjects = isAdmin
    ? projects
    : projects.filter(project => project.userId === user.uid);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Se încarcă...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="mb-3">
        <strong>Status:</strong> {isAdmin ? 'Administrator' : 'User'}
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Caută proiecte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Toate proiectele</option>
            <option value="approved">Aprobate</option>
            <option value="pending">În așteptare</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="alert alert-info">
          Nu s-au găsit proiecte.
        </div>
      ) : (
        <div className="row">
          {filteredProjects.map((project) => (
            <div key={project.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{project.title}</h5>
                  <p className="card-text">{project.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/project/${project.id}`} className="btn btn-primary">
                      Vezi detalii
                    </Link>
                    {isAdmin && !project.approved && (
                      <ApproveButton projectId={project.id} user={user} onApproved={refreshProjects} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsList;

