import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet} from "react-router-dom";



function Dashboard(){

return(

<div className="flex h-screen">

<Sidebar/>

<div className="flex flex-col flex-1">

<Navbar/>

<div className="p-6 bg-gray-100 flex-1 overflow-y-auto">

<Outlet/>

</div>

</div>

</div>

)

}

export default Dashboard;