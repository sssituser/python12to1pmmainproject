import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------- Sortable Item ---------- */

const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

function Profile() {
  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [edit, setEdit] = useState(false);

  const token = localStorage.getItem("access");

  /* ---------- FETCH ---------- */

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const data = res.data || {};

        setProfile(data);

        // ✅ ensure every item has id
        setSkills(
          (data.skills || []).map((s, i) => ({
            id: s.id || Date.now() + i,
            name: s.name || "",
            level: s.level || 50
          }))
        );

        setProjects(
          (data.projects || []).map((p, i) => ({
            id: p.id || Date.now() + i,
            title: p.title || "",
            description: p.description || ""
          }))
        );
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        toast.error("Failed to load profile");
      });
  }, []);

  /* ---------- AUTO SAVE ---------- */

  useEffect(() => {
    if (!edit) return;

    const timer = setTimeout(() => {
      saveProfile(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [profile, skills, projects]);

  /* ---------- SAVE ---------- */

  const saveProfile = (showToast = true) => {
    axios
      .put(
        "http://127.0.0.1:8000/api/profile/update/",
        { ...profile, skills, projects },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => showToast && toast.success("Saved"))
      .catch(() => toast.error("Save failed"));
  };

  /* ---------- HANDLERS ---------- */

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (i, field, value) => {
    const updated = [...skills];
    updated[i][field] = value;
    setSkills(updated);
  };

  const handleProjectChange = (i, field, value) => {
    const updated = [...projects];
    updated[i][field] = value;
    setProjects(updated);
  };

  /* ---------- ADD / DELETE ---------- */

  const addSkill = () =>
    setSkills([...skills, { id: Date.now(), name: "", level: 50 }]);

  const deleteSkill = (i) =>
    setSkills(skills.filter((_, idx) => idx !== i));

  const addProject = () =>
    setProjects([
      ...projects,
      { id: Date.now(), title: "", description: "" }
    ]);

  const deleteProject = (i) =>
    setProjects(projects.filter((_, idx) => idx !== i));

  /* ---------- DRAG ---------- */

  const handleSkillDrag = (e) => {
    const { active, over } = e;
    if (!over) return;

    const oldIndex = skills.findIndex((s) => s.id === active.id);
    const newIndex = skills.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    setSkills(arrayMove(skills, oldIndex, newIndex));
  };

  const handleProjectDrag = (e) => {
    const { active, over } = e;
    if (!over) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    setProjects(arrayMove(projects, oldIndex, newIndex));
  };

  /* ---------- UI ---------- */

  return (
    <div className="container mt-4">
      <Toaster />

      <div className="card p-4 shadow-sm rounded-4">

        {/* HEADER */}
        <div className="d-flex align-items-center mb-4 gap-3">
          <img
            src={profile.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            className="rounded-circle"
            width={70}
          />

          <input
            name="name"
            value={profile.name || ""}
            onChange={handleChange}
            disabled={!edit}
            className="form-control fw-bold"
            placeholder="Your Name"
          />

          <button
            className="btn btn-primary ms-auto"
            onClick={() => setEdit(!edit)}
          >
            {edit ? "Stop" : "Edit"}
          </button>
        </div>

        {/* BASIC INFO */}
        <div className="row g-3">
          {["phone", "state", "cgpa"].map((field) => (
            <div className="col-md-4" key={field}>
              <input
                name={field}
                value={profile[field] || ""}
                onChange={handleChange}
                disabled={!edit}
                className="form-control"
                placeholder={field}
              />
            </div>
          ))}
        </div>

        {/* SKILLS */}
        <h5 className="mt-4">Skills</h5>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleSkillDrag}>
          <SortableContext items={skills.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {skills.map((s, i) => (
              <SortableItem key={s.id} id={s.id}>
                <div className="border rounded p-3 mt-2 bg-light">

                  <input
                    className="form-control mb-2"
                    value={s.name}
                    onChange={(e) => handleSkillChange(i, "name", e.target.value)}
                    disabled={!edit}
                  />

                  <input
                    type="range"
                    className="form-range"
                    value={s.level}
                    onChange={(e) => handleSkillChange(i, "level", e.target.value)}
                    disabled={!edit}
                  />

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteSkill(i)}
                  >
                    Delete
                  </button>

                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {edit && (
          <button className="btn btn-outline-primary mt-2" onClick={addSkill}>
            + Add Skill
          </button>
        )}

        {/* PROJECTS */}
        <h5 className="mt-4">Projects</h5>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleProjectDrag}>
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {projects.map((p, i) => (
              <SortableItem key={p.id} id={p.id}>
                <div className="border rounded p-3 mt-2 bg-light">

                  <input
                    className="form-control mb-2"
                    value={p.title}
                    onChange={(e) => handleProjectChange(i, "title", e.target.value)}
                    disabled={!edit}
                  />

                  <textarea
                    className="form-control mb-2"
                    value={p.description}
                    onChange={(e) => handleProjectChange(i, "description", e.target.value)}
                    disabled={!edit}
                  />

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteProject(i)}
                  >
                    Delete
                  </button>

                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

        {edit && (
          <button className="btn btn-outline-primary mt-2" onClick={addProject}>
            + Add Project
          </button>
        )}

      </div>
    </div>
  );
}

export default Profile;