function Navbar({ sidebarOpen, setSidebarOpen }) {

    return (

    <div className="flex items-center bg-blue shadow p-4">

        <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="text-xl"
        >
        ☰
        </button>

        <h1 className="ml-4 font-bold">Student Dashboard</h1>

    </div>

);

}

export default Navbar;