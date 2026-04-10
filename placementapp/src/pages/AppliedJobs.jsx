import React, { useEffect, useState } from "react";
import { FaSearch, FaFileAlt, FaCheckCircle, FaBuilding, FaCalendarAlt, FaClock } from "react-icons/fa";

function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchJobs = () => {
      fetch(`http://${window.location.hostname}:8000/api/applied-jobs/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (res.status === 401) {
            localStorage.removeItem("access");
            return [];
          }
          return res.ok ? await res.json() : [];
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setJobs(data);
          } else if (data?.results) {
            setJobs(data.results);
          } else {
            setJobs([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log("Fetch error:", err);
          setJobs([]);
          setLoading(false);
        });
    };

  // First call
  fetchJobs();

  // Auto refresh
  const interval = setInterval(fetchJobs, 5000);
    

    return () => clearInterval(interval);
  }, [token]);

  const filteredJobs = jobs.filter((j) => {
    const title = j.job_details?.job_title?.toLowerCase() || "";
    const company = j.job_details?.company?.toLowerCase() || "";
    return title.includes(search.toLowerCase()) || company.includes(search.toLowerCase());
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔐</div>
          <h4 className="text-xl font-bold text-slate-800">Please login to view applied jobs</h4>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🔹 Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FaFileAlt className="text-blue-600" /> Applied <span className="text-blue-600">Jobs</span>
            </h1>
            <p className="text-slate-500 font-medium">
              You have submitted <span className="text-blue-600 font-bold">{filteredJobs.length}</span> applications in total.
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 🔹 Table Container */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto whitespace-nowrap lg:whitespace-normal">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-[0.1em]">
                  <th className="px-8 py-6 text-center w-24">S.No</th>
                  <th className="px-6 py-6 font-bold">Job Title & Company</th>
                  <th className="px-6 py-6 text-center">Applied Date</th>
                  <th className="px-6 py-6 text-center">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <FaSearch size={40} className="text-slate-200" />
                        <p className="font-bold text-lg">No application matches found</p>
                        <p className="text-sm">Try searching for a different company or job title.</p>
                      </div>
                    </td>
                  </tr>
                ) : (

                  filteredJobs.map((j, index) => (
                    <tr key={j.id} className="group hover:bg-slate-50/80 transition-colors duration-200">
                      <td className="px-8 py-6 text-center font-bold text-slate-400 font-mono text-sm leading-none">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-slate-900 font-extrabold text-base group-hover:text-blue-600 transition-colors leading-tight">
                            {j.job_details?.job_title || "N/A"}
                          </span>
                          <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                            <FaBuilding className="text-slate-300" /> {j.job_details?.company || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center border-b border-gray-50">
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 tabular-nums">
                          <FaCalendarAlt size={12} className="text-slate-400" />
                          {j.applied_date ? new Date(j.applied_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center border-b border-gray-50">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shadow-sm
                          ${j.status === 'accepted'
                            ? 'bg-emerald-500 text-white'
                            : j.status === 'rejected'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-white'}
                        `}>
                          {j.status === 'accepted' ? <FaCheckCircle /> : <FaClock />}
                          {j.status === 'accepted'
                                        ? 'Selected'
                                        : j.status === 'rejected'
                                        ? 'Rejected'
                                        : 'Reviewing'}
                        </span>
                      </td>
                    </tr>
                  ))

                  
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Info */}
          <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-between items-center tabular-nums">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Showing {filteredJobs.length} active applications</p>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Last sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AppliedJobs;
