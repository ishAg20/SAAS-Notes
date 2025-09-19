"use client";
import { useState, useEffect } from "react";
import { Note, User, Tenant } from "@/types";

export default function NotesManager({
  user,
  tenant,
}: {
  user: User;
  tenant: Tenant;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });

  const fetchNotes = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) setNotes(data.data);
    else setError(data.error || "Failed to fetch notes");
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async (e: any) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim())
      return setError("Title and content required");
    const token = localStorage.getItem("token");
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newNote),
    });
    const data = await response.json();
    if (data.success) {
      setNotes([data.data, ...notes]);
      setShowCreateForm(false);
      setNewNote({ title: "", content: "" });
      setError("");
    } else setError(data.error || "Failed to create note");
  };

  const updateNote = async (note: Note) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: note.title, content: note.content }),
    });
    const data = await response.json();
    if (data.success) {
      setNotes(notes.map((n) => (n.id === note.id ? data.data : n)));
      setEditingNote(null);
    } else setError(data.error || "Failed to update note");
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) setNotes(notes.filter((n) => n.id !== id));
    else setError(data.error || "Failed to delete note");
  };

  const canCreateNote = tenant.subscription === "PRO" || notes.length < 3;

  if (loading) return <div className="text-blue-700">Loading...</div>;

  return (
    <div className="text-blue-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notes</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!canCreateNote}
          className={`px-4 py-2 rounded ${
            canCreateNote
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Create Note
        </button>
      </div>

      {tenant.subscription === "FREE" && (
        <div className="text-sm text-blue-800 mb-2">
          <strong>Free Plan:</strong> {notes.length}/3 notes.{" "}
          {!canCreateNote && (
            <span className="text-red-600">
              Upgrade to Pro for unlimited notes.
            </span>
          )}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={createNote} className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-blue-800"
          />
          <textarea
            placeholder="Content"
            value={newNote.content}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-blue-800"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-blue-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        {notes.map((note) => (
          <div
            key={note.id}
            className="border border-gray-300 p-4 rounded mb-2 bg-white"
          >
            {editingNote?.id === note.id ? (
              <>
                <input
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                  className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-blue-800"
                />
                <textarea
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                  className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-blue-800"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateNote(editingNote)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="text-blue-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-blue-900">
                  {note.title}
                </h3>
                <p className="text-blue-800 mb-2">{note.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-gray-600 mt-4">
          No notes yet. Create your first note!
        </div>
      )}

      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
