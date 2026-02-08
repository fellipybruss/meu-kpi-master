
export interface GitHubConfig {
  token: string;
  gistId: string;
}

export const saveToGitHub = async (config: GitHubConfig, data: any) => {
  if (!config.token || !config.gistId) return null;

  const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        'kpimaster_db.json': {
          content: JSON.stringify(data, null, 2)
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error('Falha ao sincronizar com GitHub. Verifique seu Token.');
  }

  return await response.json();
};

export const loadFromGitHub = async (config: GitHubConfig) => {
  if (!config.token || !config.gistId) return null;

  const response = await fetch(`https://api.github.com/gists/${config.gistId}`, {
    headers: {
      'Authorization': `token ${config.token}`,
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar dados do GitHub.');
  }

  const gist = await response.json();
  const content = gist.files['kpimaster_db.json']?.content;
  return content ? JSON.parse(content) : null;
};

export const createInitialGist = async (token: string) => {
  const response = await fetch(`https://api.github.com/gists`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'KPI Master Database',
      public: false,
      files: {
        'kpimaster_db.json': {
          content: JSON.stringify({ indicators: [], plans: [] })
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error('Não foi possível criar o banco de dados no GitHub.');
  }

  return await response.json();
};
