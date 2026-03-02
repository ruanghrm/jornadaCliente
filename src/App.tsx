import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Configuracoes from "../pages/Configuracoes";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Rotas protegidas */}
        <Route path="/home" element={<Home />}>
          <Route index element={<div>Dashboard</div>} />
          <Route path="profile" element={<Profile />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;