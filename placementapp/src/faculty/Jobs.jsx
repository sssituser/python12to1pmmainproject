import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaPlus, FaTrash, FaEdit, FaEye, 
  FaChartPie, FaCalendarAlt, FaSearch, FaHistory, FaCheckCircle, FaTimesCircle,
  FaFileExcel, FaGoogleDrive
} from "react-icons/fa";
import * as XLSX from 'xlsx';
import { googleDriveService } from "../services/googleDriveService";
import { toast } from "react-toastify";

function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    job_title: "",
    company: "",
    location: "",
    job_type: "",
    experience: "",
    salary: "",
    primary_skills: "",
    eligibility: "",
    description: "",
    responsibilities: "",
    external_application_link: "",
    deadline: "",
    passout: ""
  });

  const fetchJobs = async () => {
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/jobs/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        ["access", "refresh"].forEach(k => localStorage.removeItem(k));
        navigate("/faculty/login", { replace: true });
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Fetch jobs error", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access");
    const url = form.id
      ? `http://${window.location.hostname}:8000/api/admin/jobs/${form.id}/`
      : `http://${window.location.hostname}:8000/api/admin/jobs/`;
    
    try {
      const res = await fetch(url, {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          job_title: "", company: "", location: "", job_type: "", 
          experience: "", salary: "", primary_skills: "", eligibility: "",
          description: "", responsibilities: "", external_application_link: "", deadline: "",
          passout: ""
        });
        fetchJobs();
      }
    } catch (err) {
      console.error("Submit job error", err);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    const token = localStorage.getItem("access");
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/admin/jobs/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredJobs.map((j, i) => ({
      "S.No": i + 1,
      "Job Title": j.job_title,
      "Company": j.company,
      "Location": j.location,
      "Job Type": j.job_type,
      "Experience": j.experience,
      "Salary": j.salary,
      "Primary Skills": j.primary_skills,
      "Eligibility": j.eligibility,
      "Passout Year": j.passout,
      "Deadline": j.deadline ? new Date(j.deadline).toLocaleDateString() : "Indefinite",
      "Status": j.deadline && new Date(j.deadline) < new Date() ? "Expired" : "Active"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(workbook, `Jobs_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const uploadToDrive = async () => {
    try {
      const dataToExport = filteredJobs.map((j, i) => ({
        "S.No": i + 1,
        "Job Title": j.job_title,
        "Company": j.company,
        "Location": j.location,
        "Job Type": j.job_type,
        "Experience": j.experience,
        "Salary": j.salary,
        "Primary Skills": j.primary_skills,
        "Eligibility": j.eligibility,
        "Passout Year": j.passout,
        "Deadline": j.deadline ? new Date(j.deadline).toLocaleDateString() : "Indefinite",
        "Status": j.deadline && new Date(j.deadline) < new Date() ? "Expired" : "Active"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
      
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `Jobs_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      const toastId = toast.loading("Uploading to Google Drive...");
      await googleDriveService.uploadFile(blob, fileName);
      toast.update(toastId, { render: "Successfully uploaded to Google Drive!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error("Drive upload failed", error);
      toast.error("Failed to upload to Google Drive. Ensure you are logged in and have granted permissions.");
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => 
      j.job_title?.toLowerCase().includes(search.toLowerCase()) ||
      j.company?.toLowerCase().includes(search.toLowerCase())
    );
  }, [jobs, search]);

  const stats = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter(j => !j.deadline || new Date(j.deadline) >= new Date()).length,
    expired: jobs.filter(j => j.deadline && new Date(j.deadline) < new Date()).length,
  }), [jobs]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-1">Job Inventory</h2>
            <p className="text-blue-100 text-sm opacity-80 mb-6">Create and manage placement listings</p>
            <button
              onClick={() => { setShowForm(!showForm); if(!showForm) setForm({ 
                job_title: "", company: "", location: "", job_type: "", 
                experience: "", salary: "", primary_skills: "", eligibility: "",
                description: "", responsibilities: "", external_application_link: "", deadline: "",
                passout: ""
              }); }}
              className="bg-white text-blue-600 px-6 py-2.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              {showForm ? <><FaTimesCircle /> Cancel</> : <><FaPlus /> Post New Job</>}
            </button>
            <div className="flex gap-3 mt-4">
              <button
                onClick={exportToExcel}
                className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                <FaFileExcel size={14} /> Export Excel
              </button>
              <button
                onClick={uploadToDrive}
                className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2"
              >
                <FaGoogleDrive size={14} /> Upload to Drive
              </button>
            </div>
          </div>
          <FaBriefcase className="absolute right-[-20px] bottom-[-20px] text-white/10 rotate-12" size={160} />
        </div>

        {[
          { label: 'Active Jobs', count: stats.active, icon: FaCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Expired Posts', count: stats.expired, icon: FaHistory, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-3xl p-6 border border-white flex flex-col justify-between shadow-sm relative group`}>
            <div className={`w-12 h-12 rounded-2xl ${s.bg} border-2 border-white flex items-center justify-center shadow-sm mb-4`}>
              <s.icon className={s.color} size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest leading-none mb-2">{s.label}</p>
              <p className={`text-3xl font-black ${s.color} tabular-nums`}>{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Overlay/SlideDown */}
      {showForm && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 overflow-hidden animate-slideDown">
          <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            {form.id ? 'Refine Listing Details' : 'Initialize New Listing'}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'job_title', label: 'Position Title', placeholder: 'e.g. Lead Software Engineer' },
              { name: 'company', label: 'Organization Name', placeholder: 'e.g. SSSIT' },
              { name: 'location', label: 'Operational Hub', placeholder: 'e.g. Hyderabad / Remote' },
              { name: 'job_type', label: 'Engagement Type', type: 'select', options: ['Full Time', 'Internship', 'Remote', 'Contract'] },
              { name: 'experience', label: 'Expertise Level', type: 'select', options: ['0\u20131 Years', '1\u20133 Years', '3\u20135 Years', '5+ Years'] },
              { name: 'salary', label: 'Comp. Package', type: 'select', options: ['3\u20134 LPA', '4\u20136 LPA', '6\u201310 LPA', '10+ LPA'] },
              { name: 'primary_skills', label: 'Core Competencies', placeholder: 'React, Django, Python' },
              { name: 'eligibility', label: 'Min. Qualifications', placeholder: 'B.Tech CS / IT' },
              { name: 'passout', label: 'Passout Batch', type: 'select', options: ['2023', '2024', '2025', '2026', 'All Batches'] },
              { name: 'deadline', label: 'Submission Close Date', type: 'date' },
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select name={field.name} value={form[field.name]} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm">
                    <option value="">Choose Option</option>
                    {field.options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm outline-none"
                    required={['job_title', 'company'].includes(field.name)}
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contextual Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm h-32 outline-none" placeholder="Elaborate on the role and company culture..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Key Responsibilities (Use '-' for bullet points)</label>
                <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm h-32 outline-none" placeholder="- Managing architectural decisions\n- Team mentoring" />
              </div>
            </div>
            <div className="md:col-span-3 bg-gray-50 p-6 rounded-3xl mt-4 flex justify-between items-center">
              <div className="flex-1 max-w-xl">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Extended Application Link (Optional)</label>
                 <input name="external_application_link" value={form.external_application_link} onChange={handleChange} className="w-full px-4 py-3 bg-white rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm outline-none" placeholder="https://careers.company.com/apply" />
              </div>
              <button type="submit" className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all transform active:scale-95">
                {form.id ? 'Commit Changes' : 'Broadcast Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table Structure */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/20">
          <div className="relative group w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search catalog by title, skill, or firm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white rounded-2xl border-none ring-1 ring-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
            />
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Vault Sync Active: {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                <th className="py-5 px-8 text-center">ID</th>
                <th className="py-5 px-4">Role Description</th>
                <th className="py-5 px-4 text-center">Specifications</th>
                <th className="py-5 px-4 text-center">Deadline</th>
                <th className="py-5 px-8 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredJobs.length > 0 ? filteredJobs.map((j, i) => (
                <tr key={j.id} className="hover:bg-gray-50/50 group transition-all duration-300">
                  <td className="py-6 px-8 text-center font-mono text-xs text-gray-300 font-bold tracking-tighter">
                    {(i + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm ring-1 ring-black/[0.03] group-hover:scale-110 transition-transform">
                        <FaBuilding size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                          {j.job_title}
                        </p>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                             <FaBriefcase size={8} /> {j.company}
                           </span>
                           <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                             <FaMapMarkerAlt size={10} /> {j.location} • {j.passout || 'Any'} Batch
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ring-1 ring-gray-200">
                         {j.job_type} • {j.experience}
                       </span>
                       <span className="text-gray-400 text-[10px] font-bold">
                         Avg Comp: {j.salary}
                       </span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    {j.deadline ? (
                      <div className={`inline-flex flex-col font-bold text-[10px] p-2 rounded-xl border tabular-nums
                        ${new Date(j.deadline) < new Date() 
                          ? 'bg-rose-50 border-rose-100 text-rose-500' 
                          : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        <div className="flex items-center gap-1 justify-center">
                          <FaCalendarAlt size={10} /> {new Date(j.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </div>
                        <span className="opacity-60">{new Date(j.deadline).getFullYear()}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 font-black italic text-[10px] tracking-widest uppercase">Indefinite</span>
                    )}
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 pr-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelectedJob(j)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <FaEye size={14} />
                      </button>
                      <button onClick={() => {
                        setForm({
                          id: j.id, job_title: j.job_title || "", company: j.company || "",
                          location: j.location || "", job_type: j.job_type || "",
                          experience: j.experience || "", salary: j.salary || "",
                          primary_skills: j.primary_skills || "", eligibility: j.eligibility || "",
                          description: j.description || "", responsibilities: j.responsibilities || "",
                          external_application_link: j.external_application_link || "",
                          deadline: j.deadline || "",
                          passout: j.passout || ""
                        });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }} className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => deleteJob(j.id)} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center text-gray-300">
                    <FaChartPie className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">Repository Exhausted</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
           <p>Showing {filteredJobs.length} listed roles</p>
           <p className="opacity-60">System Mode: Faculty Control Panel</p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white relative animate-scaleUp">
            <button onClick={() => setSelectedJob(null)} className="absolute top-8 right-8 text-gray-300 hover:text-rose-600 transition-colors bg-gray-50 p-2 rounded-full">
               <FaPlus className="rotate-45" size={20} />
            </button>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-10 pt-16">
               <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 inline-block">{selectedJob.company}</span>
               <h3 className="text-3xl font-black text-gray-900 mb-6">{selectedJob.job_title}</h3>
               <div className="grid grid-cols-2 gap-8 text-sm">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Functional Region</label>
                    <p className="font-bold text-gray-800 flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /> {selectedJob.location}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Passout Batch</label>
                    <p className="font-bold text-gray-800">{selectedJob.passout || 'Any Batch'}</p>
                  </div>
               </div>
            </div>
            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
               <div>
                 <h5 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-4">Strategic Narrative</h5>
                 <p className="text-gray-600 leading-relaxed font-medium">{selectedJob.description}</p>
               </div>
               <div>
                 <h5 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-4">Critical Responsibilities</h5>
                 <ul className="grid grid-cols-1 gap-3">
                   {selectedJob.responsibilities?.split("-").filter(i => i.trim()).map((item, id) => (
                     <li key={id} className="flex gap-4 group">
                       <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-2 group-hover:bg-indigo-500 transition-colors shrink-0" />
                       <span className="text-gray-600 font-medium text-sm leading-snug">{item.trim()}</span>
                     </li>
                   ))}
                 </ul>
               </div>
               {selectedJob.external_application_link && (
                 <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Direct Application URL</p>
                      <p className="text-xs text-indigo-400 font-medium truncate max-w-xs">{selectedJob.external_application_link}</p>
                    </div>
                    <a href={selectedJob.external_application_link} target="_blank" rel="noreferrer" className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Inquiry</a>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
