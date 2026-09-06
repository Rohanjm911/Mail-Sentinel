"""
Training pipeline for Mail Sentinel Phishing Classifier.
Trains a TF-IDF + Logistic Regression baseline model with stratified splitting,
evaluates metrics, and exports Joblib artifacts.
"""
import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

# Ensure imports work regardless of working directory
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
sys.path.insert(0, os.path.abspath(os.path.join(current_dir, "..")))

from ml.preprocess import combine_subject_body

def load_data() -> pd.DataFrame:
    datasets_dir = os.path.join(project_root, "datasets")
    phish_path = os.path.join(datasets_dir, "phishing_samples.csv")
    legit_path = os.path.join(datasets_dir, "legitimate_samples.csv")

    if not os.path.exists(phish_path) or not os.path.exists(legit_path):
        raise FileNotFoundError(f"Datasets not found in {datasets_dir}. Run datasets/generate_datasets.py first.")

    df_phish = pd.read_csv(phish_path)
    df_legit = pd.read_csv(legit_path)

    df_combined = pd.concat([df_phish, df_legit], ignore_index=True)
    df_combined["text"] = df_combined.apply(lambda row: combine_subject_body(row["subject"], row["body"]), axis=1)
    
    # Drop any empty rows
    mask = df_combined["text"].str.strip().str.len() > 0
    return pd.DataFrame(df_combined[mask])


def train_and_export():
    print("=" * 60)
    print("MAIL SENTINEL ML TRAINING PIPELINE")
    print("=" * 60)

    df = load_data()
    print(f"Total samples loaded: {len(df)}")
    label_counts = pd.Series(df["label"]).value_counts().to_dict()
    print(f"Class distribution:\n{label_counts} (0: Legitimate, 1: Phishing)")

    # Stratified Train/Test Split (80% Train, 20% Test) to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        df["text"], 
        df["label"], 
        test_size=0.2, 
        stratify=df["label"], 
        random_state=42
    )
    print(f"\nTraining set size: {len(X_train)} | Test set size: {len(X_test)}")

    # TF-IDF Vectorization
    print("\nFitting TF-IDF Vectorizer (ngram_range=(1,2), sublinear_tf=True)...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english",
        max_features=4000,
        min_df=2
    )
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    print(f"Vocabulary size: {len(vectorizer.vocabulary_)} features")

    # Logistic Regression Classifier
    print("Training Logistic Regression classifier (class_weight='balanced')...")
    classifier = LogisticRegression(
        C=2.0,
        class_weight="balanced",
        random_state=42,
        max_iter=1000
    )
    classifier.fit(X_train_vec, y_train)

    # Evaluation on Hold-Out Test Set
    y_pred = classifier.predict(X_test_vec)
    y_prob = classifier.predict_proba(X_test_vec)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "=" * 60)
    print("MODEL EVALUATION METRICS (TEST SET)")
    print("=" * 60)
    print(f"Accuracy:  {acc:.4f} ({acc * 100:.2f}%)")
    print(f"Precision: {prec:.4f} ({prec * 100:.2f}%)")
    print(f"Recall:    {rec:.4f} ({rec * 100:.2f}%)")
    print(f"F1-Score:  {f1:.4f} ({f1 * 100:.2f}%)")
    print("\nConfusion Matrix:")
    print("                 Predicted Legitimate   Predicted Phishing")
    print(f"Actual Legitimate        {cm[0,0]:<20}   {cm[0,1]:<20}")
    print(f"Actual Phishing          {cm[1,0]:<20}   {cm[1,1]:<20}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

    # Save artifacts
    artifacts_dir = os.path.join(current_dir, "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)
    
    tfidf_path = os.path.join(artifacts_dir, "tfidf.joblib")
    model_path = os.path.join(artifacts_dir, "phishing_model.joblib")

    joblib.dump(vectorizer, tfidf_path)
    joblib.dump(classifier, model_path)

    print(f"Artifacts successfully saved:")
    print(f" - Vectorizer: {tfidf_path}")
    print(f" - Classifier: {model_path}")
    print("=" * 60)

    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "confusion_matrix": cm.tolist()
    }

if __name__ == "__main__":
    train_and_export()
