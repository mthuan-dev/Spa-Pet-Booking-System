import { BACKEND_ENDPOINT } from '~/app/config/env.js';

export async function graphqlRequest(query, variables = {}) {
  const endpoint = String(BACKEND_ENDPOINT || 'http://localhost:8080/api')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '') + '/graphql';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || 'Không thể tải dữ liệu GraphQL.');
  }
  return payload.data;
}
