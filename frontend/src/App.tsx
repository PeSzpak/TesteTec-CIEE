import { NavLink, Route, Routes } from "react-router";
import { NewCandidatePage } from "./pages/NewCandidatePage";
import { CandidateListPage } from "./pages/CandidateListPage";

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>Cadastro de currículos</h1>
        <nav className="nav">
          <NavLink to="/" end>
            Candidatos
          </NavLink>
          <NavLink to="/novo">Novo cadastro</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<CandidateListPage />} />
          <Route path="/novo" element={<NewCandidatePage />} />
          <Route path="/candidatos/:id" element={<p>Detalhes</p>} />
        </Routes>
      </main>
    </div>
  );
}