export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store',
      credentials: 'same-origin',
    })
  } catch {
    throw new Error('Сервер недоступен. Попробуй обновить страницу.')
  }

  const text = await response.text()
  let payload: any = {}
  try { payload = text ? JSON.parse(text) : {} } catch { payload = {} }

  if (!response.ok) {
    throw new Error(payload?.error || `Ошибка сервера (${response.status})`)
  }
  return payload as T
}
