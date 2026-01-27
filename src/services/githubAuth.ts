interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/callback';

/**
 * Initiate GitHub OAuth flow
 */
export const initiateGitHubLogin = () => {
  const scope = 'read:user user:email';
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', GITHUB_REDIRECT_URI);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('response_type', 'code');

  window.location.href = authUrl.toString();
};

/**
 * Exchange authorization code for access token
 * Note: In production, this should be done server-side to keep the client secret secure
 */
export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: import.meta.env.VITE_GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data: GitHubTokenResponse = await response.json();
  return data.access_token;
};

/**
 * Fetch GitHub user profile
 */
export const fetchGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return await response.json();
};

/**
 * Fetch user's primary email (GitHub may return null for email in the main user object)
 */
export const fetchGitHubUserEmail = async (accessToken: string): Promise<string> => {
  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user emails');
  }

  const emails = await response.json();
  const primaryEmail = emails.find((e: any) => e.primary);
  return primaryEmail?.email || emails[0]?.email || '';
};

/**
 * Complete GitHub OAuth flow
 */
export const handleGitHubCallback = async (code: string) => {
  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);

    // Fetch user profile
    const githubUser = await fetchGitHubUser(accessToken);

    // Fetch email if not provided
    let email = githubUser.email;
    if (!email) {
      email = await fetchGitHubUserEmail(accessToken);
    }

    // Return user data in our app's format
    return {
      id: githubUser.id.toString(),
      name: githubUser.name || githubUser.login,
      email: email || `${githubUser.login}@users.noreply.github.com`,
      avatar: githubUser.avatar_url,
      githubLogin: githubUser.login,
      githubBio: githubUser.bio,
      githubLocation: githubUser.location,
      githubBlog: githubUser.blog,
    };
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    throw error;
  }
};
