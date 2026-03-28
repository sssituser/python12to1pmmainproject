import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from 'jspdf';

function ViewReports() {

 const navigate = useNavigate();
 const { id } = useParams();

 const [reports, setReports] = useState([]);
 const [selected, setSelected] = useState(null);

 // Fetch all reports
 useEffect(() => {
  axios.get("http://127.0.0.1:8000/api/exam-reports/")
   .then(res => setReports(res.data))
   .catch(err => console.error(err));
 }, []);

 // Fetch single report
 useEffect(() => {
  if (id) {
   axios.get(`http://127.0.0.1:8000/api/report/${id}/`)
    .then(res => setSelected(res.data))
    .catch(err => console.error(err));
  }
 }, [id]);

 const handleBack = () => {
  navigate("/dashboard/daily-exams");
 };

 const handleView = (report) => {
  navigate(`/dashboard/playground/detailed-results/${report.id}`);
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
    doc.text(`Student: ${r.name}`, 20, 40);
    doc.text(`Score: ${r.score}/30`, 20, 50);
    doc.text(`Exam: ${r.exam}`, 20, 60);
    doc.text(`Date: ${r.date}`, 20, 70);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 90, { align: 'center' });
    
    // Save the PDF
    doc.save(`exam-report-${r.name.replace(/\s+/g, '_')}.pdf`);
  };

 // Detail View
 if (selected) {
  return (
   <div className="p-6">

    <button onClick={handleBack}>← Back</button>

    <h2>Report Detail</h2>

    <p>Name: {selected.name}</p>
    <p>Score: {selected.score}/{selected.total}</p>
    <p>Exam: {selected.exam}</p>
    <p>Date: {selected.date}</p>

   </div>
  );
 }

 // List View
 return (
  <div className="p-6">

   <h2>Exam Reports</h2>

   {reports.length === 0 ? (
    <p>No reports available</p>
   ) : (
    reports.map((r) => (
     <div key={r.id}>

      <span>{r.exam} - {r.score}/30</span>

      <button onClick={() => handleView(r)}>View</button>
      <button onClick={() => handleDownload(r)}>Download</button>

     </div>
    ))
   )}

  </div>
 );
}

export default ViewReports;