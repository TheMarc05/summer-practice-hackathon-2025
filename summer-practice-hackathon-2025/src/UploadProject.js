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

  const handleUpload = async () => {
    if (!title || !description) {
      alert("Completeaza toate campurile obligatorii!");
      return;
    }

    let fileContent = "";
    let fileName = "";

    const saveToFirestore = async () => {
      const docRef = await addDoc(collection(db, "projects"), {
        title,
        description,
        userId: user.uid,
        createdAt: serverTimestamp(),
        approved: false,
        fileName,
        fileContent,
      });

      setProjectId(docRef.id);
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        fileContent = e.target.result;
        fileName = file.name;
        await saveToFirestore();
      };
      reader.readAsText(file);
    } else if (manualContent.trim() !== "") {
      fileContent = manualContent;
      fileName = "manual_input.txt";
      await saveToFirestore();
    } else {
      alert("Adauga un fisier sau scrie manual continutul!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Upload Project</h2>
      <input
        className="form-control my-2"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="form-control my-2"
        placeholder="Project Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label className="form-label mt-3">Alege un fișier:</label>
      <input
        type="file"
        accept=".js,.txt,.html,.css,.py,.java,.c,.cpp"
        className="form-control"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="form-text text-muted mt-2 mb-1">
        <strong>SAU</strong> scrie manual conținutul fișierului:
      </div>
      <textarea
        className="form-control"
        rows={8}
        placeholder="Continut fisier"
        value={manualContent}
        onChange={(e) => setManualContent(e.target.value)}
      />

      <button className="btn btn-primary mt-3" onClick={handleUpload}>
        Upload
      </button>

      {projectId && (
        <>
          <hr />
          <CommentSection projectId={projectId} user={user} />
          <ApproveButton projectId={projectId} user={user} />
        </>
      )}
    </div>
  );
};

export default UploadProject;
