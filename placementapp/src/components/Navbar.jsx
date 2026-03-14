function Navbar({toggleSidebar}){

return(

<div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow">

<div className="flex items-center gap-4">

<button onClick={toggleSidebar}>
<i className="bi bi-list text-2xl"></i>
</button>

<h1 className="font-semibold text-lg">
Student Dashboard
</h1>

</div>

<div className="flex items-center gap-4">

<i className="bi bi-bell text-xl"></i>

<img
src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
className="w-8 h-8 rounded-full"
/>

</div>

</div>

)

}

export default Navbar