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

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

function Profile() {
  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [edit, setEdit] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("access");

  /* ---------- FETCH ---------- */

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const data = res.data || {};

        setProfile(data);

        setSkills(
          (data.skills || []).map((s, i) => ({
            id: s.id ? String(s.id) : `skill-${i}-${Date.now()}`,
            backendId: s.id || null,
            name: s.name || "",
            level: Number(s.level) || 50
          }))
        );

        setProjects(
          (data.projects || []).map((p, i) => ({
            id: p.id ? String(p.id) : `proj-${i}-${Date.now()}`,
            backendId: p.id || null,
            title: p.title || "",
            description: p.description || ""
          }))
        );
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  /* ---------- SAVE ---------- */

  const saveProfile = () => {
    setSaving(true);

    const payload = {
      name: profile.name || "",
      phone: profile.phone || "",
      state: profile.state || "",
      cgpa: Number(profile.cgpa) || 0,
      github: profile.github || "",
      linkedin: profile.linkedin || "",

      skills: skills.map((s) => ({
        id: s.backendId,
        name: s.name || "",
        level: Number(s.level) || 0
      })),

      projects: projects.map((p) => ({
        id: p.backendId,
        title: p.title || "",
        description: p.description || ""
      }))
    };

    axios
      .put("http://127.0.0.1:8000/api/profile/update/", payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => toast.success("Saved"))
      .catch(() => toast.error("Error saving"))
      .finally(() => setSaving(false));
  };

  /* ---------- AUTO SAVE ---------- */

  useEffect(() => {
    if (!edit) return;

    const t = setTimeout(saveProfile, 1200);
    return () => clearTimeout(t);
  }, [profile, skills, projects, edit]);

  /* ---------- HANDLERS ---------- */

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const updateSkill = (i, field, value) => {
    setSkills((prev) => {
      const arr = [...prev];
      arr[i][field] = value;
      return arr;
    });
  };

  const updateProject = (i, field, value) => {
    setProjects((prev) => {
      const arr = [...prev];
      arr[i][field] = value;
      return arr;
    });
  };

  /* ---------- ADD ---------- */

  const addSkill = () =>
    setSkills((prev) => [
      ...prev,
      {
        id: `skill-${Date.now()}-${Math.random()}`,
        backendId: null,
        name: "",
        level: 50
      }
    ]);

  const addProject = () =>
    setProjects((prev) => [
      ...prev,
      {
        id: `proj-${Date.now()}-${Math.random()}`,
        backendId: null,
        title: "",
        description: ""
      }
    ]);

  /* ---------- DELETE ---------- */

  const deleteSkill = (id) => {
    setSkills((prev) =>
      prev.filter((s) => String(s.id) !== String(id))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) =>
      prev.filter((p) => String(p.id) !== String(id))
    );
  };

  /* ---------- DRAG ---------- */

  const onSkillDrag = (e) => {
    const { active, over } = e;
    if (!over) return;

    const oldIndex = skills.findIndex((s) => String(s.id) === String(active.id));
    const newIndex = skills.findIndex((s) => String(s.id) === String(over.id));

    setSkills(arrayMove(skills, oldIndex, newIndex));
  };

  const onProjectDrag = (e) => {
    const { active, over } = e;
    if (!over) return;

    const oldIndex = projects.findIndex((p) => String(p.id) === String(active.id));
    const newIndex = projects.findIndex((p) => String(p.id) === String(over.id));

    setProjects(arrayMove(projects, oldIndex, newIndex));
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <Toaster />

      <div className="card p-4 shadow rounded-4">

        {/* HEADER */}
        <div className="d-flex align-items-center gap-3 mb-3">
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

        {edit && (
          <small className="text-muted">
            {saving ? "Saving..." : "Auto saved"}
          </small>
        )}

        {/* BASIC */}
        <div className="row mt-3">
          {["phone", "state", "cgpa"].map((f) => (
            <div className="col-md-4" key={f}>
              <input
                name={f}
                value={profile[f] || ""}
                onChange={handleChange}
                disabled={!edit}
                className="form-control mb-2"
                placeholder={f}
              />
            </div>
          ))}
        </div>

        {/* SOCIAL */}
        <h5 className="mt-3">Social Links</h5>
        <div className="row">
          <div className="col-md-6">
            <input
              name="github"
              value={profile.github || ""}
              onChange={handleChange}
              disabled={!edit}
              className="form-control mb-2"
              placeholder="GitHub URL"
            />
          </div>
          <div className="col-md-6">
            <input
              name="linkedin"
              value={profile.linkedin || ""}
              onChange={handleChange}
              disabled={!edit}
              className="form-control mb-2"
              placeholder="LinkedIn URL"
            />
          </div>
        </div>

        {/* SKILLS */}
        <h5 className="mt-4">Skills</h5>

        <DndContext collisionDetection={closestCenter} onDragEnd={onSkillDrag}>
          <SortableContext
            items={skills.map((s) => String(s.id))}
            strategy={verticalListSortingStrategy}
          >
            {skills.map((s, i) => (
              <SortableItem key={String(s.id)} id={String(s.id)}>
                <div className="p-3 border rounded mt-2 bg-light">

                  <input
                    className="form-control mb-2"
                    value={s.name ?? ""}
                    onChange={(e) =>
                      updateSkill(i, "name", e.target.value)
                    }
                    disabled={!edit}
                    placeholder="Skill name"
                  />

                  <input
                    type="range"
                    className="form-range"
                    value={Number(s.level) || 50}
                    onChange={(e) =>
                      updateSkill(i, "level", e.target.value)
                    }
                    disabled={!edit}
                  />

                  <small>Level: {s.level}%</small>

                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => deleteSkill(s.id)}
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

        <DndContext collisionDetection={closestCenter} onDragEnd={onProjectDrag}>
          <SortableContext
            items={projects.map((p) => String(p.id))}
            strategy={verticalListSortingStrategy}
          >
            {projects.map((p, i) => (
              <SortableItem key={String(p.id)} id={String(p.id)}>
                <div className="p-3 border rounded mt-2 bg-light">

                  <input
                    className="form-control mb-2"
                    value={p.title ?? ""}
                    onChange={(e) =>
                      updateProject(i, "title", e.target.value)
                    }
                    disabled={!edit}
                  />

                  <textarea
                    className="form-control mb-2"
                    value={p.description ?? ""}
                    onChange={(e) =>
                      updateProject(i, "description", e.target.value)
                    }
                    disabled={!edit}
                  />

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteProject(p.id)}
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