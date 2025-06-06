import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import CommentSection from "./CommentSection";
import ApproveButton from "./ApproveButton";

const UploadProject = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState(null);

  const handleUpload = async () => {
    if (!title || !description || !content) {
      return alert("Completeaza toate campurile!");
    }

    try {
      const docRef = await addDoc(collection(db, "projects"), {
        title,
        description,
        content,
        userId: user.uid,
        createdAt: serverTimestamp(),
        approved: false,
      });

      setProjectId(docRef.id);
    } catch (error) {
      console.error("Eroare la upload:", error);
      alert("A aparut o eroare la upload.");
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

      <textarea
        className="form-control my-2"
        placeholder="Project Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />

      <button className="btn btn-primary" onClick={handleUpload}>
        Upload
      </button>

      {projectId && (
        <>
          <hr />
          <h4>Comentarii și aprobare:</h4>
          <CommentSection projectId={projectId} user={user} />
          <ApproveButton projectId={projectId} user={user} />
        </>
      )}
    </div>
  );
};

export default UploadProject;
