import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib
import os

# Dataset with MongoDB injection and safe samples
data = {
    "input": [
        "john", "alice", "maths", "science", "engineering", "marks > 90",
        "{$ne:null}", "{$where:'this.marks>90'}", "{$gt:''}", "function(){}", 
        "eval()", "' || '1'=='1", "{ $regex: '' }", "' } && this.password != ''", 
        "admin' && this.role == 'admin"
    ],
    "label": [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1]  # 0 = safe, 1 = malicious
}

df = pd.DataFrame(data)

# Train/test split
X = df['input']
y = df['label']
vectorizer = TfidfVectorizer()
X_vec = vectorizer.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)

# Model training
model = LogisticRegression()
model.fit(X_train, y_train)

# Evaluation
print(classification_report(y_test, model.predict(X_test)))

# Save model and vectorizer in the same folder as this training script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

joblib.dump(model, os.path.join(BASE_DIR, "nosqli_model.pkl"))
joblib.dump(vectorizer, os.path.join(BASE_DIR, "nosqli_vectorizer.pkl"))

print("✅ NoSQL model and vectorizer saved successfully!")
