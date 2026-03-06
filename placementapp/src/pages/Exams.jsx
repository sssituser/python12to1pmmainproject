import React, { useState, useEffect, useRef } from "react";

function ExamPage() {

  const videoRef = useRef(null);

  const questions = [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Text Machine Language",
        "Hyperlinks and Text Markup Language",
        "Home Tool Markup Language"
      ],
      answer: 0
    },
    {
      question: "Which language is used for React?",
      options: ["Python", "Java", "JavaScript", "C++"],
      answer: 2
    }
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(60);

  // TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Exam Finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // WEBCAM
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <h2>Online Exam</h2>

      {/* Timer */}
      <h3>Time Left: {time} seconds</h3>

      {/* Webcam */}
      <video
        ref={videoRef}
        autoPlay
        width="200"
        style={{ border: "2px solid black" }}
      />

      <hr/>

      {/* Question */}
      <h3>{questions[current].question}</h3>

      {questions[current].options.map((opt, index) => (
        <div key={index}>
          <input
            type="radio"
            name="option"
            onChange={() => setSelected(index)}
          />
          {opt}
        </div>
      ))}

      <br/>

      {/* Next Button */}
      <button
        onClick={() => {
          setSelected(null);
          setCurrent(current + 1);
        }}
      >
        Next
      </button>

    </div>
  );
}

export default ExamPage;