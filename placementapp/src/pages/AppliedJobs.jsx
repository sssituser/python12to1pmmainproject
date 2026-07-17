import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Check, X, ChevronLeft, ChevronRight } from "lucide-react";

function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Job Applications | SSSIT Placement Portal";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Track the status and progress of all your job and internship applications.");
    }
  }, []);

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
          setLoading(false)
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setJobs([]);
          setLoading(false);
        });
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((j) => {
    const title = j.job_details?.job_title?.toLowerCase() || "";
    const company = j.job_details?.company?.toLowerCase() || "";
    return title.includes(search.toLowerCase()) || company.includes(search.toLowerCase());
  });

  // Pagination calculations
  const totalRecords = filteredJobs.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📂 Job Opening
          </h1>
        </div>

        {/* Search Bar section */}
        <div className="flex gap-2 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company name or job title"
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2563eb] text-white text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4 w-1/4">Company</th>
                  <th className="px-6 py-4 w-1/4">Job Title</th>
                  <th className="px-6 py-4 text-center w-1/3">Progress</th>
                  <th className="px-6 py-4 text-center w-1/6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      No applications found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((j) => {
                    const isAccepted = j.status === "accepted";
                    const isRejected = j.status === "rejected";
                    const isPending = !isAccepted && !isRejected;

                    return (
                      <tr key={j.id} className="hover:bg-slate-50/50 transition">
                        {/* Company */}
                        <td className="px-6 py-5 font-semibold text-gray-800">
                          {j.job_details?.company || "N/A"}
                        </td>
                        
                        {/* Job Title */}
                        <td className="px-6 py-5 text-gray-600">
                          {j.job_details?.job_title || "N/A"}
                        </td>

                        {/* Progress Stepper */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center w-full max-w-xs justify-between relative">
                              {/* Connector Line */}
                              <div className="absolute left-[15%] right-[15%] top-1/2 -translate-y-1/2 h-[3px] bg-gray-200 z-0">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isAccepted
                                      ? "bg-[#2563eb]"
                                      : isRejected
                                      ? "bg-red-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                              </div>

                              {/* Applied Node */}
                              <div className="flex flex-col items-center z-10 relative bg-white px-2">
                                <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
                                  <Check className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-medium text-gray-600 mt-1">Applied</span>
                              </div>

                              {/* Shortlisted Node */}
                              <div className="flex flex-col items-center z-10 relative bg-white px-2">
                                {isAccepted ? (
                                  <div className="w-7 h-7 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
                                    <Check className="w-4 h-4" />
                                  </div>
                                ) : isRejected ? (
                                  <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                                    <X className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                                  </div>
                                )}
                                <span className={`text-[11px] font-medium mt-1 ${isRejected ? "text-red-500" : "text-gray-600"}`}>
                                  {isRejected ? "Rejected" : "Shortlisted"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => navigate(`/dashboard/appliedjobs/rounds/${j.id}`)}
                            className="inline-flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Rounds
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <div className="flex gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <span>•</span>
              <span>{totalRecords} records</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Show</span>
              <select
                className="bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AppliedJobs;
AppliedJobs;
