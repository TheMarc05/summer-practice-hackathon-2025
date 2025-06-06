import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import { Link } from "react-router-dom";
import ApproveButton from "./ApproveButton";

function ProjectsList({ user }) {
  // UseStates proiecte, incarcare, erori, filtru si status admin
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Verifica daca utilizatorul curent este administrator
  useEffect(() => {
    if (user && user.uid === "CCksLUT4sbMB29C9vLmufH7osX23") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Functie pentru a incarca proiectele din Firestore Database, cu filtrare dupa status
  const refreshProjects = async () => {
    try {
      setLoading(true);
      let constraints = [];
      // Filtrare dupa status (aprobate, in asteptare)
      if (filter === "approved") {
        constraints.push(where("approved", "==", true));
      } else if (filter === "pending") {
        constraints.push(where("approved", "==", false));
      }
      // Query catre Firestore Databas
      const projectsQuery = query(collection(db, "projects"), ...constraints);
      const querySnapshot = await getDocs(projectsQuery);
      const projectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsList);
      setError(null);
    } catch (err) {
      setError("Nu s-au putut incarca proiectele. Va rugam sa incercati din nou.");
    } finally {
      setLoading(false);
    }
  };

  // Reincarca proiectele la schimbarea filtrului
  useEffect(() => {
    refreshProjects();
    setSearchTerm(""); // Resetare search la schimbarea filtrului
  }, [filter]);

  // adminul vede toate proiectele, userul doar proiectele proprii
  const filteredProjects = isAdmin
    ? projects
    : projects.filter(project => project.userId === user.uid);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Se oncarca...</span>
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
      {/* Status admin/user */}
      <div className="mb-3">
        <strong>Status:</strong> {isAdmin ? 'Administrator' : 'User'}
      </div>
      {/* Filtru si cautare */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Cauta proiecte..."
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
            <option value="pending">In asteptare</option>
          </select>
        </div>
      </div>

      {/* Afisare proiecte */}
      {filteredProjects.length === 0 ? (
        <div className="alert alert-info">
          Nu s-au gasit proiecte.
        </div>
      ) : (
        <div className="row">
          {filteredProjects
            .filter(project => {
              // Filtrare dupa titlu/descriere
              const title = typeof project.title === 'string' ? project.title : '';
              const description = typeof project.description === 'string' ? project.description : '';
              return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     description.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .map((project) => (
            <div key={project.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  {/* Titlu si descriere proiect */}
                  <h5 className="card-title">{project.title}</h5>
                  <p className="card-text">{project.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    {/* Buton detalii */}
                    <Link to={`/project/${project.id}`} className="btn btn-primary">
                      Vezi detalii
                    </Link>
                    {/* Buton aprobare doar pentru admin si doar daca proiectul nu e aprobat */}
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

