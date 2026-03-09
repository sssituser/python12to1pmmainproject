function Navbar({ toggleSidebar }) {
  return (
    <div className="navbar">

      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <button onClick={toggleSidebar} style={{fontSize:"22px"}}>
          <i className="bi bi-list"></i>
        </button>
        <h2>Student Dashboard</h2>
      </div>

      <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
        <i className="bi bi-bell"></i>
        <img
          src="https://i.pravatar.cc/40"
          style={{width:"35px",borderRadius:"50%"}}
        />
      </div>

    </div>
  );
}

export default Navbar;