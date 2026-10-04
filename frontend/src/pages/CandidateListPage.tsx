import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, ApiError } from "../api/client";
import { Alert } from "../components/Alert";
import type { CandidateListItem } from "../types/candidate";
import { formatDate } from "../utils/format";

export function CandidateListPage() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    api
      .listCandidates()
      .then((data) => {
        if (!ignore) setCandidates(data);
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof ApiError ? err.message : "Não foi possível carregar os candidatos."
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((current) => current + 1);
  }

  if (loading) {
    return (
      <section>
        <h2>Candidatos</h2>
        <p className="muted" role="status">
          Carregando candidatos...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Candidatos</h2>
        <Alert type="error">{error}</Alert>
        <button type="button" className="button" onClick={handleRetry}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (candidates.length === 0) {
    return (
      <section>
        <h2>Candidatos</h2>
        <div className="card empty">
          <p>Nenhum candidato cadastrado ainda.</p>
          <Link to="/novo" className="button">
            Cadastrar o primeiro
          </Link>
        </div>
      </section>
    );
  }

  const total = candidates.length;

  return (
    <section>
      <div className="section-header">
        <h2>Candidatos</h2>
        <span className="muted">
          {total} {total === 1 ? "candidato" : "candidatos"}
        </span>
      </div>

      <div className="card table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Área de interesse</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <Link to={`/candidatos/${candidate.id}`}>{candidate.fullName}</Link>
                </td>
                <td>{candidate.email}</td>
                <td>{candidate.area ?? "Não informada"}</td>
                <td>{formatDate(candidate.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}