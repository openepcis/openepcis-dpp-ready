import { httpFetch, expectOk } from './http.js';
import { getenv } from './env.js';

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const base = getenv('KEYCLOAK_URL');
  const realm = getenv('KEYCLOAK_REALM');
  const clientId = getenv('KEYCLOAK_CLIENT_ID');
  const clientSecret = getenv('KEYCLOAK_CLIENT_SECRET');
  const username = getenv('KEYCLOAK_USERNAME');
  const password = getenv('KEYCLOAK_PASSWORD');

  const tokenUrl = `${base}/realms/${realm}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
  });

  const response = await httpFetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  await expectOk(response, `Keycloak token (${tokenUrl})`);
  const json = (await response.json()) as { access_token: string; expires_in: number };

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.value;
}
