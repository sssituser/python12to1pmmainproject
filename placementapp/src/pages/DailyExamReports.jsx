import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const exams = [
{ id: 65, score: 0, total: 30 },
{ id: 64, score: 0, total: 20 },
{ id: 63, score: 26, total: 30 },
{ id: 62, score: 28, total: 30 },
{ id: 61, score: 26, total: 30 },
];

function DailyExamReports() {

return (

<div className="container mt-4">

  <div className="row">

    {exams.map((exam) => {

      const percentage = (exam.score / exam.total) * 100;

      return (

        <div className="col-md-4 mb-4" key={exam.id}>

          <div className="card p-3 text-center shadow">

            <h6>Daily-Exam-{exam.id}</h6>

            <div style={{ width: "120px", margin: "auto" }}>
              <CircularProgressbar
                value={percentage}
                text={`${percentage.toFixed(1)}%`}
              />
            </div>

            <p className="mt-2">
              Score {exam.score}/{exam.total}
            </p>

            <button className="btn btn-primary">
              View Detailed Report
            </button>

          </div>

        </div>

      );

    })}

  </div>

</div>

);
}

export default DailyExamReports;