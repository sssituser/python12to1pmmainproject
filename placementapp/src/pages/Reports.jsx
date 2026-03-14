import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Reports = () => {

  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/exam/sessions/")
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.log(err));
  }, []);

  const deleteReport = (id) => {
    fetch(`http://127.0.0.1:8000/api/exam/${id}/delete/`, {
      method: "DELETE"
    }).then(() => {
      setReports(reports.filter(r => r.id !== id));
    });
  };

  const downloadReport = (report) => {

    const content = `
Student: ${report.student_name}
Email: ${report.student_email}
Score: ${report.score}/${report.total_marks}
Status: ${report.status}
Date: ${report.created_at}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-report.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (

    <div className="p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Exam Reports</h1>

        <button
          onClick={() => navigate("/dashboard/playground")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Take Exam
        </button>
      </div>

      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (

        <table className="w-full border">

          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Student</th>
              <th>Email</th>
              <th>Score</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {reports.map(r => (

              <tr key={r.id} className="border">

                <td className="p-2">{r.student_name}</td>
                <td>{r.student_email}</td>
                <td>{r.score}/{r.total_marks}</td>
                <td>{r.status}</td>
                <td>{r.created_at}</td>

                <td className="space-x-2">

                  <button
                    onClick={() => downloadReport(r)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => deleteReport(r.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
};

export default Reports;