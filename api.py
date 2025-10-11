from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import base64
import requests
import re

app = FastAPI(title="CLAIMS BACKEND", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# API_KEY = "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"
# API_KEY =  "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"
# API_KEY =  "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"
# key2="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"
# Global variable to store the description text

API_KEY="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"
key2=API_KEY
description_text = ""


def encode_image_to_base64(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


def clean_content(raw: str) -> str:
    """
    Remove code blocks or triple backticks from OpenRouter responses.
    """
    cleaned = re.sub(r"```(?:json)?\n(.*?)```", r"\1", raw, flags=re.DOTALL)
    return cleaned.strip()


@app.post("/explain")
def explain_image(file: UploadFile = File(...)):
    global description_text

    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    base64_image = encode_image_to_base64(save_path)
    data_url = f"data:image/jpeg;base64,{base64_image}"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Describe this image in detail. Provide JSON keys: "
                        "{ 'description': '...', 'ai_generated_likelihood': 0-1, "
                        "'confidence_reasoning': '...' }"
                    ),
                },
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }
    ]

    payload = {"model": "mistralai/mistral-small-3.2-24b-instruct:free", "messages": messages}

    try:
        response = requests.post(url, headers=headers, json=payload).json()

        # Safely get content
        if "choices" in response:
            raw_content = response["choices"][0]["message"]["content"]
        elif "content" in response:
            raw_content = response["content"]
        else:
            raw_content = str(response)

        # Clean markdown/codeblocks
        description_text = clean_content(raw_content)

    except Exception as e:
        description_text = f"Error: {str(e)}"

    return {"filename": file.filename, "content": description_text}





response_txtss="""
{
  "filename": "image copy.png",
  "content": "{\n  \"description\": \"The image shows a silver sedan with noticeable damage on the driver's side. The damage appears to be significant, with the side panel and door dented and scratched. The front wheel and part of the front bumper are also visible, and the car is positioned against a plain white background.\",\n  \"ai_generated_likelihood\": 0.8,\n  \"confidence_reasoning\": \"The car's damage appears slightly too uniform and the lighting is perfectly even, which is often a characteristic of AI-generated images. However, the details such as the texture of the paint and the specific nature of the damage could also be indicative of a real photograph.\"\n}"
}

"""

@app.get("/check_damage")
def check_damage():
    global response_txtss
    # if not description_text:
    #     return {"estimated_damage": "No description available. Explain an image first."}

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key2}", "Content-Type": "application/json"}

    payload = {
        "model": "openai/gpt-oss-20b:free",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"Estimate the damage cost in INR for this car description:\n{response_txtss}",
                    }
                ],
            }
        ],
    }

    try:
        res = requests.post(url, headers=headers, json=payload).json()
        # DeepSeek response can be 'choices' or 'content'
        if "choices" in res:
            raw_damage = res["choices"][0]["message"]["content"]
        elif "content" in res:
            raw_damage = res["content"]
        else:
            raw_damage = str(res)

        damage_text = clean_content(raw_damage)

    except Exception as e:
        damage_text = str(e)

    return {"estimated_damage": damage_text}


@app.post("/check_ai")
def check_ai_generation(file: UploadFile = File(...)):
    """
    Analyzes an uploaded image to determine if it was generated by AI.
    """
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    base64_image = encode_image_to_base64(save_path)
    data_url = f"data:image/jpeg;base64,{base64_image}"

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

    # ** The key change is this prompt **
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        "Analyze this image for signs of AI generation. Look for common artifacts like "
                        "unnatural textures, incorrect lighting, strange details (e.g., on hands or text), "
                        "or a 'too perfect' appearance. Provide your response in a strict JSON format with the following keys: "
                        "{ \"is_ai_generated\": boolean, \"confidence_score\": float (0.0 to 1.0), "
                        "\"reasoning\": \"A detailed explanation of the visual cues you used for your analysis.\" }"
                    ),
                },
                {"type": "image_url", "image_url": {"url": data_url}},
            ],
        }
    ]
    
    # We use the same capable vision model
    payload = {"model": "mistralai/mistral-small-3.2-24b-instruct:free", "messages": messages}

    try:
        response = requests.post(url, headers=headers, json=payload).json()
        
        if "choices" in response:
            raw_content = response["choices"][0]["message"]["content"]
        else:
            raw_content = str(response)

        # Clean any markdown/codeblocks from the response
        ai_analysis_text = clean_content(raw_content)

    except Exception as e:
        ai_analysis_text = f"Error: {str(e)}"

    return {"filename": file.filename, "ai_analysis": ai_analysis_text}