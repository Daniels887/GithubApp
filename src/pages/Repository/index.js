import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, PageActions } from './styles';

export default function Repository({ match }) {
  const [repository, setRepository] = useState({});
  const [issues, setIssues] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async function loadRepos() {
      const repoName = decodeURIComponent(match.params.repository);

      const [reposData, issuesData] = await Promise.all([
        await api.get(`/repos/${repoName}`),
        await api.get(`/repos/${repoName}/issues`, {
          params: {
            state: 'open',
            per_page: 5,
          },
        }),
      ]);

      setRepository(reposData.data);
      setIssues(issuesData.data);
      setLoading(false);
    })();
  }, []);

  async function loadIssues() {
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: 'open',
        per_page: 5,
        page,
      },
    });

    setIssues(response.data);
    setLoading(false);
  }

  async function handlePage(action) {
    await setPage(action === 'back' ? page - 1 : page + 1);
    loadIssues();
  }

  if (loading) {
    return <Loading>Carregando...</Loading>;
  }

  return (
    <Container>
      <Owner>
        <Link to="/">Voltar aos repositórios</Link>
        <img src={repository.owner.avatar_url} alt={repository.owner.login} />
        <h1>{repository.name}</h1>
        <p>{repository.description}</p>
      </Owner>

      <IssueList>
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
                {issue.labels.map(label => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssueList>
      <PageActions>
        <button
          type="button"
          disabled={page < 2}
          onClick={() => handlePage('back')}
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button type="button" onClick={() => handlePage('next')}>
          Próximo
        </button>
      </PageActions>
    </Container>
  );
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
