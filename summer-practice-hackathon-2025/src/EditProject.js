import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

const EditProject = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data();
          // Verificăm dacă utilizatorul este proprietarul proiectului
          if (projectData.userId !== user.uid) {
            setError("Nu aveți permisiunea de a edita acest proiect.");
            return;
          }
          setTitle(projectData.title || "");
          setDescription(projectData.description || "");
          setFileContent(projectData.fileContent || "");
        } else {
          setError("Proiectul nu a fost găsit.");
        }
      } catch (error) {
        console.error("Eroare la încărcarea proiectului:", error);
        setError("A apărut o eroare la încărcarea proiectului.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim() || !description.trim()) {
      setError("Titlul și descrierea sunt obligatorii.");
      return;
    }

    try {
      setLoading(true);
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, {
        title: title.trim(),
        description: description.trim(),
        fileContent: fileContent.trim(),
        updatedAt: new Date()
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Eroare la actualizarea proiectului:", error);
      setError("A apărut o eroare la actualizarea proiectului.");
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Editează Proiect</h2>

              {success && (
                <div className="alert alert-success" role="alert">
                  Proiectul a fost actualizat cu succes! Veți fi redirecționat...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Titlu Proiect *</label>
                  <input
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Descriere *</label>
                  <textarea
                    id="description"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="fileContent" className="form-label">Conținut Fișier</label>
                  <textarea
                    id="fileContent"
                    className="form-control"
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    rows="8"
                    disabled={loading}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Se salvează...
                      </>
                    ) : (
                      "Salvează Modificările"
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(`/project/${id}`)}
                    disabled={loading}
                  >
                    Anulează
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProject; 