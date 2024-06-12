from server import PromptServer
from aiohttp import web
import base64


class MessageQueue:
    messages: dict={}

    @classmethod
    def addMessage(cls, id, message):
        cls.messages[str(id)] = message

    @classmethod
    def awaitMessage(cls, id, message):
        pass


routes = web.RouteTableDef()

@routes.post("/api/timeline_data")
async def timeline_data(request):
    images = []
    try:
        data = await request.json()
        for img_id, timeline_data in data.items():
            images.append((img_id, timeline_data["imgSrc"]))

        for img_path, image_data in images:
            if image_data:
                image_bytes = base64.b64decode(image_data.split(",")[1])

            with open(f"{img_path}.png", "wb") as f:
                f.write(image_bytes)

    except Exception as e:
        pass
