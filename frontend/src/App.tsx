import { NavLink, Route, Routes } from "react-router";
import { NewCandidatePage } from "./pages/NewCandidatePage";

export default function App() {
  return (
    <div className="container">
      <header className="header">
        <h1>Cadastro de Currículos</h1>
        <nav className="nav">
          <NavLink to="/" end>
            Candidatos
          </NavLink>
          <NavLink to="/novo">Novo Cadastro</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<p>Listagem</p>} />
          <Route path="/novo" element={<p>Formulário</p>} />
          <Route path="/candidatos/:id" element={<p>Detalhes</p>} />
          <Route path="/novo" element={<NewCandidatePage />} />
        </Routes>
      </main>
    </div>
  );
}
