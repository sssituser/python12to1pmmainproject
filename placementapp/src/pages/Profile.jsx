import React from "react";

function Profile() {

const profile = {
name: "Karthik",
studentId: "SSIT001",
email: "[karthik@gmail.com]",
age: 22,
state: "Andhra Pradesh",
phone: "+91 9876543210",


course: "B.Tech",
branch: "Computer Science",
college: "SSSIT Institute of Technology",
year: "Final Year",
cgpa: "8.7",
tenth: "92%",
twelfth: "88%",

skills: ["Java", "React", "Spring Boot", "SQL", "DSA"],

projects: [
  {
    title: "Placement Portal",
    description: "A web application to manage student placements, exams, and job applications."
  },
  {
    title: "Online Coding Platform",
    description: "Platform where students can practice coding challenges and participate in contests."
  }
]


};

return (
  <div className="main-content">
  <div className="profile-container">
    <div className="profile-card">
      {/* Profile Top */}
      <div className="profile-top">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="profile"
          className="profile-image"
        />
        <div>
          <h2>{profile.name}</h2>
          <p>Student ID: {profile.studentId}</p>
        </div>
        {/* Buttons */}
        <div style={{marginLeft:"auto",display:"flex",gap:"10px"}}>
          <button className="btn btn-primary btn-sm">
            <i className="bi bi-pencil"></i> Edit
          </button>
          <button className="btn btn-success btn-sm">
            <i className="bi bi-upload"></i> Resume
          </button>
        </div>
      </div>
      {/* Personal Info */}
      <h3>Personal Information</h3>
      <div className="profile-info">
        <div className="info-row">
          <span>Email</span>
          <span>{profile.email}</span>
        </div>
        <div className="info-row">
          <span>Age</span>
          <span>{profile.age}</span>
        </div>
        <div className="info-row">
          <span>State</span>
          <span>{profile.state}</span>
        </div>
        <div className="info-row">
          <span>Phone</span>
          <span>{profile.phone}</span>
        </div>
      </div>
      {/* Academic Info */}
      <h3 style={{marginTop:"20px"}}>Academic Information</h3>
      <div className="profile-info">
        <div className="info-row">
          <span>Course</span>
          <span>{profile.course}</span>
        </div>
        <div className="info-row">
          <span>Branch</span>
          <span>{profile.branch}</span>
        </div>
        <div className="info-row">
          <span>College</span>
          <span>{profile.college}</span>
        </div>
        <div className="info-row">
          <span>Year</span>
          <span>{profile.year}</span>
        </div>
        <div className="info-row">
          <span>CGPA</span>
          <span>{profile.cgpa}</span>
        </div>
        <div className="info-row">
          <span>10th Percentage</span>
          <span>{profile.tenth}</span>
        </div>
        <div className="info-row">
          <span>12th Percentage</span>
          <span>{profile.twelfth}</span>
        </div>
      </div>
      {/* Skills */}
      <h3 style={{marginTop:"25px"}}>Skills</h3>
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px",marginTop:"10px"}}>
        {profile.skills.map((skill,index)=>(
          <span key={index} className="badge bg-primary">
            {skill}
          </span>
        ))}
      </div>
      {/* Projects */}
      <h3 style={{marginTop:"25px"}}>Projects</h3>
      <div style={{marginTop:"10px"}}>
        {profile.projects.map((project,index)=>(
          <div key={index} style={{
            padding:"12px",
            border:"1px solid #eee",
            borderRadius:"8px",
            marginBottom:"10px"
          }}>
            <strong>{project.title}</strong>
            <p style={{margin:0,fontSize:"14px",color:"#555"}}>
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
);
}


export default Profile;
