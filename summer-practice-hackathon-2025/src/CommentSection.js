import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  doc,
  getDoc
} from "firebase/firestore";

const CommentSection = ({ projectId, user }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [projectAuthor, setProjectAuthor] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    // Obtine autorul proiectului
    const fetchProjectAuthor = async () => {
      try {
        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          setProjectAuthor(data.userId);
        }
      } catch (error) {
        console.error("Error fetching project author:", error);
      }
    };
    fetchProjectAuthor();

    // Query pentru comentarii
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("projectId", "==", projectId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentList);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user || !projectId) return;

    setLoading(true);
    try {
      const commentsRef = collection(db, "comments");
      const newComment = {
        projectId,
        text: comment.trim(),
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp()
      };

      const tempComment = {
        id: 'temp-' + Date.now(),
        ...newComment,
        createdAt: new Date()
      };
      setComments(prevComments => [...prevComments, tempComment]);
      setComment("");

      // Salvare in firestore
      await addDoc(commentsRef, newComment);
    } catch (error) {
      console.error("Error adding comment:", error);
      setComments(prevComments => prevComments.filter(c => !c.id.startsWith('temp-')));
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user && user.uid === "CCksLUT4sbMB29C9vLmufH7osX23";
  const isProjectAuthor = user && user.uid === projectAuthor;

  return (
    <div className="mt-4">
      <h4>Comentarii</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control"
          placeholder="Adauga un comentariu..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit" 
          className="btn btn-secondary mt-2"
          disabled={loading || !comment.trim()}
        >
          {loading ? "Se trimite..." : "Trimite Comentariu"}
        </button>
      </form>

      <ul className="list-group mt-3">
        {comments.length === 0 ? (
          <li className="list-group-item text-center text-muted">
            Nu exista comentarii.
          </li>
        ) : (
          comments.map((c) => {
            const isCommentByAdmin = c.userId === "CCksLUT4sbMB29C9vLmufH7osX23";
            const isCommentByAuthor = c.userId === projectAuthor;
            
            return (
              <li 
                className={`list-group-item ${isCommentByAdmin ? 'bg-light' : ''} ${c.id.startsWith('temp-') ? 'opacity-75' : ''}`} 
                key={c.id}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <strong>{c.userEmail}</strong>
                      {isCommentByAdmin && (
                        <span className="badge bg-primary">Administrator</span>
                      )}
                      {isCommentByAuthor && !isCommentByAdmin && (
                        <span className="badge bg-success">Autor Proiect</span>
                      )}
                    </div>
                    <p className="mb-0 mt-1">{c.text}</p>
                  </div>
                  <small className="text-muted">
                    {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : new Date(c.createdAt).toLocaleString()}
                  </small>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default CommentSection;
