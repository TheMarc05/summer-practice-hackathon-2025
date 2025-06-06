import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const CommentSection = ({ projectId, user }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("projectId", "==", projectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentList);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    await addDoc(collection(db, "comments"), {
      projectId,
      text: comment,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
    });

    setComment("");
  };

  return (
    <div className="mt-4">
      <h4>Comments</h4>
      <textarea
        className="form-control"
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="btn btn-secondary mt-2" onClick={handleSubmit}>
        Submit Comment
      </button>

      <ul className="list-group mt-3">
        {comments.map((c) => (
          <li className="list-group-item" key={c.id}>
            <strong>{c.userEmail}:</strong> {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;
