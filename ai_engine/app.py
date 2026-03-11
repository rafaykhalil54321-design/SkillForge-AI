from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import io
import json
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# --- PLUG IN YOUR OPENAI KEY HERE ---
import os
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- Helper 1: AI for PDF Parsing ---
def analyze_with_openai(resume_text):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a career expert. Analyze the resume text and return ONLY a valid JSON object with two exact keys: 'role' (a string of the best job title) and 'roadmap' (an array of 4 specific learning steps as strings)."},
                {"role": "user", "content": f"Analyze this resume:\n{resume_text}"}
            ],
            response_format={ "type": "json_object" }
        )
        ai_content = response.choices[0].message.content
        return json.loads(ai_content)
    except Exception as e:
        print("OpenAI Error:", e)
        return {"role": "Error", "roadmap": ["Check API Key"]}

# --- Helper 2: AI for Direct Chat (NEW) ---
def chat_with_openai(user_prompt):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful tech and career expert assistant. Answer the user's question clearly and concisely."},
                {"role": "user", "content": user_prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print("OpenAI Chat Error:", e)
        return "Sorry, I encountered an error connecting to the AI."

# --- ROUTE 1: Handle PDF Files ---
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text()
            
        result = analyze_with_openai(extracted_text)
        return jsonify(result)
    except Exception as e:
        print("PDF Error:", e)
        return jsonify({"error": "Failed to read PDF."}), 500

# --- ROUTE 2: Handle Direct Chat (NEW) ---
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "No prompt provided"}), 400
    
    user_prompt = data['prompt']
    
    # Send the text to OpenAI and get the reply
    ai_reply = chat_with_openai(user_prompt)
    
    # Send it back to Node.js (which sends it to Next.js)
    return jsonify({"reply": ai_reply})

if __name__ == '__main__':
    app.run(port=5001, debug=True)