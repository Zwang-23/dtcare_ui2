# Deploying to Google Cloud Run

Since we removed the Nginx proxy to make the container compatible with Cloud Run, you must provide the backend URL at **build time**.

## Prerequisites

1.  **Deploy your Backend Service first.**
    *   Let's assume your backend URL is: `https://my-backend-service-xyz.a.run.app`
    *   **Important:** Your backend **MUST** have CORS enabled to allow requests from your frontend's domain.

## Deployment Steps

You can deploy using **Cloud Build** (easiest) or build locally and push.

### Option 1: Using Cloud Build (Recommended)

Run this command in your terminal, replacing `YOUR_PROJECT_ID` and the backend URL:

```bash
gcloud builds submit \
  --tag gcr.io/YOUR_PROJECT_ID/dtcare-ui \
  --build-arg VITE_API_BASE_URL=https://my-backend-service-xyz.a.run.app \
  .
```

Then deploy the image to Cloud Run:

```bash
gcloud run deploy dtcare-ui \
  --image gcr.io/YOUR_PROJECT_ID/dtcare-ui \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Option 2: Building Locally with Docker

1.  **Build the image** with the backend URL:
    ```bash
    docker build \
      --build-arg VITE_API_BASE_URL=https://my-backend-service-xyz.a.run.app \
      -t gcr.io/YOUR_PROJECT_ID/dtcare-ui .
    ```

2.  **Push the image**:
    ```bash
    docker push gcr.io/YOUR_PROJECT_ID/dtcare-ui
    ```

3.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy dtcare-ui \
      --image gcr.io/YOUR_PROJECT_ID/dtcare-ui \
      --platform managed \
      --port 8080
    ```

## Troubleshooting

*   **CORS Errors:** If you see "CORS error" in your browser console, it means your **backend** is rejecting the request. You need to configure your backend (Python/Node/Go) to allow `Access-Control-Allow-Origin` from your new frontend URL.
*   **404 Errors:** If API calls fail with 404, check the Network tab in Chrome DevTools. Ensure the request URL starts with `https://my-backend...` and not `http://localhost...`.
