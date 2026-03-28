import { useNavigate } from "react-router-dom";
function ExamReports() {
  const navigate = useNavigate();
  return (

    <div className="container mt-5">

      <h2 className="text-center mb-4">Exam Reports</h2>

      <div className="row">

        <div className="col-md-3">
          <div className="card text-center p-3 shadow">

            <h5>Daily Exam</h5>

            <button
              className="btn btn-success"
              onClick={() => navigate("/dashboard/daily-exams")}
            >
              VIEW
            </button>

          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Weekly Exam</h5>
            <button
              className="btn btn-success"
              onClick={() => navigate("/dashboard/weekly-exams")}
            >
              VIEW
            </button>
          </div>
        </div>


        {/* <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Weekly Exam</h5>
            <button className="btn btn-secondary">
              COMING SOON
            </button>
          </div>
        </div> */}

        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Monthly Exam</h5>
            <button
              className="btn btn-success"
              onClick={() => navigate("/dashboard/monthly-exams")}
            >
              VIEW
            </button>
          </div>
        </div> 

        {/* <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Monthly Exam</h5>
            <button className="btn btn-secondary">
              COMING SOON
            </button>
          </div>
        </div> */}


        <div className="col-md-3">
          <div className="card text-center p-3 shadow">
            <h5>Grand Exam</h5>
            <button className="btn btn-secondary">
              COMING SOON
            </button>
          </div>
        </div>

      </div>
    </div>

  );
}

export default ExamReports;