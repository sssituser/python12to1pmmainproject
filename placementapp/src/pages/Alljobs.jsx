import { useEffect, useState } from "react";
import { FaEye, FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaCode, FaCheckCircle, FaLock, FaBuilding,FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AllJobs() {
  const navigate = useNavigate();

  const [jobsData, setJobsData] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  async function applyJob(jobId, externalLink = null) {
    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/applied-jobs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ job: jobId }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setJobsData((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, status: "Applied" } : job
          )
        );
        if (externalLink) window.open(externalLink, "_blank");
      } else {
        if (externalLink) window.open(externalLink, "_blank");
      }
    } catch (err) {
      console.error("Error ❌", err);
    }
  }

useEffect(() => {
  const token = localStorage.getItem("access");

  async function fetchData() {
    setIsLoading(true);

    try {
      
      const jobsRes = await fetch(`http://${window.location.hostname}:8000/api/jobs/`);
      const jobs = await jobsRes.json();

      let appliedJobs = [];

      if (token) {
        try {
          const appliedRes = await fetch(`http://${window.location.hostname}:8000/api/applied-jobs/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (appliedRes.ok) {
            const data = await appliedRes.json();
            appliedJobs = Array.isArray(data) ? data : data.results || [];
          }

        } catch (err) {
          console.log("Applied jobs error:", err);
        }
      }

      const updated = jobs.map((j) => {
        const app = appliedJobs.find(
          (a) => (typeof a.job === "object" ? a.job.id : a.job) === j.id
        );

        return {
          ...j,
          status: app
            ? app.status === "accepted"
              ? "Selected"
              : app.status === "rejected"
              ? "Rejected"
              : "Applied" // Restore "Applied" status
            : j.status,
        };
      });

      setJobsData(updated);

    } catch (err) {
      console.log("Jobs fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  fetchData();
}, []);

  const filteredJobs = jobsData.filter((job) =>
    job.company?.toLowerCase().includes(search.toLowerCase()) ||
    job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    job.primary_skills?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🔹 Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              All Job <span className="text-blue-600">Openings</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Discover your next career move among our top-tier opportunities.
            </p>
          </div>

          <div className="relative group w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by company, title, or skills..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 🔹 Jobs Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No jobs found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Status Badge */}

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <FaBuilding size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                        {job.job_title}
                      </h3>
                      <p className="text-slate-500 text-sm font-semibold">{job.company}</p>
                      
                      <div className="mt-2.5">
                        {job.status === "Selected" ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                            <FaCheckCircle size={10} /> SELECTED
                          </span>
                        ) : job.status === "Rejected" ? (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-100">
                            <FaInfoCircle size={10} /> REJECTED
                          </span>
                        ) : job.status === "Closed" ? (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                            <FaLock size={10} /> CLOSED
                          </span>
                        ) : job.status === "Applied" ? (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                            <FaInfoCircle size={10} /> APPLIED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                            OPEN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2">
                    {(job.primary_skills || "General").split(",").slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border border-slate-100">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 text-[13px] font-medium text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <FaMapMarkerAlt className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FaCalendarAlt className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span>Deadline: {job.deadline || "TBA"}</span>
                    </div>
                  </div>

                  <div className="text-[13px] text-slate-600 leading-relaxed">
                    {job.description ? (
                      job.description.length > 120 ? (
                        <>
                          {expandedDescriptions.has(job.id)
                            ? job.description
                            : `${job.description.substring(0, 120)}...`}
                          <button
                            onClick={() => toggleDescription(job.id)}
                            className="text-blue-600 font-bold ml-1 hover:underline text-[12px]"
                          >
                            {expandedDescriptions.has(job.id) ? "Show Less" : "Read More"}
                          </button>
                        </>
                      ) : (
                        job.description
                      )
                    ) : (
                      "No detailed description provided."
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-[13px] hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaEye size={14} /> VIEW
                  </button>

                  <button
                    onClick={() => job.status !== 'Closed' && job.status !== 'Applied' && applyJob(job.id, job.external_application_link)}
                    disabled={job.status === 'Closed' || job.status === 'Applied'}
                    className={`flex-1 py-3 rounded-2xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-sm
                      ${job.status === 'Closed' || job.status === 'Applied'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30'}`}
                  >
                    {job.status === 'Applied' ? 'APPLIED' : job.status === 'Closed' ? 'CLOSED' : 'APPLY'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllJobs;
