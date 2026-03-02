// src/pages/Home.tsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

// Páginas/componentes do conteúdo central
import CardsGrid from "../components/CardsGrid";
import TableCard from "../components/TableCard";
import Clientes from "./Clientes"; // Página de clientes
import Relatorios from "./Relatorios";
import Unidades from "./Unidades";
import Tickets from "./Tickets";
import Configuracoes from "./Configuracoes";
import Profile from "./Profile";
import Assinatura from "./Assinatura";


const Home: React.FC = () => {
  const [activePage, setActivePage] = useState("dashboard");

  // Função que renderiza dinamicamente o conteúdo central
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <div className="overview" style={{ marginBottom: "20px" }}>
              <h2>Visão Geral</h2>
              <p className="muted">Resumo das métricas principais</p>
            </div>
            <CardsGrid />
            <div style={{ marginTop: "20px" }}>
              <TableCard />
            </div>
          </>
        );
      case "faturas":
        return <div>Conteúdo da página Faturas</div>;
      case "relatorios":
        return <Relatorios />;
      case "financeiro":
        return <div>Conteúdo da página Financeiro</div>;
      case "unidades":
        return <Unidades />;
      case "profile":
        return <Profile />;
      case "clientes":
        return <Clientes />;
      case "tickets":
        return <Tickets />;
      case "assinatura":
        return <Assinatura />;
      case "mensagens":
        return <div>Conteúdo da página Mensagens Automáticas</div>;
      case "portais":
        return <div>Conteúdo da página Portais</div>;
      case "oportunidades":
        return <div>Conteúdo da página Oportunidades</div>;
      case "configuracoes":
        return <Configuracoes />;
      case "suporte":
        return <div>Conteúdo da página Suporte</div>;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className="app" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar setActivePage={setActivePage} activePage={activePage} />

      <div className="main" style={{ flex: 1, padding: "20px" }}>
        <Topbar setActivePage={setActivePage} />

        <section className="content">{renderContent()}</section>

        <Footer />
      </div>
    </div>
  );
};

export default Home;