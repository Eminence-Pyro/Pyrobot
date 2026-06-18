"""
Pyrobot — V1 Chat Endpoints

POST /chat/stream   — streams the AI response as Server-Sent Events (SSE)
POST /chat/generate — returns the complete response as JSON (useful for testing)

Both endpoints are protected by get_current_user — a valid JWT is required.

SSE format (text/event-stream):
  Each token arrives as:     data: <token text>\n\n
  When the stream ends:      data: [DONE]\n\n

This is the same format used by the OpenAI streaming API, so the
frontend can handle responses from all three providers identically.
"""
import asyncio
import json
from typing import Annotated, AsyncIterator

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

router = APIRouter()


async def _token_generator(
    service: ChatService,
    request: ChatRequest,
    http_request: Request,
) -> AsyncIterator[str]:
    """
    Core SSE generator. Yields formatted SSE lines for each token,
    then a final [DONE] sentinel so the client knows the stream ended cleanly.

    The `await http_request.is_disconnected()` check means we stop calling
    the AI provider immediately if the user closes the browser tab —
    saves API credits and keeps server resources clean.
    """
    try:
        async for token in service.stream([m.model_dump() for m in request.messages]):
            if await http_request.is_disconnected():
                break
            # SSE format: "data: <payload>\n\n"
            # We JSON-encode the token so special characters (newlines, quotes)
            # are safely escaped — the frontend JSON.parse()s each data line.
            yield f"data: {json.dumps(token)}\n\n"
            # Yield control back to the event loop between tokens so FastAPI
            # can process other requests concurrently (important under load).
            await asyncio.sleep(0)
    except Exception as e:
        # Surface provider errors to the client as a structured SSE error event
        # rather than silently closing the stream.
        yield f"event: error\ndata: {json.dumps({'detail': str(e)})}\n\n"
    finally:
        yield "data: [DONE]\n\n"


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    http_request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Stream an AI response token-by-token as Server-Sent Events.
    Accepts the full conversation history; the service layer prepends
    the Pyrobot system prompt automatically.
    """
    try:
        service = ChatService(model=request.model)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return StreamingResponse(
        _token_generator(service, request, http_request),
        media_type="text/event-stream",
        headers={
            # Prevent proxies/CDNs from buffering the stream
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/generate", response_model=ChatResponse)
async def chat_generate(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Non-streaming endpoint — returns the complete AI response as JSON.
    Useful for testing without needing an SSE client.
    This is also what automated tests use (easier to assert against a full string
    than to reassemble a stream).
    """
    try:
        service = ChatService(model=request.model)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    content = await service.generate([m.model_dump() for m in request.messages])
    return ChatResponse(content=content, model=request.model)
