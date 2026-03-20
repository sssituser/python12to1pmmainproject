import React from "react";

const exams = [
  {
    id: 1,
    title: "Daily Exam 1",
    date: "2026-03-18T19:00:00",
    duration: "30 mins",
    status: "Unattempted"
  }
];

const getStatusStyle = (status) => {
  if (status === "Completed")
    return "bg-success-subtle text-success";
  if (status === "Unattempted")
    return "bg-danger-subtle text-danger";
  return "bg-warning-subtle text-warning";
};

const getCountdown = (date) => {
  const diff = new Date(date) - new Date();
  if (diff <= 0) return "Started";

  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);

  return `${hrs}h ${mins % 60}m left`;
};

function Exams() {
  const attempted = exams.filter(e => e.status === "Completed").length;
  const pending = exams.filter(e => e.status === "Unattempted").length;

  return (
    <div className="container py-4">

      {/* HEADER */}
      <h2 className="fw-bold mb-4">📊 Exams Dashboard</h2>

      {/* STATS */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3 shadow-sm border-0 rounded-4 text-center">
            <h6 className="text-muted">Attempted</h6>
            <h2 className="text-success">{attempted}</h2>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow-sm border-0 rounded-4 text-center">
            <h6 className="text-muted">Pending</h6>
            <h2 className="text-danger">{pending}</h2>
          </div>
        </div>
      </div>

      {/* EXAMS */}
      <div className="row">

        {exams.map((exam) => (
          <div className="col-md-4 mb-4" key={exam.id}>

            <div className="card border-0 shadow-sm rounded-4 exam-card">

              {/* HEADER */}
              <div className="bg-primary text-white p-3 rounded-top-4 d-flex justify-content-between">
                <h5 className="mb-0">{exam.title}</h5>
                <span className="badge bg-light text-primary">NEW</span>
              </div>

              {/* BODY */}
              <div className="p-3">

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">📅 Date</span>
                  <span>{new Date(exam.date).toLocaleDateString()}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">⏰ Time</span>
                  <span>{new Date(exam.date).toLocaleTimeString()}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">⌛ Duration</span>
                  <span>{exam.duration}</span>
                </div>

                {/* COUNTDOWN */}
                <div className="text-center my-2 text-primary fw-semibold">
                  {getCountdown(exam.date)}
                </div>

                {/* STATUS + ACTION */}
                <div className="d-flex justify-content-between align-items-center mt-3">

                  <span className={`badge px-3 py-2 rounded-pill ${getStatusStyle(exam.status)}`}>
                    {exam.status}
                  </span>

                  <button className="btn btn-sm btn-primary">
                    {exam.status === "Completed" ? "View" : "Start"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Exams;