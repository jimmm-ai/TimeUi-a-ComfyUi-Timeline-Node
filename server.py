from server import PromptServer
from aiohttp import web
import base64


routes = PromptServer.instance.routes

@routes.post("/api/test")
async def test(request):
    print(f"TimelineUI: Hello from timeline_data api request!")

    return web.json_response({})

@routes.post("/api/timeline_data")
async def timeline_data(request):
    print(f"TimelineUI: Hello from timeline_data api request!")
    images = []
    try:
        post_data = await request.json()
        data = dict(post_data)
        for image_data in data["imageData"]:
            print(f"Appending image_id-{image_data['imgID']}")
            images.append((image_data["imgID"], image_data["imgSrc"]))

        for img_path, image_data in images:
            if image_data:
                image_bytes = base64.b64decode(image_data.split(",")[1])

            with open(f"{img_path}.png", "wb") as f:
                f.write(image_bytes)

    except Exception as e:
        print(f"server.timeline_data: Caught exception: {e}")

    return web.json_response({})
