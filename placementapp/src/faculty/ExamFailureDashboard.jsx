import jsPDF from "jspdf";
import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Alert, Spinner } from "react-bootstrap";
import axios from "axios";

function ExamFailureDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("failed");
  const [activePeriod, setActivePeriod] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🚀 Starting fetchReports for faculty dashboard...");
      
      // For faculty dashboard, we want ALL exam results, not just for one user
      // Remove username filter to get all student results
      console.log("🌐 Fetching ALL exam results for faculty dashboard...");
      
      // Use the all-exam-results endpoint to get all student data
      const response = await fetch("/api/all-exam-results/");
      console.log("� API response status:", response.status);
      
      const json = await response.json();
      console.log("📊 Full API response:", json);

      let examList = [];
      
      // Handle different response structures
      if (json.success && json.data) {
        examList = json.data;
      } else if (Array.isArray(json)) {
        examList = json;
      } else if (json.data && Array.isArray(json.data)) {
        examList = json.data;
      } else if (json.results && Array.isArray(json.results)) {
        examList = json.results;
      } else {
        console.log("⚠️ Unexpected response structure, trying to find array data...");
        // Try to find any array in the response
        const arrayKeys = Object.keys(json).filter(key => Array.isArray(json[key]));
        if (arrayKeys.length > 0) {
          examList = json[arrayKeys[0]];
          console.log("� Found array in key:", arrayKeys[0]);
        }
      }
      
      console.log("✅ Successfully fetched", examList.length, "results");
      if (examList.length > 0) {
        console.log("📋 Sample result:", examList[0]);
      }
      
      // Check for examFailure in localStorage (same as PlaygroundResults)
      const examFailure = localStorage.getItem("examFailure");
      console.log("🔍 examFailure in localStorage:", examFailure);
      if (examFailure) {
        const failedResult = JSON.parse(examFailure);
        examList = [failedResult, ...examList];
        localStorage.removeItem("examFailure");
        console.log("➕ Added examFailure from localStorage, total now:", examList.length);
      }
      
      console.log("🎯 Final examList:", examList.length, "items");
      console.log("📝 Setting reports and selected report...");
      
      setReports(examList);
      if (examList.length) {
        setSelectedReport(examList[0]);
        console.log("✅ Selected first report:", examList[0]);
      } else {
        console.log("⚠️ No reports to select");
        setSelectedReport(null);
        setError("No exam results found. Students may not have taken any exams yet.");
      }
      
    } catch (err) {
      console.error("❌ Failed to load exam reports:", err);
      
      // Fallback to localStorage on network error (same as PlaygroundResults)
      const results = JSON.parse(localStorage.getItem("allExamResults") || "[]");
      console.log("💾 localStorage fallback:", results.length, "items");
      
      if (results.length > 0) {
        console.log("📦 Using localStorage data");
        setReports(results);
        setSelectedReport(results[0]);
        setError("Using cached data from localStorage due to network error.");
      } else {
        console.log("📭 No cached data available");
        setReports([]);
        setSelectedReport(null);
        setError(`Failed to load exam data: ${err.message}. No cached data available.`);
      }
    } finally {
      console.log("🏁 fetchReports completed");
      setLoading(false);
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
      const score = Number(item.score) || 0;
      const totalMarks = Number(item.totalMarks) || Number(item.total_marks) || 1;
      const percentage = item.percentage !== undefined 
        ? Number(item.percentage) 
        : totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      
      return {
        ...item,
        id: item.id || Math.random().toString(36).substr(2, 9),
        percentage,
        normalizedStatus: (item.status || "").toLowerCase(),
        examDate: item.examDate || item.created_at || new Date().toISOString(),
        user: item.user || { username: item.studentName || item.username || "Unknown" },
        examTitle: item.examTitle || item.exam_name || item.title || "Unknown Exam",
        score,
        totalMarks,
      };
    });
  }, [reports]);

  const periodReports = useMemo(() => {
    if (processedReports.length === 0) {
      return [];
    }
    
    const filtered = processedReports.filter((item) => {
      const title = (item.examTitle || "").toLowerCase();
      const examDate = new Date(item.examDate);
      
      // Check if it's a daily exam (by title)
      const isDaily = title.includes("daily") || title.includes("day");
      
      // Check if it's a weekly exam (by title)
      const isWeekly = (title.includes("weekly") || title.includes("week")) && !isDaily;
      
      // Check if it's a monthly exam (by title)
      const isMonthly = (title.includes("monthly") || title.includes("month")) && !isDaily && !isWeekly;
      
      if (activePeriod === "daily") {
        return isDaily;
      }
      if (activePeriod === "weekly") {
        return isWeekly;
      }
      if (activePeriod === "monthly") {
        return isMonthly;
      }
      
      // Default: show all
      return true;
    });
    
    return filtered;
  }, [processedReports, activePeriod]);

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
      filtered = periodReports.filter((item) => 
        item.normalizedStatus.includes("cheat") || 
        item.normalizedStatus.includes("suspicious")
      );
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
      doc.setFontSize(16);
      doc.text("Exam Failure Dashboard Report", 14, 20);
      
      // Add timestamp
      const timestamp = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 14, 28);
      
      doc.setFontSize(11);
      doc.text(`Scope: ${activePeriod === "all" ? "All Exams" : activePeriod === "daily" ? "Daily Exam" : activePeriod === "weekly" ? "Weekly Exam" : "Monthly Exam"}`, 14, 30);
      doc.text(`Filter: ${activeFilter === "cheated" ? "Cheated" : activeFilter === "low-score" ? "Low score" : "Failed"}`, 14, 36);
      doc.text(`Records: ${filteredReports.length}`, 14, 42);

      doc.setFontSize(12);
      doc.text("Summary", 14, 54);
      doc.setFontSize(10);
      doc.text(`Failed: ${summary.failed}`, 14, 62);
      doc.text(`Cheated: ${summary.cheated}`, 14, 69);
      doc.text(`Low score: ${summary.lowScore}`, 14, 76);
      doc.text(`Total ${activePeriod === "all" ? "all" : activePeriod === "daily" ? "daily" : activePeriod === "weekly" ? "weekly" : "monthly"} exams: ${summary.total}`, 14, 83);

      let y = 101;
      doc.setFontSize(11);
      doc.text("Detailed Records", 14, y);
      y += 8;
      
      filteredReports.slice(0, 30).forEach((report, index) => {
        const student = report.user?.username || "Unknown";
        const exam = report.examTitle || "N/A";
        const status = report.status || "N/A";
        const percent = `${report.percentage || 0}%`;
        const score = `${report.score || 0}/${report.totalMarks || 0}`;
        const line = `${index + 1}. ${student} | ${exam} | ${score} (${percent}) | ${status}`;
        
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(9);
        doc.text(line, 14, y);
        y += 7;
      });
      
      // Add footer
      doc.setFontSize(8);
      doc.text("Report generated from Faculty Exam Failure Dashboard", 14, 285);
      
      doc.save(`exam-failure-report-${activePeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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
            <div className="border rounded-4 p-3 h-100">
              <small className="text-uppercase text-muted">Scope</small>
              <h5 className="mt-2 mb-0">
                {activePeriod === "all" ? "All Exams" : 
                 activePeriod === "daily" ? "Daily Exam" : 
                 activePeriod === "weekly" ? "Weekly Exam" : 
                 "Monthly Exam"}
              </h5>
            </div>
          </div>
          <div className="col">
            <div className="rounded-4 p-3 h-100 bg-danger text-white">
              <small className="text-uppercase">Failed</small>
              <h3 className="mt-2 mb-0">{summary.failed}</h3>
            </div>
          </div>
          <div className="col">
            <div className="rounded-4 p-3 h-100 bg-warning text-dark">
              <small className="text-uppercase">Cheated</small>
              <h3 className="mt-2 mb-0">{summary.cheated}</h3>
            </div>
          </div>
          <div className="col">
            <div className="rounded-4 p-3 h-100 bg-secondary text-white">
              <small className="text-uppercase">Low Score</small>
              <h3 className="mt-2 mb-0">{summary.lowScore}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === "failed" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveFilter("failed")}
          >
            Failed
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === "cheated" ? "btn-warning text-dark" : "btn-outline-warning text-dark"}`}
            onClick={() => setActiveFilter("cheated")}
          >
            Cheated
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeFilter === "low-score" ? "btn-secondary text-white" : "btn-outline-secondary text-dark"}`}
            onClick={() => setActiveFilter("low-score")}
          >
            Low Score
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <FilterCard
          title="Failed"
          value={summary.failed}
          active={activeFilter === "failed"}
          onClick={() => setActiveFilter("failed")}
          color="danger"
          subtitle="Confirmed failure records"
        />
        <FilterCard
          title="Cheated"
          value={summary.cheated}
          active={activeFilter === "cheated"}
          onClick={() => setActiveFilter("cheated")}
          color="warning"
          subtitle="Suspicious / proctoring alerts"
        />
        <FilterCard
          title="Low score"
          value={summary.lowScore}
          active={activeFilter === "low-score"}
          onClick={() => setActiveFilter("low-score")}
          color="secondary"
          subtitle="Below 40% score"
        />
      </div>

      <div className="row">
        <div className="col-xl-7 mb-4">
          <div className="bg-white p-4 shadow-sm rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Exam failures</h5>
              <small className="text-muted">{filteredReports.length} records</small>
            </div>

            {filteredReports.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                </div>
                <h5 className="text-muted">No {activeFilter.replace('-', ' ')} records found</h5>
                <p className="text-muted">
                  {activePeriod === "weekly" ? "Weekly" : "Monthly"} exam data is not available for this filter.
                </p>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setActiveFilter("failed")}
                >
                  View All Failed Exams
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Score</th>
                      <th>Percent</th>
                      <th>Status</th>
                      <th>Quick Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.slice(0, 8).map((report) => (
                      <tr
                        key={report.id}
                        className={selectedReport?.id === report.id ? "table-primary" : ""}
                        onClick={() => setSelectedReport(report)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{report.user?.username || "Unknown"}</td>
                        <td>{report.examTitle}</td>
                        <td>{report.score}/{report.totalMarks}</td>
                        <td>{report.percentage}%</td>
                        <td>
                          <span className={`badge ${
                            (report.normalizedStatus || '') === 'fail' ? 'bg-danger' :
                            (report.normalizedStatus || '').includes('cheat') ? 'bg-warning text-dark' :
                            (report.normalizedStatus || '').includes('suspicious') ? 'bg-warning text-dark' :
                            'bg-secondary'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted d-block" style={{ maxWidth: '200px' }}>
                            {report.failureReason ? 
                              (report.failureReason.length > 50 ? 
                                report.failureReason.substring(0, 50) + '...' : 
                                report.failureReason
                              ) : 
                              'No reason provided'
                            }
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-xl-5 mb-4">
          <div className="bg-white p-4 shadow-sm rounded h-100">
            <h5 className="mb-3">📋 Exam Analysis & Failure Details</h5>
            {!selectedReport ? (
              <div className="text-center py-5">
                <i className="bi bi-mouse2" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
                <p className="text-muted mt-3">Select a record to view detailed analysis</p>
              </div>
            ) : (
              <div>
                {/* Basic Info */}
                <div className="mb-4">
                  <h6 className="text-primary mb-3">📊 Basic Information</h6>
                  <DetailRow label="Student" value={selectedReport.user?.username || "Unknown"} />
                  <DetailRow label="Exam" value={selectedReport.examTitle} />
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
                  {selectedReport.examTime && (
                    <DetailRow label="Duration" value={selectedReport.examTime} />
                  )}
                </div>

                {/* Failure Analysis */}
                <div className="mb-4">
                  <h6 className="text-danger mb-3">⚠️ Failure Analysis</h6>
                  <div className="alert alert-light border">
                    <strong>Reason:</strong>
                    <p className="mb-0 mt-1">{selectedReport.failureReason || "No detailed reason provided"}</p>
                  </div>
                </div>

                {/* Academic Performance Issues */}
                {selectedReport.weakTopics && selectedReport.weakTopics.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-warning mb-3">📚 Weak Areas Identified</h6>
                    <div className="list-group list-group-flush">
                      {selectedReport.weakTopics.map((topic, index) => (
                        <div key={index} className="list-group-item d-flex align-items-center">
                          <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suspicious Activity */}
                {selectedReport.suspiciousActivity && selectedReport.suspiciousActivity.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-warning mb-3">🔍 Suspicious Activity Detected</h6>
                    <div className="alert alert-warning">
                      <ul className="mb-0">
                        {selectedReport.suspiciousActivity.map((activity, index) => (
                          <li key={index}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="mb-4">
                  <h6 className="text-success mb-3">💡 Recommendations</h6>
                  <div className="alert alert-success">
                    <p className="mb-0">{selectedReport.recommendations || "Contact student for further discussion"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={handleContactStudent}>
                    <i className="bi bi-envelope me-1"></i> Contact Student
                  </button>
                  <button className="btn btn-outline-warning btn-sm" onClick={handleScheduleRetake}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Schedule Retake
                  </button>
                  <button className="btn btn-outline-info btn-sm" onClick={handleFullReport}>
                    <i className="bi bi-file-text me-1"></i> Full Report
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

