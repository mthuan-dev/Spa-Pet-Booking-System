import { BACKEND_ENDPOINT } from '~/app/config/env.js';
import { getSession } from '~/features/auth/utils/session.js';

export async function graphqlRequest(query, variables = {}) {
  const endpoint = String(BACKEND_ENDPOINT || 'http://localhost:8080/api')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '') + '/graphql';

  const token = getSession();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors?.length || !payload?.data) {
    const firstError = payload?.errors?.[0];
    const classification = firstError?.extensions?.classification;
    const status = firstError?.extensions?.status || {
      BAD_REQUEST: 400, ValidationError: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
    }[classification] || (response.ok ? 500 : response.status);
    const error = new Error(firstError?.message || payload?.detail || 'Không thể tải dữ liệu.');
    error.status = status;
    error.response = { status, data: { detail: error.message } };
    throw error;
  }
  return payload.data;
}
