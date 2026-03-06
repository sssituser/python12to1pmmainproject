import React, { useState, useEffect, useRef } from "react";

function Exams() {

  const videoRef = useRef(null);

  const questions = [
    {q:"Python is developed by?",o:["Guido van Rossum","James Gosling","Dennis Ritchie","Bjarne"],a:0},
    {q:"HTML stands for?",o:["Hyper Text Markup Language","High Text Machine","Home Tool","Hyperlink"],a:0},
    {q:"React uses?",o:["Java","Python","JavaScript","C++"],a:2},
    {q:"CSS is used for?",o:["Design","Database","Server","AI"],a:0},
    {q:"JS extension?",o:[".java",".js",".py",".cpp"],a:1},
    {q:"Frontend library?",o:["React","Node","Django","Flask"],a:0},
    {q:"Database?",o:["MySQL","HTML","CSS","React"],a:0},
    {q:"Backend runtime?",o:["NodeJS","Bootstrap","HTML","CSS"],a:0},
    {q:"Vite is?",o:["Build tool","Database","Language","Framework"],a:0},
    {q:"Programming language?",o:["Python","HTML","CSS","Bootstrap"],a:0},
    {q:"Loop keyword?",o:["for","design","style","layout"],a:0},
    {q:"React uses?",o:["Components","Tables","Servers","Routers"],a:0},
    {q:"JS variable?",o:["let","design","style","grid"],a:0},
    {q:"IDE?",o:["VS Code","Chrome","MySQL","HTML"],a:0},
    {q:"Version control?",o:["Git","React","Node","CSS"],a:0}
  ];

  const [current,setCurrent] = useState(0);
  const [time,setTime] = useState(90);

  // TIMER
  useEffect(()=>{
    const timer=setInterval(()=>{
      setTime(prev=>{
        if(prev<=1){
          clearInterval(timer);
          alert("Exam Finished");
          return 0;
        }
        return prev-1;
      });
    },1000);

    return ()=>clearInterval(timer);
  },[]);

  // WEBCAM
  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({video:true})
    .then(stream=>{
      if(videoRef.current){
        videoRef.current.srcObject=stream;
      }
    })
    .catch(err=>{
      console.log("Webcam error:",err);
    });
  },[]);

  return (

    <div style={{padding:"20px"}}>

      <h2>Online Exam</h2>

      <h3>Time Left: {time} sec</h3>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="200"
        style={{border:"2px solid black"}}
      />

      <hr/>

      <h3>{questions[current].q}</h3>

      {questions[current].o.map((opt,i)=>(
        <div key={i}>
          <input type="radio" name="option"/>
          {opt}
        </div>
      ))}

      <br/>

      {current < questions.length-1 ? (
        <button onClick={()=>setCurrent(current+1)}>Next</button>
      ) : (
        <button onClick={()=>alert("Exam Submitted")}>Submit</button>
      )}

    </div>
  );
}

export default Exams;