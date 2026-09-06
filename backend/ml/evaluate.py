"""
Evaluation script for Mail Sentinel trained artifacts.
Loads saved joblib artifacts, computes comprehensive metrics, and displays ROC-AUC and feature importances.
"""
import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score, classification_report

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
sys.path.insert(0, os.path.abspath(os.path.join(current_dir, "..")))

from ml.preprocess import combine_subject_body

def evaluate_saved_model():
    artifacts_dir = os.path.join(current_dir, "artifacts")
    tfidf_path = os.path.join(artifacts_dir, "tfidf.joblib")
    model_path = os.path.join(artifacts_dir, "phishing_model.joblib")

    if not os.path.exists(tfidf_path) or not os.path.exists(model_path):
        print(f"Error: Artifacts not found at {artifacts_dir}. Run ml/train.py first.")
        sys.exit(1)

    print("Loading vectorizer and model artifacts...")
    vectorizer = joblib.load(tfidf_path)
    classifier = joblib.load(model_path)

    datasets_dir = os.path.join(project_root, "datasets")
    phish_path = os.path.join(datasets_dir, "phishing_samples.csv")
    legit_path = os.path.join(datasets_dir, "legitimate_samples.csv")

    df_phish = pd.read_csv(phish_path)
    df_legit = pd.read_csv(legit_path)
    df = pd.concat([df_phish, df_legit], ignore_index=True)
    df["text"] = df.apply(lambda row: combine_subject_body(row["subject"], row["body"]), axis=1)

    X_vec = vectorizer.transform(df["text"])
    y_true = df["label"]

    y_pred = classifier.predict(X_vec)
    y_prob = classifier.predict_proba(X_vec)[:, 1]

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    auc = roc_auc_score(y_true, y_prob)
    cm = confusion_matrix(y_true, y_pred)

    print("=" * 60)
    print("SAVED ARTIFACT BENCHMARK EVALUATION")
    print("=" * 60)
    print(f"Total Evaluated Samples: {len(df)}")
    print(f"Accuracy:  {acc:.4f} ({acc * 100:.2f}%)")
    print(f"Precision: {prec:.4f} ({prec * 100:.2f}%)")
    print(f"Recall:    {rec:.4f} ({rec * 100:.2f}%)")
    print(f"F1-Score:  {f1:.4f} ({f1 * 100:.2f}%)")
    print(f"ROC-AUC:   {auc:.4f}")
    print("\nConfusion Matrix:")
    print("                 Predicted Legitimate   Predicted Phishing")
    print(f"Actual Legitimate        {cm[0,0]:<20}   {cm[0,1]:<20}")
    print(f"Actual Phishing          {cm[1,0]:<20}   {cm[1,1]:<20}")

    # Top indicative phishing n-grams
    feature_names = np.array(vectorizer.get_feature_names_out())
    top_phish_idx = np.argsort(classifier.coef_[0])[-10:]
    top_legit_idx = np.argsort(classifier.coef_[0])[:10]

    print("\nTop 10 Phishing Indicative N-grams:")
    for idx in reversed(top_phish_idx):
        print(f"  + {feature_names[idx]:<25} (weight: {classifier.coef_[0][idx]:.4f})")

    print("\nTop 10 Legitimate Indicative N-grams:")
    for idx in top_legit_idx:
        print(f"  - {feature_names[idx]:<25} (weight: {classifier.coef_[0][idx]:.4f})")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_saved_model()
