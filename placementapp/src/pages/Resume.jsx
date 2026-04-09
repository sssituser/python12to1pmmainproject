import React, { useState } from "react";

export default function Resume() {

  const [resume, setResume] = useState(null);
  const [resumeURL, setResumeURL] = useState("");

  // store selected file
  function handleFile(e) {
    setResume(e.target.files[0]);
  }

  // upload button
  function uploadResume() {
    if (resume) {
      const url = URL.createObjectURL(resume);
      setResumeURL(url);
      console.log("Resume Uploaded Successfully");
    } else {
      console.error("Please select a file");
    }
  }

  return (
    <div className="container mt-4">

      {/* Upload Resume Card */}
      <div className="card p-4 mb-4">
        <h4>Upload Resume</h4>

        <div className="d-flex gap-3 mt-3">
          <input
            type="file"
            onChange={handleFile}
            className="form-control"
          />

          <button
            className="btn btn-primary"
            onClick={uploadResume}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Your Resume Card */}
      <div className="card p-4 mb-4">
        <h4>Your Resume</h4>

        <div className="d-flex gap-3 mt-3">

          {/* View Resume */}
          <button
            className="btn btn-outline-primary mt-3 w-25"
            data-bs-toggle="modal"
            data-bs-target="#resumeModal"
          >
            View Resume
          </button>

          {/* View Resume Score */}
          <button
            className="btn btn-outline-success mt-3 w-25"
            data-bs-toggle="modal"
            data-bs-target="#scoreModal"
          >
            View Resume Score
          </button>

        </div>
      </div>

      {/* ATS Score Card */}
      <div className="card shadow p-4 mb-4 text-center bg-primary">

        <h4 className="mb-1 text-white">ATS Resume Score</h4>

        <h1 className="display-3 text-warning fw-bold">
          72<span style={{ fontSize: "20px" }}>/100</span>
        </h1>

        <p className="text-light">
          Your resume is moderately optimized for ATS systems.
        </p>

        <div className="progress mt-1">
          <div
            className="progress-bar bg-danger"
            role="progressbar"
            style={{ width: "72%" }}
          ></div>
        </div>

      </div>

      {/* Resume Preview Modal */}
      <div className="modal fade" id="resumeModal">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Resume Preview</h5>
              <button
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">

              {resumeURL ? (
                <iframe
                  src={resumeURL}
                  width="100%"
                  height="600px"
                  title="Resume"
                ></iframe>
              ) : (
                <h5>No Resume Uploaded</h5>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* Resume Score Modal */}
      <div className="modal fade" id="scoreModal">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                Resume Score Analysis
              </h5>

              <button
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">

              {/* Header */}
              <div className="text-center mb-4">

                <h4 className="bg-primary text-white p-2">
                  Resume Analysis Results
                </h4>

                <h1 className="display-4 text-primary">
                  72.4
                </h1>

                <p className="text-danger">
                  Needs Improvement
                </p>

              </div>

              {/* Feedback Section */}
              <div className="row">

                {/* Detailed Feedback */}
                <div className="col-md-6">

                  <h5>Detailed Feedback</h5>

                  <p>
                    <b>Skills</b><br />
                    Only 1 skill detected. Add 6–8 relevant technical skills to improve ATS matching.
                  </p>

                  <p>
                    <b>Sections</b><br />
                    Include internships, part-time work, or volunteer experience to demonstrate practical application.
                  </p>

                  <p>
                    <b>Formatting</b><br />
                    Use well-structured sections with bullet points and consistent spacing.
                  </p>

                </div>

                {/* Skills Analysis */}
                <div className="col-md-6">

                  <h5>Skills Analysis</h5>

                  <p>
                    <b>Extracted Skills</b><br />
                    No extracted skills found.
                  </p>

                  <p>
                    <b>Suggested Skills</b><br />
                    JavaScript, React, HTML, CSS, Git, SQL
                  </p>

                </div>

              </div>

              <hr />

              {/* Word Count */}
              <div className="text-center">

                <b>Total Words in Resume</b>
                <p>1708</p>

              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
