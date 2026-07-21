import asyncio
import json
from typing import Set, Dict, Any

class SSEManager:
    def __init__(self):
        # A list of active queues for SSE clients
        self.active_clients: Set[asyncio.Queue] = set()
        
    async def subscribe(self) -> asyncio.Queue:
        """
        Creates a new queue for a connecting client.
        """
        q = asyncio.Queue()
        self.active_clients.add(q)
        return q
        
    def unsubscribe(self, q: asyncio.Queue):
        """
        Removes a queue when a client disconnects.
        """
        self.active_clients.discard(q)
        
    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """
        Sends an event to all connected clients.
        """
        message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for q in self.active_clients:
            await q.put(message)

# Global instance to be imported across the app
sse_manager = SSEManager()
