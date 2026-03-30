import { useEffect, useMemo, useState } from "react";

function ExamFailureDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("failed");
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

  const summary = useMemo(() => {
    const failed = processedReports.filter((item) => item.normalizedStatus === "fail");
    const cheated = processedReports.filter((item) => item.normalizedStatus.includes("cheat"));
    const lowScore = processedReports.filter((item) => item.percentage < 40);

    return {
      failed: failed.length,
      cheated: cheated.length,
      lowScore: lowScore.length,
      total: processedReports.length,
    };
  }, [processedReports]);

  const filteredReports = useMemo(() => {
    if (activeFilter === "cheated") {
      return processedReports.filter((item) => item.normalizedStatus.includes("cheat"));
    }
    if (activeFilter === "low-score") {
      return processedReports.filter((item) => item.percentage < 40);
    }
    return processedReports.filter((item) => item.normalizedStatus === "fail");
  }, [processedReports, activeFilter]);

  if (loading) {
    return <p className="p-3">Loading exam failure dashboard...</p>;
  }

  return (
    <div className="container mt-3">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="mb-1">Faculty Exam Failure Dashboard</h4>
          <p className="text-muted mb-0">
            Review failed and suspicious exam sessions in one place without replacing the main faculty dashboard.
          </p>
        </div>
        <div>
          <span className="badge bg-danger me-2">Failed: {summary.failed}</span>
          <span className="badge bg-warning text-dark me-2">Cheated: {summary.cheated}</span>
          <span className="badge bg-secondary">Low score: {summary.lowScore}</span>
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
