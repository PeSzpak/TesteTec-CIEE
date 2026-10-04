import { Link, NavLink, Route, Routes } from "react-router";
import { CandidateDetailPage } from "./pages/CandidateDetailPage";
import { CandidateListPage } from "./pages/CandidateListPage";
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
          <Route path="/" element={<CandidateListPage />} />
          <Route path="/novo" element={<NewCandidatePage />} />
          <Route path="/candidatos/:id" element={<CandidateDetailPage />} />
          <Route
            path="*"
            element={
              <section>
                <h2>Página não encontrada</h2>
                <Link to="/">Voltar para a lista</Link>
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
