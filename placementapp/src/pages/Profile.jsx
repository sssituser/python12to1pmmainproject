import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

function Profile() {

const navigate = useNavigate();

const [profile, setProfile] = useState({
username: "",
student_id: "",
age: "",
state: "",
phone: "",
course: "",
branch: "",
college: "",
year: "",
cgpa: "",
tenth_percentage: "",
twelfth_percentage: "",
skills: [],
projects: []
});

const [resume, setResume] = useState(null);

useEffect(() => {


axios.get("http://127.0.0.1:8000/api/profile/",{withCredentials:true})
  .then(res => {
    setProfile(res.data);
  })
  .catch(() => {
    toast.error("Failed to load profile");
  });


}, []);

const handleResumeUpload = () => {


if (!resume) {
  toast.error("Please select a file first");
  return;
}

const formData = new FormData();
formData.append("resume", resume);

axios.post("http://127.0.0.1:8000/api/upload-resume/", formData)
  .then(() => {
    toast.success("Resume uploaded successfully");
  })
  .catch(() => {
    toast.error("Upload failed");
  });


};

return ( <div className="bg-gray-100 min-h-screen p-6">


  <ToastContainer />

  <div className="max-w-4xl mx-auto space-y-6">

    {/* Profile Card */}

    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">

      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        className="w-20 h-20 rounded-full"
        alt="profile"
      />

      <div>
        <h2 className="text-xl font-semibold">
          {profile.username}
        </h2>

        <p className="text-gray-500">
          Student ID: {profile.student_id}
        </p>

        <p className="text-sm text-gray-500">
          {profile.course} - {profile.branch}
        </p>

        <p className="text-sm text-gray-500">
          {profile.college}
        </p>
      </div>

      {/* Buttons */}

      <div className="ml-auto flex gap-2">

        <button
          onClick={() => navigate("/dashboard/profile/edit")}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Edit
        </button>

        <label className="bg-green-500 text-white px-4 py-1 rounded cursor-pointer">
          Upload Resume
          <input
            type="file"
            className="hidden"
            onChange={(e) => setResume(e.target.files[0])}
          />
        </label>

        <button
          onClick={handleResumeUpload}
          className="bg-gray-700 text-white px-3 py-1 rounded"
        >
          Save
        </button>

      </div>

    </div>


    {/* Personal Info */}

    <div className="bg-white rounded-lg shadow p-6">

      <h3 className="text-lg font-semibold mb-3">
        Personal Information
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>State:</strong> {profile.state}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>

      </div>

    </div>


    {/* Academic Info */}

    <div className="bg-white rounded-lg shadow p-6">

      <h3 className="text-lg font-semibold mb-3">
        Academic Information
      </h3>

      <div className="grid grid-cols-2 gap-3 text-sm">

        <p><strong>Year:</strong> {profile.year}</p>
        <p><strong>CGPA:</strong> {profile.cgpa}</p>
        <p><strong>10th %:</strong> {profile.tenth_percentage}</p>
        <p><strong>12th %:</strong> {profile.twelfth_percentage}</p>

      </div>

    </div>


    {/* Skills */}

    <div className="bg-white rounded-lg shadow p-6">

      <h3 className="text-lg font-semibold mb-3">
        Skills
      </h3>

      <div className="flex flex-wrap gap-2">

        {profile.skills.map((skill, index) => (

          <span
            key={index}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
          >
            {skill.name}
          </span>

        ))}

      </div>

    </div>


    {/* Projects */}

    <div className="bg-white rounded-lg shadow p-6">

      <h3 className="text-lg font-semibold mb-3">
        Projects
      </h3>

      {profile.projects.map((project, index) => (

        <div key={index} className="border rounded p-3 mb-3">

          <p className="font-medium">
            {project.title}
          </p>

          <p className="text-sm text-gray-600">
            {project.description}
          </p>

        </div>

      ))}

    </div>

  </div>

</div>


);
}

export default Profile;
