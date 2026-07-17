import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Building, DollarSign, MapPin, Award, Calendar, Percent, Cpu, FileText } from "lucide-react";

function JobRoundsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Job Rounds Details | SSSIT Placement Portal";
  }, []);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDetails = () => {
      fetch(`http://${window.location.hostname}:8000/api/applied-jobs/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setApplication(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    };

    fetchDetails();
  }, [id, token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔐</div>
          <h4 className="text-xl font-bold text-slate-800">Please login to view details</h4>
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

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-gray-600 font-medium">Application details not found.</p>
        <button
          onClick={() => navigate("/dashboard/appliedjobs")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Back to Applied Jobs
        </button>
      </div>
    );
  }

  const { job_details, status } = application;
  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";
  const isPending = !isAccepted && !isRejected;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button & Page Title */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button
            onClick={() => navigate("/dashboard/appliedjobs")}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] px-3.5 py-1.5 rounded transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            💼 Job Rounds Details
          </h1>
        </div>

        {/* Job Header Info Summary Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-800">
              {job_details?.job_title || "N/A"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1 text-[#1e40af]">
                <Building className="w-4 h-4" /> {job_details?.company || "N/A"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-400" /> Salary: {job_details?.salary || "Not Specified"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" /> Location: {job_details?.location || "N/A"}
              </span>
            </div>
          </div>
          <div>
            <span className="bg-[#e0f2fe] text-[#0369a1] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-[#bae6fd]">
              Applied
            </span>
          </div>
        </div>

        {/* Progress Bar Status Timeline Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-gray-800">Progress Bar</h3>
              <p className="text-xs text-gray-400 font-semibold">{job_details?.company}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Status</span>
              <span className={`text-xs font-bold ${isAccepted ? "text-green-600" : isRejected ? "text-red-500" : "text-amber-500"}`}>
                {isAccepted ? "Selected" : isRejected ? "Rejected" : "In Progress"}
              </span>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <div className="flex items-center w-full max-w-md justify-between relative">
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
              <div className="flex flex-col items-center z-10 relative bg-white px-3">
                <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-700 mt-1.5">Applied</span>
              </div>

              {/* Shortlisted Node */}
              <div className="flex flex-col items-center z-10 relative bg-white px-3">
                {isAccepted ? (
                  <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-5 h-5" />
                  </div>
                ) : isRejected ? (
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                    <X className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-white flex items-center justify-center shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-gray-600" />
                  </div>
                )}
                <span className={`text-xs font-bold mt-1.5 ${isRejected ? "text-red-500" : "text-gray-700"}`}>
                  {isRejected ? "Rejected" : "Shortlisted"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Job Information Grid */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-800">Job Description</h3>
          </div>
          <div className="p-5 divide-y divide-gray-100 text-xs font-semibold text-gray-600">
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><Building className="w-4 h-4" /> Company Name</span>
              <span className="col-span-2 text-gray-800">: {job_details?.company || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Bond / Experience</span>
              <span className="col-span-2 text-gray-800">: {job_details?.experience || "Not specified / 1.5 Years"}</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Salary</span>
              <span className="col-span-2 text-gray-800">: {job_details?.salary || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location</span>
              <span className="col-span-2 text-gray-800">: {job_details?.location || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><Award className="w-4 h-4" /> Qualification</span>
              <span className="col-span-2 text-gray-800">: {job_details?.eligibility || "UG (Bachelor Degree), PG (Postgraduate Degree)"}</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Graduates</span>
              <span className="col-span-2 text-gray-800">: 2024, 2025</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><Percent className="w-4 h-4" /> Percentage</span>
              <span className="col-span-2 text-gray-800">: 60% Highest Graduation Percentage</span>
            </div>
            <div className="grid grid-cols-3 py-3">
              <span className="text-gray-400 flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Technologies</span>
              <span className="col-span-2 text-gray-800">: {job_details?.primary_skills || "Python, Machine Learning, Web Technologies"}</span>
            </div>
          </div>
        </div>

        {/* Special Note Box */}
        {(job_details?.description || job_details?.responsibilities) && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800">Special Note / Job Description Details</h3>
            </div>
            <div className="p-5 text-xs text-gray-600 leading-relaxed font-semibold">
              <p>{job_details?.description || job_details?.responsibilities}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default JobRoundsDetails;
