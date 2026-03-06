import React, { useEffect, useState } from 'react'

function Exams() {
  const [date, setDate] = useState(new Date());
  useEffect(()=>{
    const timer=setInterval(()=>{
      const today=new Date();
    if(today.toLocaleDateString()!=date.toLocaleDateString()){
      setDate(today);
    }
  },1000*60);
  return () => clearInterval(timer);
},[date]);





  return (
    <div className='container mt-2'>
      <h1>Finished Exams</h1>
      <br />
      <div className='row'>
        <div className='col-lg-4'>
          <div className='card rounded-bottom-4 rounded-top-4'>
            <div className='card-header bg-primary text-white rounded-top-4 '>
              <h2>Daily-Exam-1</h2>
            </div>
            <div className='card-body rounded-bottom-4'>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-calendar"></i> Start Date</h5>
                <h5>{date.toLocaleDateString()}</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock"></i> Window Start Time</h5>
                <h5>7:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock-history"></i> Window End Time</h5>
                <h5>11:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-hourglass-split"></i> Duration</h5>
                <h5>30 Mins</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-book"></i> Subjects</h5>
                <h5>Statistics</h5>
              </div>

              <div className='mt-3 justify-content-start d-flex'>
                <h5 className='text-danger'>
                   Unattempted
                </h5>
               <h5> <i className="bi bi-x-circle"></i></h5>
              </div>

            </div>
          </div>
        </div>
         <div className='col-lg-4'>
          <div className='card rounded-top-4 rounded-bottom-4'>
            <div className='card-header bg-primary text-white rounded-top-4'>
              <h2>Daily-Exam-2</h2>
            </div>
            <div className='card-body rounded-bottom-4'>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-calendar"></i> Start Date</h5>
                <h5>{date.toLocaleDateString()}</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock"></i> Window Start Time</h5>
                <h5>7:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock-history"></i> Window End Time</h5>
                <h5>11:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-hourglass-split"></i> Duration</h5>
                <h5>30 Mins</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-book"></i> Subjects</h5>
                <h5>Statistics</h5>
              </div>

              <div className='mt-3 justify-content-start d-flex'>
                <h5 className='text-danger'>
                   Unattempted
                </h5>
               <h5> <i className="bi bi-x-circle"></i></h5>
              </div>

            </div>
          </div>
        </div>
         <div className='col-lg-4'>
          <div className='card rounded-top-4 rounded-bottom-4'>
            <div className='card-header bg-primary text-white rounded-top-4'>
              <h2>Daily-Exam-3</h2>
            </div>
            <div className='card-body rounded-bottom-4'>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-calendar"></i> Start Date</h5>
                <h5>{date.toLocaleDateString()}</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock"></i> Window Start Time</h5>
                <h5>7:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock-history"></i> Window End Time</h5>
                <h5>11:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-hourglass-split"></i> Duration</h5>
                <h5>30 Mins</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-book"></i> Subjects</h5>
                <h5>Statistics</h5>
              </div>

              <div className='mt-3 justify-content-start d-flex'>
                <h5 className='text-danger'>
                   Unattempted
                </h5><br/>
               <h5> <i className="bi bi-x-circle"></i></h5>
              </div>

            </div>
          </div>
        </div>
        <div className='col-lg-4 mt-3'>
          <div className='card rounded-top-4 rounded-bottom-4'>
            <div className='card-header bg-primary text-white rounded-top-4'>
              <h2>Daily-Exam-3</h2>
            </div>
            <div className='card-body rounded-bottom-4'>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-calendar"></i> Start Date</h5>
                <h5>{date.toLocaleDateString()}</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock"></i> Window Start Time</h5>
                <h5>7:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-clock-history"></i> Window End Time</h5>
                <h5>11:00 PM</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-hourglass-split"></i> Duration</h5>
                <h5>30 Mins</h5>
              </div>

              <div className='d-flex justify-content-between mt-3'>
                <h5><i className="bi bi-book"></i> Subjects</h5>
                <h5>Statistics</h5>
              </div>

              <div className='mt-3 justify-content-start d-flex'>
                <h5 className='text-danger'>
                   Unattempted
                </h5><br/>
               <h5> <i className="bi bi-x-circle"></i></h5>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default Exams