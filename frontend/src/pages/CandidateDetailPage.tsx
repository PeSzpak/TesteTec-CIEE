import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { api, ApiError } from "../api/client";
import { Alert } from "../components/Alert";
import type { Candidate } from "../types/candidate";
import { formatDateTime } from "../utils/format";

type LocationState = { message?: string } | null;

export function CandidateDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [successMessage] = useState<string | null>(
    () => (location.state as LocationState)?.message ?? null,
  );
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    api
      .getCandidate(id)
      .then((data) => {
        if (!ignore) setCandidate(data);
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Não foi possível carregar o candidato.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const backLink = (
    <Link to="/" className="back-link">
      Voltar para a lista
    </Link>
  );

  if (loading) {
    return (
      <section>
        {backLink}
        <p className="muted" role="status">
          Carregando candidato...
        </p>
      </section>
    );
  }

  if (error || !candidate) {
    return (
      <section>
        {backLink}
        <Alert type="error">{error ?? "Candidato não encontrado."}</Alert>
      </section>
    );
  }

  return (
    <section>
      {backLink}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <article className="card details">
        <header className="details-header">
          <h2>{candidate.fullName}</h2>
          <span className="muted">
            Cadastrado em {formatDateTime(candidate.createdAt)}
          </span>
        </header>

        <dl className="details-list">
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
            </dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{candidate.phone ?? "Não informado"}</dd>
          </div>
          <div>
            <dt>Área ou cargo de interesse</dt>
            <dd>{candidate.area ?? "Não informada"}</dd>
          </div>
        </dl>

        <div className="details-summary">
          <h3>Resumo profissional</h3>
          <p>{candidate.summary ?? "Não informado"}</p>
        </div>
      </article>
    </section>
  );
}
