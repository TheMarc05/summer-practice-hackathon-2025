import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import CommentSection from "./CommentSection";
import ApproveButton from "./ApproveButton";

const UploadProject = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [manualContent, setManualContent] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!title.trim()) {
      setError("Titlul proiectului este obligatoriu");
      return false;
    }
    if (!description.trim()) {
      setError("Descrierea proiectului este obligatorie");
      return false;
    }
    if (!file && !manualContent.trim()) {
      setError("Trebuie sa incarcati un fisier sau sa scrieti manual continutul");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    setError("");
    setSuccess(false);
    
    if (!validateForm()) return;

    setLoading(true);
    let fileContent = "";
    let fileName = "";

    try {
      const saveToFirestore = async () => {
        const docRef = await addDoc(collection(db, "projects"), {
          title: title.trim(),
          description: description.trim(),
          userId: user.uid,
          authorEmail: user.email,
          createdAt: serverTimestamp(),
          approved: false,
          fileName,
          fileContent,
        });

        setProjectId(docRef.id);
        setSuccess(true);
        // resetez formularul dupa incarcarea reusita
        setTitle("");
        setDescription("");
        setFile(null);
        setManualContent("");
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          fileContent = e.target.result;
          fileName = file.name;
          await saveToFirestore();
        };
        reader.onerror = () => {
          setError("Eroare la citirea fisierului");
          setLoading(false);
        };
        reader.readAsText(file);
      } else {
        fileContent = manualContent.trim();
        fileName = "manual_input.txt";
        await saveToFirestore();
      }
    } catch (error) {
      console.error("Eroare la incarcarea proiectului:", error);
      setError("A aparut o eroare la incarcarea proiectului. Va rugam sa incercati din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Incarca Proiect</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  Proiectul a fost incarcat cu succes!
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="title" className="form-label">Titlu Proiect *</label>
                <input
                  id="title"
                  className="form-control"
                  placeholder="Introduceti titlul proiectului"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Descriere *</label>
                <textarea
                  id="description"
                  className="form-control"
                  placeholder="Introduceti descrierea proiectului"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Alege un fisier:</label>
                <input
                  type="file"
                  accept=".js,.txt,.html,.css,.py,.java,.c,.cpp"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading}
                />
                <div className="form-text">
                  Formate acceptate: .js, .txt, .html, .css, .py, .java, .c, .cpp
                </div>
              </div>

              <div className="mb-3">
                <div className="form-text text-center mb-2">
                  <strong>SAU</strong> scrie manual continutul fisierului:
                </div>
                <textarea
                  className="form-control"
                  rows={8}
                  placeholder="Introduceti continutul fisierului"
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="d-grid">
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Se încarcă...
                    </>
                  ) : (
                    "Incarca Proiect"
                  )}
                </button>
              </div>
            </div>
          </div>

          {projectId && (
            <div className="card mt-4">
              <div className="card-body">
                <CommentSection projectId={projectId} user={user} />
                <ApproveButton projectId={projectId} user={user} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProject;
