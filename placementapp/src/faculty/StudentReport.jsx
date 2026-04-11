import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaDownload, FaArrowLeft, FaGraduationCap, FaBriefcase, FaClipboardList } from "react-icons/fa";

function StudentReport() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReportData();
    }, [username]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access");

            // 1. Fetch Exam results
            const examRes = await fetch(`http://${window.location.hostname}:8000/api/user-combined-results/?username=${username}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const examData = await examRes.json();

            // 2. Fetch Applied Jobs
            const jobRes = await fetch(`http://${window.location.hostname}:8000/api/faculty-applications/?username=${username}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const jobData = await jobRes.json();

            setExams(Array.isArray(examData) ? examData : (examData.data || []));
            setJobs(Array.isArray(jobData) ? jobData : []);

        } catch (err) {
            console.error("Failed to fetch report data:", err);
            setError("Failed to load student reports");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600">Go Back</button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen print-section">
            {/* OFFICIAL LOGO HEADER - ONLY IN PRINT */}
            <div className="only-show-print text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <img src={`http://${window.location.hostname}:8000/static/images/logo.png`} alt="SSSIT" className="h-16" />
                    <div className="text-left border-l-2 border-gray-800 pl-4">
                        <h1 className="text-3xl font-black text-gray-900 m-0">SSSIT</h1>
                        <p className="text-gray-600 font-bold m-0 italic">Computer Education & ISO Certified</p>
                    </div>
                </div>
                <hr className="border-gray-800 border-2 my-4" />
                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-gray-800">Official Performance Transcript</h2>
            </div>

            {/* PRINT BUTTONS & NAV - NO PRINT SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 no-print gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-all w-fit"
                >
                    <FaArrowLeft /> Back to Dashboard
                </button>
                
                <div className="flex justify-end w-full md:w-auto">
                    <button 
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 w-fit"
                    >
                        <FaDownload /> Download Report (PDF)
                    </button>
                </div>
            </div>

            {/* REPORT HEADER */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 print-border">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                        {username?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-1">Performance Report</h1>
                        <p className="text-gray-500">Student: <span className="font-bold text-gray-700">{username}</span></p>
                        <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Exams Taken</p>
                                <p className="text-xl font-bold text-blue-700">{exams.length}</p>
                            </div>
                            <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Jobs Applied</p>
                                <p className="text-xl font-bold text-purple-700">{jobs.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TWO COLUMN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* EXAM REPORT */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3" style={{backgroundColor: '#1e293b', color: '#fff'}}>
                        <FaGraduationCap className="text-xl text-blue-200" />
                        <h4 className="font-bold text-lg m-0 text-white uppercase tracking-wider">Exam Performance History</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Exam</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Result</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {exams.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No exams recorded yet.</td>
                                    </tr>
                                ) : (
                                    exams.map((exam, idx) => {
                                        // Dynamically rename Weekly and Monthly exams to match Student UI
                                        const type = (exam.examType || exam.exam_type || "").toLowerCase();
                                        const title = (exam.examTitle || exam.title || exam.exam_title || "").toLowerCase();
                                        const isWeekly = type === 'weekly' || title.includes('weekly');
                                        const isMonthly = type === 'monthly' || title.includes('monthly');
                                        
                                        let displayTitle = exam.examTitle || "Exam";
                                        
                                        if (isWeekly) {
                                            // Count how many weekly exams are appearing AFTER this one in the array to determin its index
                                            // Array from backend is newest-first.
                                            const totalWeekly = exams.filter(e => {
                                                const tStr = (e.examTitle || '').toLowerCase();
                                                return e.examType === 'weekly' || tStr.includes('weekly');
                                            }).length;
                                            
                                            // Find index of THIS specific exam inside the filtered weekly array
                                            const weeklyExamsList = exams.filter(e => {
                                                const tStr = (e.examTitle || '').toLowerCase();
                                                return e.examType === 'weekly' || tStr.includes('weekly');
                                            });
                                            const weeklyIndex = weeklyExamsList.indexOf(exam);
                                            displayTitle = `Weekly Exam ${totalWeekly - weeklyIndex}`;
                                        } else if (isMonthly) {
                                            const totalMonthly = exams.filter(e => {
                                                const tStr = (e.examTitle || '').toLowerCase();
                                                return e.examType === 'monthly' || tStr.includes('monthly');
                                            }).length;
                                            const monthlyExamsList = exams.filter(e => {
                                                const tStr = (e.examTitle || '').toLowerCase();
                                                return e.examType === 'monthly' || tStr.includes('monthly');
                                            });
                                            const monthlyIndex = monthlyExamsList.indexOf(exam);
                                            displayTitle = `Monthly Exam ${totalMonthly - monthlyIndex}`;
                                        }
                                        
                                        return (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-700">{displayTitle}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono">{exam.score ?? 0}/{exam.totalMarks ?? 0}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    exam.status?.toLowerCase() === 'pass' 
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                }`}>
                                                    {(exam.status || "FAIL").toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "N/A"}
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* JOB REPORT */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3" style={{backgroundColor: '#312e81', color: '#fff'}}>
                        <FaBriefcase className="text-xl text-indigo-200" />
                        <h4 className="font-bold text-lg m-0 text-white uppercase tracking-wider">Job Application History</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Company Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No job applications recorded.</td>
                                    </tr>
                                ) : (
                                    jobs.map((app, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-extrabold text-blue-700">{app.job_details?.company || "N/A"}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700">{app.job_details?.job_title || "N/A"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    app.status === 'accepted' 
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                                    : app.status === 'rejected'
                                                    ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}>
                                                    {app.status === 'pending' || !app.status ? 'APPLIED' : app.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {new Date(app.applied_date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* SUMMARY FOOTER - ONLY IN PRINT */}
            <div className="only-show-print mt-12 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-400 italic text-sm">Automated Student Performance Report - Generated on {new Date().toLocaleDateString()}</p>
                <div className="mt-12 flex justify-between px-20">
                    <div className="text-center">
                        <div className="w-32 border-b border-gray-800 mb-2"></div>
                        <p className="text-xs font-bold">Faculty Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="w-32 border-b border-gray-800 mb-2"></div>
                        <p className="text-xs font-bold">Institution Seal</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    /* Hide everything by default */
                    body * { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    
                    /* Reset margins and backgrounds for print */
                    body, html { margin: 0 !important; padding: 0 !important; background: #fff !important; }
                    
                    /* Position the report at the very top */
                    .print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        background: white !important;
                        min-height: 100vh;
                        border: none !important;
                    }

                    .no-print { display: none !important; }
                    
                    /* Force items to stay together */
                    .grid > div { 
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        margin-bottom: 5mm !important;
                    }
                    
                    /* Force background colors to print */
                    .print-section { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .bg-white { background: white !important; }
                    
                    /* Re-style cards for black and white if needed */
                    .rounded-2xl { border-radius: 0 !important; }
                    .shadow-sm { box-shadow: none !important; border: 1px solid #eee !important; margin-bottom: 2mm !important; }
                    
                    /* Header shrinkage */
                    .print-section h1 { font-size: 20pt !important; }
                    .print-section h2 { font-size: 14pt !important; }
                    .print-section h3, .print-section h4 { font-size: 12pt !important; }
                }
                
                .only-show-print { display: none; }
                @media print {
                    .only-show-print { display: block !important; }
                }
                
                .no-print { display: block; }
            `}</style>
        </div>
    );
}

export default StudentReport;
