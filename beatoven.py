import asyncio
import os
import aiohttp
import aiofiles
import sys

# Source: https://www.beatoven.ai/api
# GitHub: https://github.com/Beatoven/public-api/blob/main/examples/compose.py

BACKEND_V1_API_URL = "https://public-api.beatoven.ai/api/v1"
BACKEND_API_HEADER_KEY = "YOUR_API_KEY"

async def compose_track(request_data):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BACKEND_V1_API_URL}/tracks/compose",
                json=request_data,
                headers={"Authorization": f"Bearer {BACKEND_API_HEADER_KEY}"},
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
        except aiohttp.ClientConnectionError:
            raise Exception({"error": "Could not connect to beatoven.ai"})
        except Exception as e:
            raise Exception({"error": "Failed to make a request to beatoven.ai"}) from e
        finally:
            if not data.get("task_id"):
                raise Exception(data)


async def get_track_status(task_id):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                f"{BACKEND_V1_API_URL}/tasks/{task_id}",
                headers={"Authorization": f"Bearer {BACKEND_API_HEADER_KEY}"},
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                else:
                    raise Exception({"error": "Composition failed"})
        except aiohttp.ClientConnectionError as e:
            raise Exception({"error": "Could not connect"}) from e
        except Exception as e:
            raise Exception({"error": "Failed to make a request"}) from e


async def handle_track_file(track_path: str, track_url: str):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(track_url) as response:
                if response.status == 200:
                    async with aiofiles.open(track_path, "wb+") as f:
                        await f.write(await response.read())
                        return {}
        except aiohttp.ClientConnectionError as e:
            raise Exception({"error": "Could not download file"}) from e
        except Exception as e:
            raise Exception(
                {"error": "Failed to make a request to get track file"}
            ) from e


async def watch_task_status(task_id, interval=10):
    while True:
        track_status = await get_track_status(task_id)
        if "error" in track_status:
            raise Exception(track_status)

        print(f"Task status: {track_status}")
        if track_status.get("status") == "composing":
            await asyncio.sleep(interval)
        elif track_status.get("status") == "failed":
            raise Exception({"error": "task failed"})
        else:
            return track_status

async def create_and_compose(text_prompt: str, output_filename: str):

    track_meta = {"prompt": {"text": text_prompt}, "format": "wav"}

    compose_res = await compose_track(track_meta)
    task_id = compose_res["task_id"]
    print(f"Started composition task with ID: {task_id}")

    generation_meta = await watch_task_status(task_id)
    print(generation_meta)
    track_url = generation_meta["meta"]["track_url"]
    print("Downloading track file")
    await handle_track_file(os.path.join(os.getcwd(), output_filename), track_url)

    print(f"Composed! you can find your track as {output_filename}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python beatoven.py <prompt> [output_filename]")
        sys.exit(1)

    prompt = sys.argv[1]
    output_filename = sys.argv[2] if len(sys.argv) > 2 else "composed_track.mp3"

    asyncio.run(create_and_compose(prompt, output_filename))

# Example usage: python beatoven.py "bach piano solo" name_what_you_want.wav

