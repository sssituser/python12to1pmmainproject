import React, { useEffect, useState } from "react";

function Exams() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const today = new Date();
      if (today.toLocaleDateString() !== date.toLocaleDateString()) {
        setDate(today);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [date]);

  return (
    <div className="container mt-2">
      
      <h1>Finished Exams</h1>

      <div className="row">

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Daily Exam 1</h4>
            </div>

            <div className="card-body">

              <div className="d-flex justify-content-between">
                <span>Start Date</span>
                <span>{date.toLocaleDateString()}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Start Time</span>
                <span>7:00 PM</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>End Time</span>
                <span>11:00 PM</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Duration</span>
                <span>30 mins</span>
              </div>

              <div className="text-danger mt-2">
                Unattempted
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Exams;