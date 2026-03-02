import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;