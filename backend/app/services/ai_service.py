import json
import httpx
from app.database import settings
from app.schemas.daily_food import FoodItem, AIAnalysisResponse

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

TEXT_SYSTEM_PROMPT = """Sen bir beslenme uzmanısın ve ham malzemelerin besin değerlerini hesaplarsın.

Kullanıcı yemeklerini gram gram tartarak söyler.
Her malzemenin gerçek besin değerlerini hesapla.
Tüm besin değerlerini 100g üzerinden hesapla ve verilen grama uygula.

Malzeme adı her zaman Türkçe olsun.
JSON dışında hiçbir şey yazma.

Örnek giriş:
"150 gram tavuk göğsü, 200 gram pirinç, 10 gram zeytinyağı"

Örnek çıkış:
{"foods":[{"name":"Tavuk Göğsü","gram":150,"calorie":248,"protein":46.5,"fat":5.4,"carb":0},{"name":"Pirinç","gram":200,"calorie":260,"protein":5.4,"fat":0.6,"carb":56},{"name":"Zeytinyağı","gram":10,"calorie":88,"protein":0,"fat":10,"carb":0}]}

Çıktı formatı:
{"foods":[{"name":"...","gram":0,"calorie":0,"protein":0,"fat":0,"carb":0}]}"""

VISION_SYSTEM_PROMPT = """Sen bir beslenme uzmanısın.
Fotoğraftaki ham malzemeleri ve porsiyonları tespit et.
Gram ağırlık tahmini yap.
Tüm besin değerlerini 100g bazında hesapla ve verilen grama uygula.

JSON dışında hiçbir şey yazma.
Malzeme adı her zaman Türkçe olsun.

Çıktı formatı:
{"foods":[{"name":"...","gram":0,"calorie":0,"protein":0,"fat":0,"carb":0}]}"""


async def analyze_text(text: str) -> AIAnalysisResponse:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemma-4-26b-a4b-it:free",
                "messages": [
                    {"role": "system", "content": TEXT_SYSTEM_PROMPT},
                    {"role": "user", "content": text},
                ],
                "temperature": 0.3,
                "max_tokens": 1000,
            },
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
        parsed = json.loads(content)
        return AIAnalysisResponse(**parsed)


async def analyze_image_base64(image_base64: str) -> AIAnalysisResponse:
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "nvidia/nemotron-nano-12b-v2-vl:free",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}",
                                },
                            },
                            {
                                "type": "text",
                                "text": VISION_SYSTEM_PROMPT,
                            },
                        ],
                    },
                ],
                "temperature": 0.3,
                "max_tokens": 1000,
            },
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
        parsed = json.loads(content)
        return AIAnalysisResponse(**parsed)
