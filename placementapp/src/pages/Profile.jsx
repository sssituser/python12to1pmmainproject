import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {

const [profile,setProfile] = useState({})
const [skills,setSkills] = useState([])
const [projects,setProjects] = useState([])
const [edit,setEdit] = useState(false)

const token = localStorage.getItem("access")

/* ---------------- FETCH PROFILE ---------------- */

useEffect(()=>{

axios.get("http://127.0.0.1:8000/api/profile/",{
headers:{Authorization:`Bearer ${token}`}
})
.then(res=>{
setProfile(res.data)
setSkills(res.data.skills || [])
setProjects(res.data.projects || [])
})

},[])


/* ---------------- PROFILE COMPLETION ---------------- */

const completion = () => {

let score = 0

if(profile.name) score += 15
if(profile.phone) score += 10
if(profile.cgpa) score += 10
if(profile.github) score += 10
if(profile.linkedin) score += 10
if(profile.resume) score += 15
if(skills.length > 0) score += 15
if(projects.length > 0) score += 15

return score

}


/* ---------------- HANDLE INPUT ---------------- */

const handleChange = (e)=>{
setProfile({
...profile,
[e.target.name]:e.target.value
})
}


/* ---------------- ADD SKILL ---------------- */

const addSkill = ()=>{
setSkills([...skills,{name:"",level:50}])
}


/* ---------------- ADD PROJECT ---------------- */

const addProject = ()=>{
setProjects([...projects,{title:"",description:""}])
}


/* ---------------- SAVE PROFILE ---------------- */

const saveProfile = ()=>{

axios.put(
"http://127.0.0.1:8000/api/profile/update/",
{
...profile,
skills,
projects
},
{
headers:{Authorization:`Bearer ${token}`}
}
)
.then(()=>{
setEdit(false)
})

}


return(

<div className="max-w-6xl mx-auto bg-white shadow rounded-xl p-8">

{/* PROFILE HEADER */}

<div className="flex items-center gap-6 mb-8">

<img
src={profile.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
className="w-20 h-20 rounded-full"
/>

<div>

<h2 className="text-2xl font-bold">
{profile.name || "Student Name"}
</h2>

<p className="text-sm text-gray-500">
{profile.email}
</p>

</div>

<button
onClick={()=>setEdit(!edit)}
className="ml-auto bg-blue-500 text-white px-4 py-2 rounded"
>
{edit ? "Cancel" : "Edit"}
</button>

</div>


{/* PROFILE COMPLETION */}

<h3 className="font-semibold mb-2">
Profile Completion
</h3>

<div className="bg-gray-200 h-3 rounded mb-6">

<div
className="bg-green-500 h-3 rounded"
style={{width:`${completion()}%`}}
></div>

</div>


{/* PERSONAL INFO */}

<h3 className="font-semibold border-b pb-2">
Personal Information
</h3>

<div className="grid grid-cols-2 gap-4 mt-4">

<input
name="phone"
value={profile.phone || ""}
onChange={handleChange}
disabled={!edit}
placeholder="Phone"
className="border p-2 rounded"
/>

<input
name="state"
value={profile.state || ""}
onChange={handleChange}
disabled={!edit}
placeholder="State"
className="border p-2 rounded"
/>

<input
name="cgpa"
value={profile.cgpa || ""}
onChange={handleChange}
disabled={!edit}
placeholder="CGPA"
className="border p-2 rounded"
/>

<input
name="codingScore"
value={profile.codingScore || ""}
onChange={handleChange}
disabled={!edit}
placeholder="Coding Score"
className="border p-2 rounded"
/>

</div>


{/* GITHUB + LINKEDIN */}

<h3 className="font-semibold border-b pb-2 mt-8">
Social Links
</h3>

<div className="grid grid-cols-2 gap-4 mt-4">

<input
name="github"
value={profile.github || ""}
onChange={handleChange}
disabled={!edit}
placeholder="GitHub Link"
className="border p-2 rounded"
/>

<input
name="linkedin"
value={profile.linkedin || ""}
onChange={handleChange}
disabled={!edit}
placeholder="LinkedIn Link"
className="border p-2 rounded"
/>

</div>


{/* SKILLS */}

<h3 className="font-semibold border-b pb-2 mt-8">
Skills
</h3>

<div className="space-y-4 mt-4">

{skills.map((skill,index)=>(

<div key={index}>

<input
value={skill.name}
disabled={!edit}
placeholder="Skill name"
className="border p-2 rounded w-full"
/>

<div className="bg-gray-200 h-2 rounded mt-2">

<div
className="bg-blue-500 h-2 rounded"
style={{width:`${skill.level}%`}}
></div>

</div>

</div>

))}

{edit && (

<button
onClick={addSkill}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
+ Add Skill
</button>

)}

</div>


{/* PROJECTS */}

<h3 className="font-semibold border-b pb-2 mt-8">
Projects
</h3>

<div className="space-y-4 mt-4">

{projects.map((project,index)=>(

<div key={index} className="border p-3 rounded">

<input
value={project.title}
disabled={!edit}
placeholder="Project title"
className="border p-2 rounded w-full mb-2"
/>

<textarea
value={project.description}
disabled={!edit}
placeholder="Project description"
className="border p-2 rounded w-full"
/>

</div>

))}

{edit && (

<button
onClick={addProject}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
+ Add Project
</button>

)}

</div>


{/* RESUME */}

<h3 className="font-semibold border-b pb-2 mt-8">
Resume
</h3>

<div className="flex gap-4 mt-4">

<input type="file" disabled={!edit}/>

{profile.resume && (

<a
href={profile.resume}
target="_blank"
className="bg-green-500 text-white px-4 py-2 rounded"
>
Preview Resume
</a>

)}

</div>


{/* SAVE BUTTON */}

{edit && (

<button
onClick={saveProfile}
className="mt-8 bg-purple-600 text-white px-6 py-2 rounded"
>
Save Profile
</button>

)}

</div>

)

}

export default Profile

