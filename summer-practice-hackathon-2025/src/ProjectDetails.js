import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link, useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import ApproveButton from "./ApproveButton";

const ProjectDetails = ({ user }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Eroare la verificarea rolului de admin:", error);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() };
          setProject(projectData);
          setIsOwner(user && projectData.userId === user.uid);
        }
      } catch (error) {
        console.error("Eroare la incasrcarea proiectului:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Se încarcă...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Proiectul nu a fost găsit sau nu aveți permisiunea de a-l vizualiza.
        </div>
        <Link to="/" className="btn btn-primary mt-3">
          Înapoi la Lista Proiectelor
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/projects" className="btn btn-outline-primary">
          ← Înapoi la Lista Proiectelor
        </Link>
        {isOwner && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/project/${id}/edit`)}
          >
            Editează Proiect
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <h2 className="card-title">{project.title}</h2>
            {project.approved && (
              <span className="badge bg-success">Aprobat</span>
            )}
          </div>

          <p className="card-text mt-3">{project.description}</p>

          <div className="mt-4">
            <h4>Conținut Proiect</h4>
            {project.fileContent && (
              <div className="bg-light p-3 rounded mb-3">
                <strong>fileContent:</strong>
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{project.fileContent}</pre>
              </div>
            )}
            {project.code && (
              <div className="bg-light p-3 rounded mb-3">
                <strong>code:</strong>
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{project.code}</pre>
              </div>
            )}
            {project.content && (
              <div className="bg-light p-3 rounded mb-3">
                <strong>content:</strong>
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{project.content}</pre>
              </div>
            )}
            {!project.fileContent && !project.code && !project.content && (
              <div className="alert alert-info mb-0">Nu exista continut pentru acest proiect.</div>
            )}
          </div>

          <div className="mt-4">
            <h4>Detalii proiect</h4>
            <table className="table table-bordered table-sm">
              <tbody>
                {Object.entries(project)
                  .filter(([key]) => key !== 'userId' && key !== 'id')
                  .map(([key, value]) => (
                    <tr key={key}>
                      <th style={{width: 150}}>{key}</th>
                      <td>
                        {key === 'approvedBy' ? 'Administrator' :
                          (typeof value === 'object' && value !== null && value.seconds
                            ? new Date(value.seconds * 1000).toLocaleString()
                            : typeof value === 'object' && value !== null
                            ? JSON.stringify(value, null, 2)
                            : value?.toString() || '')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Creat la:</strong> {project.createdAt?.toDate().toLocaleString()}
                </p>
                <p className="mb-1">
                  <strong>Autor:</strong> {project.authorEmail || "Necunoscut"}
                </p>
              </div>
              {project.approved && (
                <div className="col-md-6">
                  <p className="mb-1">
                    <strong>Aprobat la:</strong> {project.approvedAt?.toDate().toLocaleString()}
                  </p>
                  <p className="mb-1">
                    <strong>Aprobat de:</strong> Administrator
                  </p>
                </div>
              )}
            </div>
          </div>

          {isAdmin && !project.approved && (
            <div className="mt-4">
              <ApproveButton projectId={id} user={user} onApproved={() => window.location.reload()} />
            </div>
          )}

          <div className="mt-4">
            <CommentSection projectId={id} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
