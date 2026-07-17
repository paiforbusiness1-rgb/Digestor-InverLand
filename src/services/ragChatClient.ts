/** Cliente fino para chat RAG local. */
export async function requestRagChat(payload: {
  sourceDocumentId: string;
  documentName: string;
  message: string;
  chatHistory: Array<{ role: string; content: string }>;
}): Promise<{ reply: string; mode?: string; chunkCount?: number }> {
  const response = await fetch('/api/rag/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Error en chat RAG');
  }
  return data;
}
