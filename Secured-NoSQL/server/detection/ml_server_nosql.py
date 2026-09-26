from flask import Flask, request, jsonify
import joblib
import re
import os

app = Flask(__name__)

# Get the project root path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load the trained model and vectorizer
MODEL_PATH = os.path.join(BASE_DIR, 'server', 'ml', 'nosqli_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'server', 'ml', 'nosqli_vectorizer.pkl')

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


# Temporary safe inputs to prevent false positives
SAFE_INPUTS = {"admin", "alice", "bob", "cara", "dave", "guest"}


def check_heuristics(user_input):
    """
    Basic heuristic checks for NoSQL injection patterns.
    """

    patterns = [
        r"\$ne",
        r"\$gt",
        r"\$lt",
        r"\$gte",
        r"\$lte",
        r"\$in",
        r"\$nin",
        r"\$or",
        r"\$and",
        r"\$where",
        r"\$regex",
        r"\{\s*\$.*?\s*:\s*.*?\}",
        r"\{.*\$.*\}",
        r"this\..*?==.*"
    ]

    for pattern in patterns:
        if re.search(pattern, user_input, re.IGNORECASE):
            return True

    return False


@app.route('/predict', methods=['POST'])
def predict():

    data = request.get_json()
    user_input = data.get('input', '')

    # 1. Known safe inputs
    if user_input.lower().strip() in SAFE_INPUTS:
        return jsonify({'result': 'safe'})

    # 2. Heuristic detection
    if check_heuristics(user_input):
        return jsonify({'result': 'suspicious'})

    # 3. ML model prediction
    vec = vectorizer.transform([user_input])
    prediction = model.predict(vec)[0]

    if prediction == 1:
        return jsonify({'result': 'suspicious'})

    return jsonify({'result': 'safe'})


if __name__ == '__main__':
    app.run(port=5001)