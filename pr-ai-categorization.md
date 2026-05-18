# PR Title
feat: Advanced AI Expense Categorization with Redis and Few-Shot Learning

## Description
This PR implements automated expense categorization using OpenAI's `gpt-4o-mini` model, enhanced with production-grade reliability and personalization features.

### Key Changes:
- **AI Categorizer**:
    - Integrated `gpt-4o-mini` with a structured JSON output.
    - **Reliability**: Implemented **3 retries with exponential backoff** (2s, 4s, 8s) for API failures.
    - **Intelligence**: Added **Few-Shot Learning** logic that injects the last 5 manual user corrections into the prompt to improve personalization.
- **Caching Layer**:
    - Integrated **Redis** for global vendor-to-category mapping storage.
    - High-confidence results (>0.8) are cached for 30 days to reduce latency and API costs.
- **Interactive UI**:
    - Added an `AICategorizeButton` to trigger the AI workflow.
    - Created an inline `CategoryCell` editor that allows users to correct AI guesses.
- **Infrastructure**:
    - Updated `docker-compose.yml` with a Redis service.
    - Fixed Docker build-time issues related to Prisma binaries and OpenSSL.

### Testing Instructions:
1. Ensure Redis is running (`docker-compose up -d`).
2. Set `OPENAI_API_KEY` in your `.env`.
3. Upload expenses and click **AI Categorize**.
4. Correct a category by clicking on it in the table.
5. Upload a similar expense and verify that the AI uses the previous correction as an example or hits the cache.
