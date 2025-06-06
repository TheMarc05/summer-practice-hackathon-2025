import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ApproveButton = ({ projectId, user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [approved, setApproved] = useState(false);

  const adminUID = "KZd1JibJnEf0wHSqrPz8BrlLYX43";

  useEffect(() => {
    if (user.uid === adminUID) {
      setIsAdmin(true);
    }

    const checkApproval = async () => {
      const docRef = doc(db, "projects", projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApproved(docSnap.data().approved);
      }
    };

    checkApproval();
  }, [projectId, user]);

  const handleApprove = async () => {
    await updateDoc(doc(db, "projects", projectId), {
      approved: true,
    });
    setApproved(true);
  };

  if (!isAdmin) return null;

  return (
    <div className="mt-3">
      {approved ? (
        <span className="badge bg-success">Approved</span>
      ) : (
        <button className="btn btn-success" onClick={handleApprove}>
          Approve Project
        </button>
      )}
    </div>
  );
};

export default ApproveButton;
