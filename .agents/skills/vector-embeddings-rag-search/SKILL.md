---
name: vector-embeddings-rag-search
description: HNSW indexing, cosine similarity, semantic chunking, reciprocal rank fusion (RRF), and context window packing.
---

# Vector Embeddings & Hybrid RAG Search

## Architecture
1. **Semantic Chunking**: Split documents on paragraph/sentence boundaries (300-500 tokens with 10% overlap).
2. **Hybrid Search (RRF)**: Combine dense vector similarity (pgvector / Pinecone) with sparse BM25 keyword search.
3. **Re-Ranking**: Apply a cross-encoder re-ranker model to score top 50 candidates down to top 5 context chunks.
4. **Context Deduplication**: Remove overlapping text chunks before prompt construction to conserve token budgets.

