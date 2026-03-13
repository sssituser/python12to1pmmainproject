import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const exams = [
{ id: 1, score: 0, total: 30 },
{ id: 2, score: 15, total: 20 },
{ id: 3, score: 26, total: 30 },
{ id: 4, score: 28, total: 30 },
{ id: 5, score: 26, total: 30 },
];

function DailyExamReports() {

const getColor = (percentage) => {
if (percentage >= 80) return "#16a34a";
if (percentage >= 60) return "#eab308";
return "#ef4444";
};

return (

<div className="p-6">

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">

    {exams.map((exam) => {

      const percentage = (exam.score / exam.total) * 100;
      const color = getColor(percentage);

      return (

        <div
          key={exam.id}
          className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition"
        >

          <h2 className="text-base font-semibold mb-3">
            Daily-Exam-{exam.id}
          </h2>

          <div className="w-20 mx-auto">

            <CircularProgressbar
              value={percentage}
              text={`${percentage.toFixed(1)}%`}
              styles={buildStyles({
                pathColor: color,
                textColor: color,
                trailColor: "#e5e7eb"
              })}
            />

          </div>

          <p className="mt-3 text-sm text-gray-600">
            Score {exam.score}/{exam.total}
          </p>

          <button className="mt-3 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition">
            View Report
          </button>

        </div>

      );

    })}

  </div>

</div>

);
}

export default DailyExamReports;