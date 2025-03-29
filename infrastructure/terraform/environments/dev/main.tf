provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

locals {
  environment = "dev"
  services = {
    backend = {
      name  = "fluxori-backend"
      image = "gcr.io/${var.project_id}/fluxori-backend:latest"
      port  = 8080
      env_vars = {
        NODE_ENV  = "development"
        PORT      = "8080"
        MONGODB_URI = var.mongodb_uri
      }
    }
    frontend = {
      name  = "fluxori-frontend"
      image = "gcr.io/${var.project_id}/fluxori-frontend:latest"
      port  = 3000
      env_vars = {
        NODE_ENV = "development"
      }
    }
  }
}

# Firestore database
module "firestore" {
  source     = "../../modules/firestore"
  project_id = var.project_id
  region     = var.region
  database_id = "(default)"
  database_type = "FIRESTORE_NATIVE"
  concurrency_mode = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"
  point_in_time_recovery_enabled = false
}

# Cloud Storage bucket for file storage
module "storage" {
  source      = "../../modules/cloud_storage"
  project_id  = var.project_id
  bucket_name = "${var.project_id}-files-${local.environment}"
  location    = var.region
  force_destroy = true
  
  cors_rules = [
    {
      origins          = ["*"]
      methods          = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"]
      response_headers = ["*"]
      max_age_seconds  = 3600
    }
  ]
  
  labels = {
    environment = local.environment
    application = "fluxori"
  }
}

# Secrets
module "secrets" {
  source     = "../../modules/secret_manager"
  project_id = var.project_id
  
  secrets = {
    jwt_secret = {
      secret_id     = "jwt-secret-${local.environment}"
      description   = "JWT secret for authentication"
      secret_data   = var.jwt_secret
    }
  }
  
  labels = {
    environment = local.environment
    application = "fluxori"
  }
}

# Backend service
module "backend_service" {
  source             = "../../modules/cloud_run"
  project_id         = var.project_id
  region             = var.region
  service_name       = local.services.backend.name
  image              = local.services.backend.image
  container_port     = local.services.backend.port
  env_vars           = local.services.backend.env_vars
  allow_public_access = true
  max_instances      = 5
  cpu                = "1000m"
  memory             = "512Mi"
}

# Frontend service
module "frontend_service" {
  source             = "../../modules/cloud_run"
  project_id         = var.project_id
  region             = var.region
  service_name       = local.services.frontend.name
  image              = local.services.frontend.image
  container_port     = local.services.frontend.port
  env_vars           = local.services.frontend.env_vars
  allow_public_access = true
  max_instances      = 5
  cpu                = "1000m"
  memory             = "512Mi"
}

# Output the service URLs
output "backend_url" {
  description = "The URL of the backend service"
  value       = module.backend_service.service_url
}

output "frontend_url" {
  description = "The URL of the frontend service"
  value       = module.frontend_service.service_url
}

output "storage_bucket" {
  description = "The name of the storage bucket"
  value       = module.storage.bucket_name
}