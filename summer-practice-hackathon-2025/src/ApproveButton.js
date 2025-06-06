import React, { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

function ApproveButton({ projectId, user, onApproved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user && user.uid === "CCksLUT4sbMB29C9vLmufH7osX23";

  const handleApprove = async () => {
    if (!isAdmin) {
      setError("Nu aveti permisiunea de a aproba proiecte.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        approved: true,
        approvedAt: serverTimestamp(),
        approvedBy: user.uid
      });
      if (onApproved) onApproved();
    } catch (err) {
      console.error("Eroare la aprobarea proiectului:", err);
      setError("Nu s-a putut aproba proiectul. Va rugam sa incercati din nou.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <button
      className="btn btn-success"
      onClick={handleApprove}
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Se aprobă...
        </>
      ) : (
        "Aproba"
      )}
    </button>
  );
}

export default ApproveButton;
