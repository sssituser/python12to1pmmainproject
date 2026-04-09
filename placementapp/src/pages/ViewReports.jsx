import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from 'jspdf';

function ViewReports() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced exam title formatting function (same as PlaygroundResults)
  const formatExamTitle = (title = "") => {
    if (!title) return "Exam";
    
    const t = title.toLowerCase();
    
    // Handle specific exam types first
    if (t.includes("python")) return "Python Exam";
    if (t.includes("java")) return "Java Exam";
    if (t.includes("oracle")) return "Oracle Exam";
    if (t.includes("ui")) return "UI Exam";
    if (t.includes("django")) return "Django Exam";
    if (t.includes("spring")) return "Spring Exam";
    if (t.includes("selenium")) return "Selenium Exam";
    if (t.includes("docker")) return "Docker Exam";
    if (t.includes("kubernetes")) return "Kubernetes Exam";
    if (t.includes("ci") && t.includes("cd")) return "CI/CD Exam";
    if (t.includes("machine") && t.includes("learning")) return "Machine Learning Exam";
    if (t.includes("deep") && t.includes("learning")) return "Deep Learning Exam";
    if (t.includes("data") && t.includes("science")) return "Data Science Exam";
    if (t.includes("data") && t.includes("modeling")) return "Data Modeling Exam";
    if (t.includes("data") && t.includes("visualization")) return "Data Visualization Exam";
    if (t.includes("augmented") && t.includes("reality")) return "Augmented Reality Exam";
    if (t.includes("virtual") && t.includes("reality")) return "Virtual Reality Exam";
    if (t.includes("web") && t.includes("3")) return "Web3 Exam";
    if (t.includes("web") && t.includes("api")) return "Web APIs Exam";
    if (t.includes("cloud") && t.includes("basics")) return "Cloud Basics Exam";
    if (t.includes("google") && t.includes("cloud")) return "Google Cloud Exam";
    if (t.includes("big") && t.includes("data")) return "Big Data Exam";
    if (t.includes("pandas")) return "Pandas Exam";
    if (t.includes("ai") && t.includes("concepts")) return "AI Concepts Exam";
    if (t.includes("computer") && t.includes("fundamentals")) return "Computer Fundamentals Exam";
    if (t.includes("deployment")) return "Deployment Exam";
    if (t.includes("qa") && t.includes("processes")) return "QA Processes Exam";
    if (t.includes("otp")) return "OTP Exam";
    
    // Handle weekly/monthly patterns
    if (t.includes("weekly")) return "Weekly Exam";
    if (t.includes("monthly")) return "Monthly Exam";
    
    // Handle generic patterns
    if (t.includes("test")) return "Test Exam";
    if (t.includes("exam")) return title; // Return original if it already contains "exam"
    
    // Default case - capitalize first letter
    return title.charAt(0).toUpperCase() + title.slice(1) + " Exam";
  };

  // Helper function to remove duplicate reports
  const removeDuplicateReports = (reports) => {
    const seen = new Set();
    const unique = [];
    
    for (const report of reports) {
      const key = report.id || report.random_id || report.examDate || report.start_time || JSON.stringify(report);
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(report);
      }
    }
    
    return unique;
  };

  // Fetch all reports
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Use localStorage data instead of API to ensure questions are included
    const localReports = JSON.parse(localStorage.getItem("allExamResults") || "[]");
    const uniqueReports = removeDuplicateReports(localReports);
    setReports(uniqueReports);
    setLoading(false);
    
    // Add automatic data update listener
    const handleExamDataUpdate = (event) => {
      console.log("🔄 ViewReports - Auto-updating data for:", event.detail.examType);
      const updatedReports = JSON.parse(localStorage.getItem("allExamResults") || "[]");
      const uniqueUpdatedReports = removeDuplicateReports(updatedReports);
      setReports(uniqueUpdatedReports);
    };

    window.addEventListener('examDataUpdated', handleExamDataUpdate);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('examDataUpdated', handleExamDataUpdate);
    };
  }, []);

  // Fetch single report
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      
      axios.get(`http://${window.location.hostname}:8000/api/report/${id}/`)
        .then(res => {
          setSelected(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching report detail:", err);
          setError("Failed to load report details");
          setLoading(false);
        });
    }
  }, [id]);

  const handleBack = () => {
    navigate("/dashboard/daily-exams");
  };

  const handleView = (report) => {
    console.log("🔍 ViewReports - handleView called with report:");
    console.log("   - Complete report object:", report);
    console.log("   - Report questions:", report.questions);
    console.log("   - Questions length:", report.questions?.length);
    console.log("   - Questions type:", typeof report.questions);
    console.log("   - Is Array.isArray(questions):", Array.isArray(report.questions));
    console.log("   - Report answers:", report.answers);
    console.log("   - Answers length:", report.answers?.length);
    console.log("   - Answers type:", typeof report.answers);
    console.log("   - Is Array.isArray(answers):", Array.isArray(report.answers));
    console.log("   - Exam title:", report.examTitle);
    console.log("   - Student ID:", report.random_id);
    console.log("   - Unique ID being used:", report.id || report.random_id || report.examDate || report.start_time || report.id);
    
    // Store complete report data for accuracy
    localStorage.setItem("selectedExamResult", JSON.stringify(report));
    
    // Use unique ID for reliable navigation
    const uniqueId = report.id || report.random_id || report.examDate || report.start_time || report.id;
    
    console.log("🔍 ViewReports - Navigating to:", `/dashboard/playground/detailed-results/${uniqueId}`);
    console.log("🔍 ViewReports - State data being passed:", {
      examTitle: formatExamTitle(report.examTitle || report.exam),
      resultData: report
    });
    
    navigate(`/dashboard/playground/detailed-results/${uniqueId}`, { 
      state: { 
        examTitle: formatExamTitle(report.examTitle || report.exam),
        resultData: report // Pass complete data as fallback
      } 
    });
  };

  const handleDownload = (r) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Report', 105, 20, { align: 'center' });
    
    // Add report details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${r.user?.firstName || r.user?.username || r.name || 'Unknown'}`, 20, 40);
    doc.text(`Score: ${r.score || 0}/${r.totalMarks || r.total || 30}`, 20, 50);
    doc.text(`Exam: ${formatExamTitle(r.examTitle || r.exam)}`, 20, 60);
    doc.text(`Date: ${new Date(r.examDate || r.date || Date.now()).toLocaleDateString()}`, 20, 70);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' })}`, 105, 90, { align: 'center' });
    
    // Save the PDF
    const fileName = `exam-report-${(r.user?.firstName || r.user?.username || r.name || 'student').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto">
        <button 
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-6">Report Detail</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold">Student:</p>
            <p>{selected.user?.firstName || selected.user?.username || selected.name || 'Unknown'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold">Score:</p>
            <p>{selected.score || 0}/{selected.totalMarks || selected.total || 30}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold">Exam:</p>
            <p>{formatExamTitle(selected.examTitle || selected.exam)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold">Date:</p>
            <p>{new Date(selected.examDate || selected.date || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button 
            onClick={() => handleDownload(selected)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Exam Reports</h2>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reports available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold border-r border-gray-300">Exam Name</th>
                <th className="px-4 py-3 text-left font-bold border-r border-gray-300">Student</th>
                <th className="px-4 py-3 text-center font-bold border-r border-gray-300">Score</th>
                <th className="px-4 py-3 text-center font-bold border-r border-gray-300">Date</th>
                <th className="px-4 py-3 text-center font-bold border-r border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, index) => (
                <tr key={r.id || index} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-start">
                    {formatExamTitle(r.examTitle || r.exam)}
                  </td>
                  <td className="px-4 py-3 text-start">
                    {r.user?.firstName || r.user?.username || r.name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.score || 0}/{r.totalMarks || r.total || 30}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {new Date(r.examDate || r.date || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleView(r)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        View Analysis
                      </button>
                      <button 
                        onClick={() => handleDownload(r)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ViewReports;
