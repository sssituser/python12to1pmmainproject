import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaUndo, FaUserGraduate, FaBriefcase, FaEnvelope, FaFileExcel, FaGoogleDrive } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { googleDriveService } from "../services/googleDriveService";
import { toast } from "react-toastify";

function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch(`http://${window.location.hostname}:8000/api/jwt/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      }
      throw new Error("Token refresh failed");
    } catch (error) {
      console.log("Token refresh failed:", error);
      ["access", "refresh", "user"].forEach(key => localStorage.removeItem(key));
      window.location.href = "/";
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem("access");
    const makeRequest = async (authToken) => fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: authToken ? `Bearer ${authToken}` : undefined,
      },
    });

    let response = await makeRequest(token);
    if (response.status === 401 && token) {
      token = await refreshAccessToken();
      if (token) response = await makeRequest(token);
    }
    return response;
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        navigate("/faculty/login", { replace: true });
        return;
      }

      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/faculty-applications/`);
      if (res.ok) {
        const data = await res.json();
        setApps(Array.isArray(data) ? data : data.results || data.data || []);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, action) => {
    try {
      const res = await makeAuthenticatedRequest(`http://${window.location.hostname}:8000/api/faculty-applications/${applicationId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchApps();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const generateCompanyWiseWorkbook = () => {
    if (!filteredApps || filteredApps.length === 0) return null;

    const workbook = XLSX.utils.book_new();
    
    // Group applications by company
    const companyGroups = filteredApps.reduce((acc, app) => {
      const companyName = (app.job_details?.company || "Unspecified").trim();
      if (!acc[companyName]) acc[companyName] = [];
      
      acc[companyName].push({
        "S.No": acc[companyName].length + 1,
        "Student Name": app.username || app.user?.username || "Anonymous",
        "Email": app.email || "N/A",
        "Job Title": app.job_details?.job_title || "Unknown Role",
        "Applied Date": new Date(app.applied_date).toLocaleDateString('en-IN'),
        "Status": app.status || "pending"
      });
      return acc;
    }, {});

    // Add a separate worksheet for each company
    Object.keys(companyGroups).forEach(company => {
      const worksheet = XLSX.utils.json_to_sheet(companyGroups[company]);
      const safeSheetName = company.substring(0, 31).replace(/[\[\]\*?\/\\:]/g, '_');
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName === "" ? "General" : safeSheetName);
    });

    return { workbook, count: Object.keys(companyGroups).length };
  };

  const exportToExcel = () => {
    const result = generateCompanyWiseWorkbook();
    if (!result) {
      toast.warning("No data available to download.");
      return;
    }
    
    const fileName = `Placement_Report_Full_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(result.workbook, fileName);
    toast.success(`Excel downloaded with ${result.count} company sheets!`);
  };

  const uploadToDrive = async () => {
    try {
      const result = generateCompanyWiseWorkbook();
      if (!result) {
        toast.warning("No data available to export.");
        return;
      }

      const wbout = XLSX.write(result.workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `Placement_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      const toastId = toast.loading("Processing Company-wise Storage...");
      await googleDriveService.uploadFile(blob, fileName);
      toast.update(toastId, { 
        render: `Successfully stored data in ${result.count} Company Sheets on Drive!`, 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });
    } catch (error) {
      console.error("Drive upload failed", error);
      toast.error(error.message || "Failed to upload to Google Drive.");
    }
  };

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const student = (app.username || app.user?.username || "").toLowerCase();
      const job = (app.job_details?.job_title || "").toLowerCase();
      const status = (app.status || "pending").toLowerCase();
      const matchesSearch = student.includes(search.toLowerCase()) || job.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [apps, search, statusFilter]);

  const stats = useMemo(() => ({
    total: apps.length,
    pending: apps.filter(a => (a.status || 'pending') === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  }), [apps]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Curating Applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Stats Bundle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
          <h2 className="text-2xl font-bold mb-1">Applications</h2>
          <p className="text-blue-100 text-sm opacity-80">Manage student choices</p>
          <div className="mt-4 text-4xl font-black">{stats.total}</div>
        </div>
        
        {[
          { label: 'Pending Review', count: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: FaClock },
          { label: 'Selected Candidates', count: stats.accepted, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: FaCheckCircle },
          { label: 'Rejected Applications', count: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-50', icon: FaTimesCircle }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-white shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default`}>
            <div className={`p-3 rounded-xl ${stat.bg} shadow-inner`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full md:w-96 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search students, roles, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['all', 'pending', 'accepted', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${statusFilter === f 
                    ? 'bg-gray-900 text-white shadow-lg' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={exportToExcel}
              className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <FaFileExcel size={14} /> Excel
            </button>
            <button
              onClick={uploadToDrive}
              className="flex-1 md:flex-none bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2"
            >
              <FaGoogleDrive size={14} /> Drive
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                <th className="py-5 px-8 text-center">#</th>
                <th className="py-5 px-4 font-bold">Candidate Information</th>
                <th className="py-5 px-4 font-bold">Position Applied</th>
                <th className="py-5 px-4 text-center font-bold">Applied Date</th>
                <th className="py-5 px-8 text-right font-bold">Action / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredApps.length > 0 ? filteredApps.map((app, idx) => {
                const studentName = app.username || app.user?.username || "Anonymous";
                const jobTitle = app.job_details?.job_title || "Unknown Role";
                const company = app.job_details?.company || "Confidential";
                const status = app.status || "pending";

                return (
                  <tr key={app.id || idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-6 px-8 text-center font-mono text-xs text-gray-300 font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-black text-sm border-2 border-white shadow-sm ring-1 ring-blue-200/30">
                          {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none mb-1 flex items-center gap-1.5">
                            {studentName}
                            <FaUserGraduate size={10} className="text-gray-300" />
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                            <FaEnvelope size={10} />
                            {app.email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <p className="font-bold text-gray-800 text-sm mb-1">{jobTitle}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 inline-block px-2 py-0.5 rounded flex items-center gap-1.5">
                        <FaBriefcase size={8} /> {company}
                      </p>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <p className="text-xs font-bold text-gray-500 tabular-nums">
                        {new Date(app.applied_date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, 'accept')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                            >
                              <FaCheckCircle /> Accept
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'reject')}
                              className="bg-rose-600 hover:bg-rose-700 text-white p-2.5 rounded-xl shadow-lg shadow-rose-200 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                            >
                              <FaTimesCircle /> Reject
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border-2 shadow-sm
                              ${status === 'accepted' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {status === 'accepted' ? 'Selected' : 'Rejected'}
                            </span>
                            <button
                              onClick={() => updateStatus(app.id, 'pending')}
                              className="text-gray-300 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50"
                              title="Undo/Reset Status"
                            >
                              <FaUndo size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <FaBriefcase size={32} />
                      </div>
                      <p className="text-gray-400 font-bold">No applications match your criteria</p>
                      <button onClick={() => {setSearch(''); setStatusFilter('all')}} className="text-blue-600 font-bold text-xs hover:underline uppercase tracking-widest">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex justify-between items-center tabular-nums">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
             Showing {filteredApps.length} results
           </p>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
             Faculty Node: {window.location.hostname}
           </p>
        </div>
      </div>
    </div>
  );
}

export default Applications;
