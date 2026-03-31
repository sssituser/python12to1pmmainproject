import jsPDF from "jspdf";
import { useEffect, useMemo, useState } from "react";

function ExamFailureDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("failed");
  const [activePeriod, setActivePeriod] = useState("weekly");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch("http://127.0.0.1:8000/api/all-exam-results/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const items = data?.data || [];
      setReports(items);
      if (items.length) setSelectedReport(items[0]);
    } catch (err) {
      console.error("Failed to load exam reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const processedReports = useMemo(() => {
    return reports.map((item) => ({
      ...item,
      percentage:
        item.percentage !== undefined
          ? Number(item.percentage)
          : item.totalMarks
          ? Math.round((Number(item.score || 0) / Number(item.totalMarks || 1)) * 100)
          : 0,
      normalizedStatus: item.status?.toLowerCase() || "",
    }));
  }, [reports]);

  const periodReports = useMemo(() => {
    return processedReports.filter((item) => {
      const title = item.examTitle?.toLowerCase() || "";
      if (activePeriod === "weekly") return title.includes("weekly");
      if (activePeriod === "monthly") return title.includes("monthly");
      return title.includes("weekly") || title.includes("monthly");
    });
  }, [processedReports, activePeriod]);

  const summary = useMemo(() => {
    const failed = periodReports.filter((item) => item.normalizedStatus === "fail");
    const cheated = periodReports.filter((item) => item.normalizedStatus.includes("cheat"));
    const lowScore = periodReports.filter((item) => item.percentage < 40);

    return {
      failed: failed.length,
      cheated: cheated.length,
      lowScore: lowScore.length,
      total: periodReports.length,
    };
  }, [periodReports]);

  const filteredReports = useMemo(() => {
    if (activeFilter === "cheated") {
      return periodReports.filter((item) => item.normalizedStatus.includes("cheat"));
    }
    if (activeFilter === "low-score") {
      return periodReports.filter((item) => item.percentage < 40);
    }
    return periodReports.filter((item) => item.normalizedStatus === "fail");
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
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Exam Failure Dashboard", 14, 20);
    doc.setFontSize(11);
    doc.text(`Scope: ${activePeriod === "weekly" ? "Weekly Exam" : "Monthly Exam"}`, 14, 30);
    doc.text(`Filter: ${activeFilter === "cheated" ? "Cheated" : activeFilter === "low-score" ? "Low score" : "Failed"}`, 14, 36);
    doc.text(`Records: ${filteredReports.length}`, 14, 42);

    doc.setFontSize(12);
    doc.text("Summary", 14, 54);
    doc.setFontSize(10);
    doc.text(`Failed: ${summary.failed}`, 14, 62);
    doc.text(`Cheated: ${summary.cheated}`, 14, 69);
    doc.text(`Low score: ${summary.lowScore}`, 14, 76);
    doc.text(`Total ${activePeriod === "weekly" ? "weekly" : "monthly"} exams: ${summary.total}`, 14, 83);

    let y = 95;
    doc.setFontSize(11);
    doc.text("Records", 14, y);
    y += 8;
    filteredReports.slice(0, 30).forEach((report, index) => {
      const student = report.user?.username || "Unknown";
      const exam = report.examTitle || "N/A";
      const status = report.status || "N/A";
      const percent = `${report.percentage}%`;
      const line = `${index + 1}. ${student} | ${exam} | ${percent} | ${status}`;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 14, y);
      y += 7;
    });
    doc.save(`exam-failure-${activePeriod}.pdf`);
  };

  if (loading) {
    return <p className="p-3">Loading exam failure dashboard...</p>;
  }

  return (
    <div className="container mt-3">
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
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleDownloadPdf}>
              Download PDF
            </button>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mt-4">
          <div className="col">
            <div className="border rounded-4 p-3 h-100">
              <small className="text-uppercase text-muted">Scope</small>
              <h5 className="mt-2 mb-0">{activePeriod === "weekly" ? "Weekly Exam" : "Monthly Exam"}</h5>
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

      <div className="row mb-4">
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
              <p className="text-muted">No records found for this filter.</p>
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
                        <td>{report.status}</td>
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
            <h5 className="mb-3">Session details</h5>
            {!selectedReport ? (
              <p className="text-muted">Select a record to view session details.</p>
            ) : (
              <div>
                <DetailRow label="Student" value={selectedReport.user?.username || "Unknown"} />
                <DetailRow label="Exam" value={selectedReport.examTitle} />
                <DetailRow label="Status" value={selectedReport.status} />
                <DetailRow label="Score" value={`${selectedReport.score}/${selectedReport.totalMarks}`} />
                <DetailRow label="Percentage" value={`${selectedReport.percentage}%`} />
                <DetailRow label="Attempts" value={selectedReport.correctAnswers || 0} />
                <DetailRow label="Date" value={new Date(selectedReport.examDate).toLocaleString()} />
                <div className="mt-3">
                  <h6>Notes</h6>
                  <p className="text-muted mb-0">
                    Use this panel to inspect student exam failures without opening another page.
                  </p>
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

