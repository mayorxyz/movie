interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({ status: 'ok' });
}
