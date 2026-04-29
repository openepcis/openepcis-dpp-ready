import { Agent, fetch as undiciFetch, type RequestInit } from 'undici';
import { TLS_INSECURE } from './env.js';

const insecureAgent = TLS_INSECURE
  ? new Agent({ connect: { rejectUnauthorized: false } })
  : undefined;

export async function httpFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await undiciFetch(url, {
    ...init,
    dispatcher: insecureAgent,
  });
  return response as unknown as Response;
}

export async function expectOk(response: Response, label: string): Promise<Response> {
  if (!response.ok) {
    const body = await response.text().catch(() => '<no body>');
    throw new Error(`${label} failed (${response.status}): ${body.slice(0, 800)}`);
  }
  return response;
}
