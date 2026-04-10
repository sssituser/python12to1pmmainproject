import jsPDF from "jspdf";
import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import autoTable from "jspdf-autotable";

function ExamFailureDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("failed");
  const [activePeriod, setActivePeriod] = useState("all");
  const [activeCourse, setActiveCourse] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  const [availableCourses, setAvailableCourses] = useState([
    "Python Full Stack",
    "Java Full Stack",
    ".net Full Stack",
    "Mern Full Stack",
    "Data Science and Agentic AI",
    "UI Full Stack"
  ]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🚀 Starting fetchReports for faculty dashboard...");
      
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Allow faculty users to fetch exam reports
      if (!token) {
        console.log("No token found, skipping exam reports fetch");
        setReports([]);
        return;
      }

      // Use the faculty-appropriate endpoint for exam results
      const [response, courseRes] = await Promise.all([
         axios.get('/api/all-exam-results/', { headers: { Authorization: `Bearer ${token}` } }),
         axios.get('/api/courses/', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      console.log("✅ API response status:", response.status);
      console.log("📊 Raw API response:", response.data);
      const json = response.data;
      
      // Update dynamic course list
      if (courseRes.data && Array.isArray(courseRes.data)) {
        const liveCourseTitles = courseRes.data.map(c => c.title);
        setAvailableCourses(prev => [...new Set([...prev, ...liveCourseTitles])]);
      }
      
      let examList = [];
      if (json.success && json.data) {
        examList = json.data;
      } else if (Array.isArray(json)) {
        examList = json;
      } else {
        const arrayKey = Object.keys(json).find(key => Array.isArray(json[key]));
        if (arrayKey) examList = json[arrayKey];
      }
      
      // 🚀 MULTI-SOURCE SYNC: Try combined results if primary reports are empty
      if (examList.length === 0) {
        console.log("⚠️ Primary endpoint empty, trying combined results source...");
        try {
          const res2 = await axios.get('/api/user-combined-results/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json2 = res2.data;
          examList = json2.data || json2.results || (Array.isArray(json2) ? json2 : []);
        } catch (e2) {
          console.log("Combined results source empty or unauthorized");
        }
      }
      
      setReports(examList);
      
      if (examList.length > 0) {
        setSelectedReport(examList[0]);
      } else {
        setSelectedReport(null);
      }
      
    } catch (err) {
      console.error("❌ Failed to load exam reports:", err);
      
      // Handle 401 errors gracefully for faculty users
      if (err.response?.status === 401) {
        console.log("Unauthorized access - clearing invalid token");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setReports([]);
        setError(null); // Don't show error for 401
        return;
      }
      
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      setError(`Failed to load data: ${errorMessage}`);
      
      // Fallback
      const results = JSON.parse(localStorage.getItem("allExamResults") || "[]");
      if (results.length > 0) {
        setReports(results);
        setSelectedReport(results[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport?.id) {
      fetchReportDetails(selectedReport.id);
    } else {
      setDetailedData(null);
    }
  }, [selectedReport]);

  const fetchReportDetails = async (pk) => {
    try {
      setFetchingDetails(true);
      const token = localStorage.getItem("access");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      // Skip API call for faculty users without proper authentication
      if (!token || user.role === "faculty") {
        console.log("Skipping exam report detail fetch for faculty user or no token");
        setDetailedData(null);
        return;
      }

      const res = await axios.get(`/api/exam-report-detail/${pk}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setDetailedData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching detailed data:", err);
      
      // Handle 404 errors gracefully
      if (err.response?.status === 404) {
        console.log("Exam report detail not found - may be unavailable");
        setDetailedData(null);
      } else if (err.response?.status === 401) {
        console.log("Unauthorized access - clearing invalid token");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setDetailedData(null);
      } else {
        setDetailedData(null);
      }
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleContactStudent = () => {
    if (!selectedReport) return;
    
    const studentEmail = selectedReport.user?.email || `${selectedReport.user?.username}@example.com`;
    const subject = `Regarding Your Exam Performance - ${selectedReport.examTitle}`;
    const body = `Dear ${selectedReport.user?.username},\n\nI hope this message finds you well. I wanted to discuss your recent performance in the ${selectedReport.examTitle} where you scored ${selectedReport.score}/${selectedReport.totalMarks} (${selectedReport.percentage}%).\n\n${selectedReport.recommendations || "Please contact me to discuss your performance and how we can help you improve."}\n\nBest regards,\nFaculty`;
    
    // Create mailto link
    const mailtoLink = `mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleScheduleRetake = () => {
    if (!selectedReport) return;
    
    // Create calendar event for retake
    const eventTitle = `Retake Exam - ${selectedReport.examTitle}`;
    const eventDescription = `Retake exam for ${selectedReport.user?.username} - Original score: ${selectedReport.score}/${selectedReport.totalMarks} (${selectedReport.percentage}%)\n\nReason: ${selectedReport.failureReason || "Performance improvement needed"}\n\nRecommendations: ${selectedReport.recommendations || "Contact student for further discussion"}`;
    
    // Simple alert for now - could integrate with calendar system
    alert(`Retake Scheduled:\n\nStudent: ${selectedReport.user?.username}\nExam: ${selectedReport.examTitle}\n\nPlease coordinate with the student for scheduling. You can email them using the Contact Student button.`);
  };

  const handleFullReport = () => {
    if (!selectedReport) return;
    
    // Generate detailed PDF for this specific student
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Student Exam Report", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Student: ${selectedReport.user?.username || "Unknown"}`, 14, 35);
      doc.text(`Exam: ${selectedReport.examTitle}`, 14, 45);
      doc.text(`Date: ${new Date(selectedReport.examDate).toLocaleString()}`, 14, 55);
      doc.text(`Score: ${selectedReport.score}/${selectedReport.totalMarks} (${selectedReport.percentage}%)`, 14, 65);
      doc.text(`Status: ${selectedReport.status}`, 14, 75);
      
      // Add failure analysis
      let y = 90;
      doc.setFontSize(14);
      doc.text("Failure Analysis", 14, y);
      y += 10;
      doc.setFontSize(10);
      
      if (selectedReport.failureReason) {
        const lines = doc.splitTextToSize(selectedReport.failureReason, 180);
        lines.forEach(line => {
          doc.text(line, 14, y);
          y += 5;
        });
      }
      
      // Add recommendations
      y += 10;
      doc.setFontSize(14);
      doc.text("Recommendations", 14, y);
      y += 10;
      doc.setFontSize(10);
      
      if (selectedReport.recommendations) {
        const lines = doc.splitTextToSize(selectedReport.recommendations, 180);
        lines.forEach(line => {
          doc.text(line, 14, y);
          y += 5;
        });
      }
      
      doc.save(`student-report-${selectedReport.user?.username}-${selectedReport.examTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  const processedReports = useMemo(() => {
    if (!Array.isArray(reports)) {
      console.log("❌ Reports is not an array:", reports);
      return [];
    }
    
    if (reports.length === 0) {
      return [];
    }
    
    console.log("✅ Processing reports:", reports.length, "items");
    
    return reports.map((item) => {
      // Handle missing or invalid data gracefully
      // 🛡️ INTELLIGENT DATA EXTRACTION (Priority: Nested user object > Flat fields)
      const username = item.user?.username || item.user?.student_name || item.studentName || item.student_name || item.fullName || item.full_name || item.username || "Unknown Student";
      const eTitle = item.examTitle || item.exam_title || item.title || item.exam_name || "Assessment session";
      
      const score = Number(item.score || item.marks_obtained || 0);
      const totalMarks = Number(item.totalMarks || item.total_marks || (item.total_questions * (item.marks_per_question || 2)) || item.total_questions || 40);
      const percentage = item.percentage !== undefined 
        ? Number(item.percentage) 
        : totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      
      let statusStr = (item.status || "").toLowerCase();
      if (item.passed === false) statusStr = "fail";
      if (percentage < 40 && !statusStr) statusStr = "fail";
      
      // Standardize status strings
      let normalizedStatus = statusStr;
      if (statusStr.includes("fail")) normalizedStatus = "fail";
      if (statusStr.includes("cheat") || statusStr.includes("suspicious") || statusStr.includes("proctor")) normalizedStatus = "cheated";
      
      return {
        ...item,
        id: item.id || item.random_id || Math.random().toString(36).substr(2, 9),
        percentage,
        normalizedStatus,
        examDate: item.examDate || item.exam_date || item.date || item.created_at || new Date().toISOString(),
        user: { 
          username: username,
          email: item.user?.email || item.email || "N/A",
          course: item.user?.course || item.course || "General" 
        },
        examTitle: eTitle,
        score,
        totalMarks: totalMarks,
      };
    });
  }, [reports]);

  // Extract unique courses from reports dynamically
  useEffect(() => {
    if (processedReports.length > 0) {
      const uniqueFromReports = processedReports
        .map(r => r.user?.course)
        .filter(c => !!c);
      setAvailableCourses(prev => [...new Set([...prev, ...uniqueFromReports])]);
    }
  }, [processedReports]);

  const periodReports = useMemo(() => {
    if (processedReports.length === 0) {
      return [];
    }
    
    const filtered = processedReports.filter((item) => {
      const title = (item.examTitle || "").toLowerCase();
      const type = (item.examType || "").toLowerCase();
      const studentCourse = (item.user?.course || "").toLowerCase();
      const selectedCourseNorm = activeCourse.toLowerCase();
      
      // Course Filtering
      if (activeCourse !== "all" && studentCourse !== selectedCourseNorm) {
        return false;
      }

      if (activePeriod === "all") return true;

      // Check if it's a daily exam
      const isDaily = type === "daily" || title.includes("daily") || title.includes("day");
      if (activePeriod === "daily") return isDaily;
      
      // Check if it's a weekly exam
      const isWeekly = (type === "weekly" || title.includes("weekly") || title.includes("week")) && !isDaily;
      if (activePeriod === "weekly") return isWeekly;
      
      // Check if it's a monthly exam
      const isMonthly = (type === "monthly" || title.includes("monthly") || title.includes("month")) && !isDaily && !isWeekly;
      if (activePeriod === "monthly") return isMonthly;
      
      return false;
    });
    
    return filtered;
  }, [processedReports, activePeriod, activeCourse]);

  const summary = useMemo(() => {
    if (periodReports.length === 0) {
      console.log("ℹ️ No period reports available for summary calculation");
      return {
        failed: 0,
        cheated: 0,
        lowScore: 0,
        total: 0,
      };
    }
    
    const failed = periodReports.filter((item) => item.normalizedStatus === "fail");
    const cheated = periodReports.filter((item) => 
      item.normalizedStatus.includes("cheat") || 
      item.normalizedStatus.includes("suspicious")
    );
    const lowScore = periodReports.filter((item) => {
      const percentage = Number(item.percentage) || 0;
      return percentage < 40;
    });
    
    console.log('=== SUMMARY FOR PERIOD:', activePeriod, '===');
    console.log('- Total period reports:', periodReports.length);
    console.log('- Failed:', failed.length);
    console.log('- Cheated:', cheated.length);
    console.log('- Low Score:', lowScore.length);
    console.log('=== END SUMMARY ===');

    return {
      failed: failed.length,
      cheated: cheated.length,
      lowScore: lowScore.length,
      total: periodReports.length,
    };
  }, [periodReports]);

  const filteredReports = useMemo(() => {
    if (periodReports.length === 0) {
      console.log("ℹ️ No period reports available for filtering");
      return [];
    }
    
    let filtered = [];
    
    if (activeFilter === "cheated") {
      filtered = periodReports.filter((item) => item.normalizedStatus === "cheated");
      console.log("🔍 Filtered for cheated:", filtered.length, "items");
    } else if (activeFilter === "low-score") {
      filtered = periodReports.filter((item) => {
        const percentage = Number(item.percentage) || 0;
        return percentage < 40;
      });
      console.log("🔍 Filtered for low-score:", filtered.length, "items");
    } else {
      filtered = periodReports.filter((item) => item.normalizedStatus === "fail");
      console.log("🔍 Filtered for failed:", filtered.length, "items");
    }
    
    return filtered;
  }, [periodReports, activeFilter]);

  useEffect(() => {
    if (filteredReports.length === 0) {
      setSelectedReport(null);
      return;
    }
    if (!selectedReport || !filteredReports.some((item) => item.id === selectedReport.id)) {
      setSelectedReport(filteredReports[0]);
    }
  }, [filteredReports, selectedReport]);

  const handleDownloadPdf = () => {
    if (!filteredReports || filteredReports.length === 0) {
      alert("No data available to download. Please ensure exam data is loaded first.");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // 1. Institutional Header
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SSSIT", 14, 18);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Computer Education & ISO Certified Training", 14, 25);
      
      doc.setFontSize(14);
      doc.text("EXAM PERFORMANCE ANALYSIS REPORT", pageWidth - 14, 18, { align: "right" });
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, 25, { align: "right" });

      // 2. Report Parameters
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Report Parameters", 14, 52);
      
      autoTable(doc, {
        startY: 56,
        theme: 'plain',
        margin: { left: 14 },
        body: [
          ["Filter Scope:", activePeriod === "all" ? "All Exams" : activePeriod === "daily" ? "Daily Exam" : activePeriod === "weekly" ? "Weekly Exam" : "Monthly Exam"],
          ["Anomaly Filter:", activeFilter === "cheated" ? "Suspicious Activity" : activeFilter === "low-score" ? "Low score" : "Failed Attempts"],
          ["Total Records:", filteredReports.length.toString()]
        ],
        styles: { fontSize: 10, cellPadding: 1 }
      });

      // 3. Summary Statistics
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Metrics", 14, doc.lastAutoTable.finalY + 12);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        head: [['Metric Category', 'Count']],
        body: [
          ['Failed Attempts', summary.failed],
          ['Suspicious Activity', summary.cheated],
          ['Low Score Alerts (<40%)', summary.lowScore],
          ['Total Volume', summary.total]
        ],
        margin: { left: 14, right: 120 } // Keep summary table narrow
      });

      // 4. Detailed Records Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Detailed Record Logs", 14, doc.lastAutoTable.finalY + 15);

      const tableData = filteredReports.map((report, index) => [
        index + 1,
        report.user?.username || "Unknown",
        report.examTitle || "N/A",
        `${report.score || 0}/${report.totalMarks || 0} (${report.percentage || 0}%)`,
        (report.status || "N/A").toUpperCase(),
        new Date(report.examDate).toLocaleDateString()
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['#', 'Student Name', 'Exam Title', 'Score (%)', 'Status', 'Date']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59] }, // Slate-800
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 10 },
          4: { fontStyle: 'bold' }
        },
        didDrawPage: function (data) {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(150);
          const str = "Page " + doc.internal.getNumberOfPages();
          doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
          doc.text("SSSIT Official Placement & Exam Monitoring System", 14, doc.internal.pageSize.getHeight() - 10);
        }
      });
      
      doc.save(`exam-failure-report-${activePeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please ensure all data is loaded.");
    }
  };

  if (loading) {
    return (
      <div className="container mt-3">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="text-muted">Loading exam failure dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="container mt-3">
        <Alert variant="danger" className="d-flex align-items-center">
          <Alert.Heading className="mb-0">Error Loading Dashboard</Alert.Heading>
        </Alert>
        <div className="bg-white rounded-4 shadow-sm p-4">
          <p className="text-danger mb-3">{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      {error && reports.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading className="h6 mb-2">⚠️ Partial Data Loaded</Alert.Heading>
          <p className="mb-2">{error}</p>
          <button 
            className="btn btn-sm btn-warning" 
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Refresh Data'}
          </button>
        </Alert>
      )}
      
      <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-start">
          <div>
            <h4 className="mb-1">Faculty Exam Failure Dashboard</h4>
            <p className="text-muted mb-0">
              Review weekly and monthly exam failure trends, suspicious activity, and low-scoring sessions in one consolidated view.
            </p>
          </div>

            <div className="d-flex flex-wrap gap-2 align-items-center">
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto', minWidth: '180px' }}
                value={activeCourse}
                onChange={(e) => setActiveCourse(e.target.value)}
              >
                <option value="all">All Course Tracks</option>
                {availableCourses.sort().map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <button
                type="button"
                className={`btn btn-sm ${activePeriod === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setActivePeriod("all")}
              >
                Show All
              </button>
            <button
              type="button"
              className={`btn btn-sm ${activePeriod === "daily" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActivePeriod("daily")}
            >
              Daily Exam
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activePeriod === "weekly" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActivePeriod("weekly")}
            >
              Weekly Exam
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activePeriod === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setActivePeriod("monthly")}
            >
              Monthly Exam
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-success" 
              onClick={fetchReports}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleDownloadPdf}>
              Download PDF
            </button>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mt-4">
          <div className="col">
            <div 
              className={`border rounded-4 p-3 h-100 cursor-pointer transition-all ${activeFilter === "all" ? "border-primary bg-primary text-white" : ""}`}
              onClick={() => setActiveFilter("all")}
              style={{ cursor: 'pointer' }}
            >
              <small className={`text-uppercase ${activeFilter === "all" ? "text-white-50" : "text-muted"}`}>Scope</small>
              <h5 className="mt-2 mb-0">
                {activePeriod === "all" ? "All Exams" : 
                 activePeriod === "daily" ? "Daily Exam" : 
                 activePeriod === "weekly" ? "Weekly Exam" : 
                 "Monthly Exam"}
              </h5>
            </div>
          </div>
          <div className="col">
            <div 
              className={`rounded-4 p-3 h-100 bg-danger text-white transition-all ${activeFilter === "failed" ? "shadow-lg opacity-100 scale-105" : "opacity-75"}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveFilter(activeFilter === "failed" ? "all" : "failed")}
            >
              <small className="text-uppercase text-white-50">Failed</small>
              <h3 className="mt-2 mb-0">{summary.failed}</h3>
            </div>
          </div>
          <div className="col">
            <div 
              className={`rounded-4 p-3 h-100 bg-warning text-dark transition-all ${activeFilter === "cheated" ? "shadow-lg opacity-100 scale-105" : "opacity-75"}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveFilter(activeFilter === "cheated" ? "all" : "cheated")}
            >
              <small className="text-uppercase text-black-50">Suspicious Activity</small>
              <h3 className="mt-2 mb-0">{summary.cheated}</h3>
            </div>
          </div>
          <div className="col">
            <div 
              className={`rounded-4 p-3 h-100 bg-secondary text-white transition-all ${activeFilter === "low-score" ? "shadow-lg opacity-100 scale-105" : "opacity-75"}`}
              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              onClick={() => setActiveFilter(activeFilter === "low-score" ? "all" : "low-score")}
            >
              <small className="text-uppercase text-white-50">Low Score</small>
              <h3 className="mt-2 mb-0">{summary.lowScore}</h3>
            </div>
          </div>
        </div>
      </div>



      <div className="row">
        {/* LEFT COLUMN: CATEGORIZED LISTS */}
        <div className="col-xl-7">
          {/* FAILED SECTION */}
          {(activeFilter === "all" || activeFilter === "failed") && (
            <div className="bg-white p-4 shadow-sm rounded border-start border-4 border-danger mb-4 transition-all">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-danger fw-bold"><i className="bi bi-x-circle me-2"></i>Exam Failures</h6>
                <span className="badge bg-danger rounded-pill">{summary.failed} Records</span>
              </div>
              <ReportTable 
                reports={periodReports.filter(item => item.normalizedStatus === "fail")} 
                selectedId={selectedReport?.id}
                onSelect={setSelectedReport}
                emptyMessage="No failed records found."
              />
            </div>
          )}

          {/* CHEATED SECTION */}
          {(activeFilter === "all" || activeFilter === "cheated") && (
            <div className="bg-white p-4 shadow-sm rounded border-start border-4 border-warning mb-4 transition-all">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-shield-exclamation"></i>
                  </div>
                  <h6 className="mb-0 text-dark fw-bold">Suspicious Activity & Violations</h6>
                </div>
                <span className="badge bg-warning text-dark rounded-pill shadow-sm">{summary.cheated} INCIDENTS</span>
              </div>
              <ReportTable 
                reports={periodReports.filter(item => item.normalizedStatus.includes("cheat") || item.normalizedStatus.includes("suspicious"))} 
                selectedId={selectedReport?.id}
                onSelect={setSelectedReport}
                emptyMessage="No suspicious activity detected."
                isCheatedView={true}
              />
            </div>
          )}

          {/* LOW SCORE SECTION */}
          {(activeFilter === "all" || activeFilter === "low-score") && (
            <div className="bg-white p-4 shadow-sm rounded border-start border-4 border-secondary mb-4 transition-all">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 text-secondary fw-bold"><i className="bi bi-graph-down me-2"></i>Low Score Alerts (&lt;40%)</h6>
                <span className="badge bg-secondary rounded-pill">{summary.lowScore} Records</span>
              </div>
              <ReportTable 
                reports={periodReports.filter(item => Number(item.percentage) < 40)} 
                selectedId={selectedReport?.id}
                onSelect={setSelectedReport}
                emptyMessage="No low score alerts."
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL VIEW */}
        <div className="col-xl-5 mb-4">
          <div className="bg-white p-4 shadow-sm rounded h-100 sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <h5 className="mb-3">📋 Exam Analysis & Failure Details</h5>
            {!selectedReport ? (
              <div className="text-center py-5">
                <i className="bi bi-mouse2" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                <p className="text-muted mt-3">Select a record from any list to view detailed analysis</p>
              </div>
            ) : (
              <div>
                {/* Basic Info */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">📊 Basic Information</h6>
                  <DetailRow label="Student" value={selectedReport.user?.username || "Unknown"} />
                  <DetailRow 
                    label="Exam" 
                    value={selectedReport.examTitle ? selectedReport.examTitle : (() => {
                      const type = (selectedReport.examType || "Daily").charAt(0).toUpperCase() + (selectedReport.examType || "Daily").slice(1).toLowerCase();
                      const num = selectedReport.attemptNumber || "";
                      return `${type} Exam ${num}`;
                    })()} 
                  />
                  <DetailRow label="Status" value={
                    <span className={`badge ${
                      (selectedReport.normalizedStatus || '') === 'fail' ? 'bg-danger' :
                      (selectedReport.normalizedStatus || '').includes('cheat') ? 'bg-warning text-dark' :
                      (selectedReport.normalizedStatus || '').includes('suspicious') ? 'bg-warning text-dark' :
                      'bg-secondary'
                    }`}>
                      {selectedReport.status}
                    </span>
                  } />
                  <DetailRow label="Score" value={`${selectedReport.score}/${selectedReport.totalMarks} (${selectedReport.percentage}%)`} />
                  <DetailRow label="Date" value={new Date(selectedReport.examDate).toLocaleString()} />
                </div>

                {/* Failure Analysis */}
                <div className="mb-4">
                  <h6 className="text-danger mb-3">⚠️ Failure Analysis</h6>
                  <div className="alert alert-light border">
                    <strong>Reason:</strong>
                    <p className="mb-0 mt-1">{selectedReport.failureReason || "No detailed reason provided"}</p>
                  </div>
                </div>

                {/* Question Breakdown */}
                <div className="mt-5 pt-4 border-top">
                  <h6 className="text-secondary mb-4 flex items-center justify-between">
                    <span>📝 Question Breakdown</span>
                    {fetchingDetails && (
                      <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                    )}
                  </h6>

                  {detailedData?.questions?.length > 0 ? (
                    <div className="accordion accordion-flush" id="questionsAccordion">
                      {detailedData.questions.map((q, idx) => {
                        const userAnswerIdx = detailedData.answers ? detailedData.answers[idx] : null;
                        const isCorrect = userAnswerIdx === q.correct;
                        const notAttempted = userAnswerIdx === null || userAnswerIdx === undefined;
                        const isCoding = q.type === 'coding' || !q.options || q.options.length === 0;

                        return (
                          <div className="accordion-item border-bottom" key={idx}>
                            <h2 className="accordion-header">
                              <button 
                                className={`accordion-button collapsed py-3 text-start ${!notAttempted && !isCorrect ? 'bg-danger-subtle' : ''}`} 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target={`#collapse${idx}`}
                                style={{ fontSize: '0.85rem' }}
                              >
                                <div className="d-flex align-items-start gap-2">
                                  <span className={`badge ${notAttempted ? 'bg-secondary' : isCorrect ? 'bg-success' : 'bg-danger'} rounded-pill me-2`} style={{ minWidth: '40px' }}>
                                    Q{idx + 1}
                                  </span>
                                  <span className="text-truncate d-inline-block" style={{ maxWidth: '250px' }}>
                                    {q.question || "Coding Challenge"}
                                  </span>
                                </div>
                              </button>
                            </h2>
                            <div id={`collapse${idx}`} className="accordion-collapse collapse" data-bs-parent="#questionsAccordion">
                              <div className="accordion-body bg-light-subtle rounded-3 p-3">
                                {isCoding ? (
                                  <div className="coding-answer">
                                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Student Submission</small>
                                    <pre className="bg-dark text-success p-3 rounded mt-2 overflow-x-auto" style={{ fontSize: '0.75rem' }}>
                                      {userAnswerIdx || "# No code submitted"}
                                    </pre>
                                  </div>
                                ) : (
                                  <div className="options-list">
                                    <small className="text-muted text-uppercase fw-bold d-block mb-2" style={{ fontSize: '0.65rem' }}>Options Analysis</small>
                                    {q.options?.map((opt, optIdx) => {
                                      const isUserChoice = userAnswerIdx === optIdx;
                                      const isCorrectOpt = q.correct === optIdx;
                                      let bgColor = "";
                                      if (isUserChoice && isCorrectOpt) bgColor = "bg-success-subtle text-success border-success";
                                      else if (isUserChoice && !isCorrectOpt) bgColor = "bg-danger-subtle text-danger border-danger";
                                      else if (isCorrectOpt) bgColor = "bg-success-subtle opacity-75 border-success";

                                      return (
                                        <div key={optIdx} className={`p-2 rounded border mb-1 d-flex justify-content-between align-items-center ${bgColor}`} style={{ fontSize: '0.8rem' }}>
                                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                          {isCorrectOpt && <i className="bi bi-patch-check-fill text-success"></i>}
                                          {isUserChoice && !isCorrectOpt && <i className="bi bi-x-circle-fill text-danger"></i>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light rounded-4 border border-dashed">
                      <p className="text-muted small mb-0">
                         {fetchingDetails ? "Fetching question data..." : "Details not found for this report."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="mb-4 mt-5">
                  <h6 className="text-success mb-3">💡 Recommendations</h6>
                  <div className="alert alert-success">
                    <p className="mb-0">{selectedReport.recommendations || "Contact student for further discussion"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button className="btn btn-primary btn-sm py-2" onClick={handleContactStudent}>
                    <i className="bi bi-envelope me-1"></i> Contact Student
                  </button>
                  <button className="btn btn-outline-warning btn-sm" onClick={handleScheduleRetake}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Schedule Retake
                  </button>
                  <button className="btn btn-outline-info btn-sm" onClick={handleFullReport}>
                    <i className="bi bi-file-text me-1"></i> Download PDF Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportTable({ reports, selectedId, onSelect, emptyMessage, isCheatedView = false }) {
  const [showAll, setShowAll] = useState(false);

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-5 bg-light rounded-3 border-dashed">
        <i className="bi bi-check2-circle text-success fs-3"></i>
        <p className="mt-2 mb-0 text-muted small">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
        <thead className="table-light">
          <tr>
            <th className="ps-3" style={{ width: '50px' }}>S.No</th>
            <th>Student</th>
            <th>Exam Type</th>
            {isCheatedView ? (
              <th className="text-danger">Violation Detail</th>
            ) : (
              <>
                <th>Score</th>
                <th>%</th>
              </>
            )}
            <th className="text-end pe-3">Record Info</th>
          </tr>
        </thead>
        <tbody>
          {(showAll ? reports : reports.slice(0, 5)).map((report, idx) => (
            <tr
              key={report.id}
              className={`${selectedId === report.id ? "table-primary shadow-sm" : ""} transition-all`}
              onClick={() => onSelect(report)}
              style={{ cursor: "pointer" }}
            >
              <td className="ps-3 fw-bold text-muted">{idx + 1}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                   <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                      {report.user?.username?.charAt(0).toUpperCase() || "U"}
                   </div>
                   <span className="fw-bold text-dark">{report.user?.username || "Unknown"}</span>
                </div>
              </td>
              <td className="text-muted">
                {report.examTitle ? report.examTitle : (() => {
                   const type = (report.examType || "Daily").charAt(0).toUpperCase() + (report.examType || "Daily").slice(1).toLowerCase();
                   const num = report.attemptNumber || "";
                   return `${type} Exam ${num}`;
                })()}
              </td>
              
              {isCheatedView ? (
                <td className="text-danger">
                  <span className="d-inline-flex align-items-center gap-1 fw-medium">
                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '0.7rem' }}></i>
                    {report.failureReason ? (
                      report.failureReason.length > 50 
                        ? report.failureReason.substring(0, 50) + "..." 
                        : report.failureReason
                    ) : "Proctoring Alert"}
                  </span>
                </td>
              ) : (
                <>
                  <td className="fw-medium">{report.score}/{report.totalMarks}</td>
                  <td>
                    <span className={Number(report.percentage) < 30 ? "text-danger fw-bold" : ""}>
                      {report.percentage}%
                    </span>
                  </td>
                </>
              )}

              <td className="text-end pe-3">
                <div className="d-flex flex-column align-items-end">
                   <span className={`badge ${
                      (report.normalizedStatus || '') === 'fail' ? 'bg-danger-subtle text-danger' :
                      (report.normalizedStatus || '').includes('cheat') ? 'bg-warning-subtle text-warning-emphasis' :
                      'bg-secondary-subtle text-secondary'
                    } rounded-pill px-2`} style={{ fontSize: '0.65rem' }}>
                      {report.status}
                    </span>
                    <small className="text-muted mt-1" style={{ fontSize: '0.6rem' }}>
                       {new Date(report.examDate).toLocaleDateString()}
                    </small>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {reports.length > 5 && (
        <div className="text-center mt-3 pt-2 border-top">
          <button 
            type="button"
            className="btn btn-outline-secondary btn-sm px-4 rounded-pill text-decoration-none" 
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(!showAll);
            }}
            style={{ fontSize: '0.75rem' }}
          >
            {showAll ? "Show Less" : `View ${reports.length - 5} More Incidents`}
          </button>
        </div>
      )}
    </div>
  );
}

function FilterCard({ title, value, active, onClick, color, subtitle }) {
  return (
    <div className="col-md-4 mb-3">
      <button
        type="button"
        className={`w-100 p-3 rounded shadow-sm border border-${active ? "dark" : "light"} text-start bg-${color} text-white`}
        onClick={onClick}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <strong>{title}</strong>
          <span className="badge bg-white text-dark">{value}</span>
        </div>
        <p className="mb-0 text-white-75">{subtitle}</p>
      </button>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="mb-3">
      <small className="text-muted d-block">{label}</small>
      <div className="fw-semibold">{value}</div>
    </div>
  );
}

export default ExamFailureDashboard;

