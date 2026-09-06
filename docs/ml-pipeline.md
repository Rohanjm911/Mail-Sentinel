# Mail Sentinel Machine Learning Pipeline

## 1. Overview
Mail Sentinel utilizes an on-premises, explainable machine learning architecture designed to operate **100% locally without external AI APIs or cloud dependencies**.

The primary text-classification model is:
$$\text{Preprocessed Text} \xrightarrow{\text{TF-IDF Vectorization}} \mathbf{X} \xrightarrow{\text{Logistic Regression}} \hat{y} \in \{0, 1\}$$

Where:
- $\hat{y} = 1$: Phishing
- $\hat{y} = 0$: Legitimate (Ham)

---

## 2. Training Data & Preprocessing

### Dataset Composition
Located in `datasets/`:
- `phishing_samples.csv`: Realistic synthetic phishing samples spanning credential harvesting, urgency coercion, payment diversion, cryptocurrency extortion, and brand spoofing.
- `legitimate_samples.csv`: Standard enterprise communications, transactional receipts, newsletters, engineering meeting requests, and project status updates.
- Synthetic RFC 5322 test cases in `datasets/test_emails/` (`phishing_01.eml`, `phishing_02.eml`, `legitimate_01.eml`, `legitimate_02.eml`).

### Text Preprocessing (`backend/ml/preprocess.py`)
1. **HTML Stripping**: Extracts plain-text representations while neutralizing script elements and tags.
2. **URL Tokenization**: Normalizes URLs into `<URL>` tokens to decouple classification from transient domain names.
3. **Email Tokenization**: Normalizes email addresses to `<EMAIL>`.
4. **Currency & Numeric Normalization**: Maps currency amounts to `<CURRENCY>` and large digit sequences to `<NUMBER>`.
5. **Lowercasing & Accent Stripping**: Eliminates unicode normalization variances.
6. **Token Retention**: Preserves high-signal punctuation and contractions relevant to urgency detection (e.g., exclamation marks).

---

## 3. Vectorization & Model Architecture

### TF-IDF Vectorizer (`TfidfVectorizer`)
- **N-gram Range**: `(1, 2)` (Unigrams and Bigrams).
- **Max Features**: 3,000 top n-grams.
- **Sublinear TF Scaling**: `sublinear_tf=True` ($1 + \log(\text{tf})$) to prevent high-frequency term domination.
- **Minimum Document Frequency**: `min_df=2`.
- **Stopwords**: Standard English stopword elimination.

### Classifier (`LogisticRegression`)
- **Solver**: `lbfgs`.
- **Regularization**: $C = 1.0$, $L_2$ penalty.
- **Class Balancing**: `class_weight="balanced"`.
- **Max Iterations**: 1,000.

---

## 4. Evaluation Metrics

Evaluated on an independent stratified 20% test partition (random seed = 42) without data leakage:

| Metric | Score | Note |
| :--- | :--- | :--- |
| **Accuracy** | **98.28%** | Overall correct classifications across all test cases |
| **Recall (Phishing)** | **100.00%** | Zero false negatives in test partition |
| **Precision (Phishing)** | **96.67%** | Minimal false positives |
| **F1-Score** | **98.31%** | Harmonic mean of precision and recall |

### Confusion Matrix
$$\begin{pmatrix} \text{TN: } 28 & \text{FP: } 1 \\ \text{FN: } 0 & \text{TP: } 29 \end{pmatrix}$$

---

## 5. Artifact Storage & Local Inference
Artifacts are serialized using `joblib` into `backend/ml/artifacts/`:
- `tfidf.joblib`: Trained vectorizer vocabulary and IDF weights.
- `phishing_model.joblib`: Trained Logistic Regression weights.

During FastAPI application startup, `MLService` loads both files into memory once, ensuring sub-10ms inference latency without retraining on incoming requests.

---

## 6. Explainability Feature Extraction
In addition to outputting a phishing probability $P(y=1 | x)$, the `MLService` calculates the dot product of the input's TF-IDF features with the model's coefficients:

$$\text{Contribution}_i = x_i \cdot w_i$$

The tokens with the highest positive weights are extracted as `top_features` (e.g. `['urgent', 'suspended', 'verify', 'account', 'password']`) and presented directly to the security analyst in the Results Dossier.

---

## 7. Retraining Instructions
To retrain or benchmark the model with new corpora:

```bash
cd backend
python ml/train.py
python ml/evaluate.py
```
Model artifacts will be updated automatically in `backend/ml/artifacts/`.
