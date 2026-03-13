import { useNavigate } from "react-router-dom";

function ExamReports() {

const navigate = useNavigate();

return (

            <div className="container mt-5">
              <div className="row">
                <div className="col-md-3">
                  <div className="card text-center">
                      <h5>Daily Exam</h5>
                      <button
                      className="btn btn-success"
                      onClick={() => navigate("/daily-exams")}
                      >
                      View
                      </button>
                  </div>
                  </div>

            <div className="col-md-3">
                    <div className="card text-center">
                    <h5>Weekly Exam</h5>
                    <button className="btn btn-secondary">
                    Coming Soon
                    </button>
                    </div>
            </div>

            <div className="col-md-3">
                <div className="card text-center">
                <h5>Monthly Exam</h5>
                <button className="btn btn-secondary">
                Coming Soon
                </button>
                </div>
            </div>

            </div>
            </div>
            );

}

export default ExamReports;