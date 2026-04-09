import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

const Reports = () => {

  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:8000/api/exam/sessions/`)
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(err => console.log(err));
  }, []);

  const deleteReport = (id) => {
    fetch(`http://${window.location.hostname}:8000/api/exam/${id}/delete/`, {
      method: "DELETE"
    }).then(() => {
      setReports(reports.filter(r => r.id !== id));
    });
  };

  const downloadReport = (report) => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Report', 105, 20, { align: 'center' });
    
    // Add student information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information:', 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${report.student_name}`, 20, 50);
    doc.text(`Email: ${report.student_email}`, 20, 60);
    
    // Add exam information
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Information:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Score: ${report.score}/${report.total_marks}`, 20, 90);
    doc.text(`Status: ${report.status}`, 20, 100);
    doc.text(`Date: ${report.created_at}`, 20, 110);
    
    // Add percentage
    const percentage = report.total_marks > 0 ? ((report.score / report.total_marks) * 100).toFixed(1) : 0;
    doc.setFont('helvetica', 'bold');
    doc.text('Performance:', 20, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(`Percentage: ${percentage}%`, 20, 140);
    
    // Add result status with color coding
    const passed = percentage >= 50;
    doc.setFont('helvetica', 'bold');
    doc.text(`Result: ${passed ? 'PASSED' : 'FAILED'}`, 20, 160);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 180, { align: 'center' });
    
    // Save the PDF
    doc.save(`exam-report-${report.student_name.replace(/\s+/g, '_')}.pdf`);
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
