import React from "react";

function DashboardSSSIT() {

  const companies = [
    "TCS", "Infosys", "Wipro", "Accenture", "Capgemini",
    "Cognizant", "Tech Mahindra", "Google", "Amazon"
  ];

  const courses = [
    {
      title: "Full Stack Development",
      desc: "React, Django, APIs & real-world projects",
    },
    {
      title: "Data Science",
      desc: "Python, ML, AI & data analysis",
    },
    {
      title: "Cyber Security",
      desc: "Ethical hacking & network security",
    },
    {
      title: "Cloud Computing",
      desc: "AWS, Azure & DevOps practices",
    }
  ];

  const faculty = [
    {
      name: "Dr. Ramesh",
      role: "HOD - CSE",
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Mrs. Kavitha",
      role: "Senior Lecturer",
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Mr. Suresh",
      role: "Placement Officer",
      img: "https://randomuser.me/api/portraits/men/55.jpg"
    }
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen">

      {/* HERO */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 p-12 text-center">
        <h1 className="text-4xl font-bold">SSSIT Computer Education</h1>
        <p className="mt-3 text-gray-300">
          Empowering Students & Faculty with Industry Skills 🚀
        </p>
      </div>

      {/* MARQUEE */}
      <div className="overflow-hidden bg-black py-3">
        <div className="animate-marquee whitespace-nowrap text-white text-lg">
          {companies.map((c, i) => (
            <span key={i} className="mx-6">{c}</span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <div className="p-10 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">About SSSIT</h2>
        <p className="text-gray-400">
          SSSIT Computer Education is a premier institute offering cutting-edge
          courses in software, AI, and cloud technologies. Our mission is to
          empower students with real-world skills and prepare them for global careers.
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 p-10">
        {["5000+ Students", "200+ Placements", "50+ Courses", "20+ Faculty"].map((s, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-center shadow-lg">
            <h3 className="text-xl font-semibold">{s}</h3>
          </div>
        ))}
      </div>

      {/* COURSES */}
      <div className="p-10">
        <h2 className="text-3xl font-bold text-center mb-8">Courses</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {courses.map((course, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-gray-400 mt-2 text-sm">{course.desc}</p>

              <button className="mt-4 border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition w-full">
                Explore Course
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FACULTY */}
      <div className="p-10 bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-8">Faculty</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {faculty.map((f, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-center hover:scale-105 transition"
            >
              <img
                src={f.img}
                alt=""
                className="w-24 h-24 mx-auto rounded-full mb-3 border-2 border-white"
              />
              <h3 className="font-semibold">{f.name}</h3>
              <p className="text-gray-400 text-sm">{f.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* LOCATION */}
      <div className="p-10">
        <h2 className="text-3xl font-bold text-center mb-6">Location</h2>

        <div className="rounded-xl overflow-hidden shadow-lg">
          <iframe
            title="map"
            src="https://www.google.com/maps?q=Hyderabad&output=embed"
            className="w-full h-72"
          ></iframe>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-black text-center p-6 border-t border-gray-800">
        <p className="text-lg font-semibold">SSSIT Computer Education</p>
        <p className="text-gray-400 text-sm mt-2">
          info@sssit.com | +91 9876543210
        </p>
        <p className="text-gray-600 text-xs mt-2">
          © 2026 All Rights Reserved
        </p>
      </div>

      {/* MARQUEE ANIMATION STYLE */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: inline-block;
            animation: marquee 15s linear infinite;
          }
        `}
      </style>

    </div>
  );
}

export default DashboardSSSIT;