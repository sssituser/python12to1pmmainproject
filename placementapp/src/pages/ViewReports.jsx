import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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
  const content = `Student: ${r.name} Score: ${r.score}/30 Date: ${r.date}`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "exam-result.txt";
  a.click();
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