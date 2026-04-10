import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaDollarSign, FaUserGraduate, FaBuilding, FaCheckCircle, FaClock } from "react-icons/fa";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch specific job
        const jobRes = await fetch(`http://${window.location.hostname}:8000/api/jobs/${id}/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const jobData = await jobRes.json();
        setJob(jobData);

        // Fetch application status
        const appliedRes = await fetch(`http://${window.location.hostname}:8000/api/applied-jobs/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const appliedData = await appliedRes.json();
        const appliedJobs = Array.isArray(appliedData) ? appliedData : (appliedData.results || []);
        const hasApplied = appliedJobs.some(j => (typeof j.job === 'object' ? j.job.id : j.job) === parseInt(id));
        setApplied(hasApplied);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/applied-jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ job: id })
      });

      if (res.status === 201) {
        setApplied(true);
        if (job.external_application_link) {
          window.open(job.external_application_link, '_blank');
        }
      } else {
        setApplied(true);
        if (job.external_application_link) {
          window.open(job.external_application_link, '_blank');
        }
      }
    } catch (err) {
      console.error("Apply error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-800">Job not found</h3>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 🔹 Top Navigation */}
        <button 
          onClick={() => navigate("/dashboard/alljobs")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to All Jobs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🔹 Left Column: Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <FaBuilding size={20} />
                    </div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{job.company}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {job.job_title}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 border-t border-slate-100 pt-8">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Location</p>
                  <p className="text-slate-700 font-bold flex items-center gap-2 text-sm">
                    <FaMapMarkerAlt className="text-blue-500" /> {job.location || "Remote"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Deadline</p>
                  <p className="text-slate-700 font-bold flex items-center gap-2 text-sm">
                    <FaCalendarAlt className="text-blue-500" /> {job.deadline || "TBA"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Availability</p>
                  <p className="text-slate-700 font-bold text-sm">
                    {job.status === "Closed" ? (
                      <span className="text-red-500 whitespace-nowrap">● CLOSED</span>
                    ) : (
                      <span className="text-emerald-500 whitespace-nowrap">● OPEN</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tight text-sm">Job Description</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {job.description || "No description provided for this role."}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tight text-sm">Responsibilities</h3>
                <ul className="space-y-3">
                  {job.responsibilities ? (
                    job.responsibilities.split("-").filter(i => i.trim()).map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-600 font-medium">
                        <span className="text-blue-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        {item.trim()}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic">No specific responsibilities listed.</li>
                  )}
                </ul>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900 border-l-4 border-blue-600 pl-4 uppercase tracking-tight text-sm">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.primary_skills?.split(",").map((skill, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 🔹 Right Column: Fast Summary & CTA */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl shadow-blue-500/20 space-y-8 sticky top-8">
              <h3 className="text-lg font-bold">Role Overview</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                    <FaBriefcase />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Job Type</p>
                    <p className="font-bold">{job.job_type || "Full Time"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                    <FaDollarSign />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Salary</p>
                    <p className="font-bold">{job.salary || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-purple-400">
                    <FaUserGraduate />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Experience</p>
                    <p className="font-bold">{job.experience || "Freshers"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                {applied ? (
                  <div className="bg-emerald-500/20 text-emerald-400 font-bold text-center py-4 rounded-2xl flex items-center justify-center gap-2 border border-emerald-500/30">
                    <FaCheckCircle /> Applied Successfully
                  </div>
                ) : job.status === "Closed" ? (
                  <div className="bg-red-500/20 text-red-400 font-bold text-center py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-500/30">
                    <FaClock /> Application Closed
                  </div>
                ) : (
                  <button 
                    onClick={handleApply}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/40 active:scale-[0.98]"
                  >
                    Apply for this position
                  </button>
                )}
                
                <button 
                  onClick={() => navigate(-1)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-2xl transition-all text-sm"
                >
                  Quick Back
                </button>
              </div>

              <p className="text-center text-slate-500 text-[10px] font-medium leading-relaxed">
                By applying, you agree to our Terms of Use and confirm all information is accurate.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default JobDetails;
