/**
 * Application Configuration
 */

export default {
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    vertexAI: {
      modelId: process.env.VERTEX_AI_MODEL_ID || 'gemini-1.5-pro',
    },
  },
};