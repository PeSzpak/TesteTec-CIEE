import { NavLink, Route, Routes } from "react-router";
import { NewCandidatePage } from "./pages/NewCandidatePage";

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
          <Route path="/" element={<p>Listagem</p>} />
          <Route path="/novo" element={<NewCandidatePage />} />
          <Route path="/candidatos/:id" element={<p>Detalhes</p>} />
        </Routes>
      </main>
    </div>
  );
}