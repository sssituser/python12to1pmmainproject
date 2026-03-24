import { Outlet, useLocation } from "react-router-dom";

import { Link } from "react-router-dom";



function FacultyLayout() {

  const location = useLocation();



  const menu = [
    

    { name: "Stats", path: "/faculty/Stats" },

    { name: "Course", path: "/faculty/Course" },

    { name: "Jobs", path: "/faculty/jobs" },

    { name: "Applications", path: "/faculty/applications" },

    { name: "Exam", path: "/faculty/Exam" },

    { name: "Leave Requests", path: "/faculty/leaves" },

    

  ];



  return (

    <div className="flex h-screen">



      {/* SIDEBAR */}

      <div className="w-64 bg-[#0f172a] text-white flex flex-col p-5">



        <h1 className="text-xl font-semibold mb-6">

          Faculty Panel

        </h1>



        <nav className="flex flex-col gap-3">

          {menu.map((item) => (

            <Link

              key={item.path}

              to={item.path}

              className={`px-3 py-2 rounded ${

                location.pathname === item.path

                  ? "bg-gray-700"

                  : "hover:bg-gray-800"

                }`}

            >

              {item.name}

            </Link>

          ))}

        </nav>



      </div>



      {/* MAIN CONTENT */}

      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">

        <Outlet />

      </div>



    </div>

  );

}



export default FacultyLayout;