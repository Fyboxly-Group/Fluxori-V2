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
  environment = "prod"
  services = {
    backend = {
      name  = "fluxori-backend"
      image = "gcr.io/${var.project_id}/fluxori-backend:prod"
      port  = 8080
      env_vars = {
        NODE_ENV  = "production"
        PORT      = "8080"
        MONGODB_URI = var.mongodb_uri
      }
    }
    frontend = {
      name  = "fluxori-frontend"
      image = "gcr.io/${var.project_id}/fluxori-frontend:prod"
      port  = 3000
      env_vars = {
        NODE_ENV = "production"
      }
    }
  }
  
  labels = {
    environment = local.environment
    application = "fluxori"
    managed_by  = "terraform"
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
  point_in_time_recovery_enabled = true
  
  # Enable backups for production environment
  backup_schedule = var.enable_backup_schedule ? {
    retention_days = var.backup_retention_days
    time           = "00:00"
    recurrence     = "0 0 * * *"  # Daily at midnight
  } : null
  
  # Configure service accounts for Firestore access
  service_accounts = {
    "${var.gcp_service_account}" = ["roles/datastore.user"]
  }
  
  # Add indexes for common queries
  indexes = [
    {
      collection = "inventory"
      fields = [
        {
          field_path = "category"
          order      = "ASCENDING"
        },
        {
          field_path = "stockQuantity"
          order      = "ASCENDING"
        }
      ]
    },
    {
      collection = "users"
      fields = [
        {
          field_path = "role"
          order      = "ASCENDING"
        },
        {
          field_path = "createdAt"
          order      = "DESCENDING"
        }
      ]
    },
    {
      collection = "orders"
      fields = [
        {
          field_path = "status"
          order      = "ASCENDING"
        },
        {
          field_path = "createdAt"
          order      = "DESCENDING"
        }
      ]
    }
  ]
  
  # Setup TTL for temporary data
  enable_ttl_service = true
  ttl_collections = {
    "sessions" = {
      field            = "expiresAt"
      collection_group = "sessions"
    },
    "temp_uploads" = {
      field            = "expiresAt"
      collection_group = "temp_uploads"
    }
  }
  
  labels = local.labels
}

# Cloud Storage bucket for file storage with versioning
module "storage" {
  source      = "../../modules/cloud_storage"
  project_id  = var.project_id
  bucket_name = "${var.project_id}-files-${local.environment}"
  location    = var.region
  force_destroy = false
  versioning_enabled = true
  
  cors_rules = [
    {
      origins          = ["https://${local.services.frontend.name}-${var.project_id}.a.run.app", "https://fluxori.com"]
      methods          = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"]
      response_headers = ["*"]
      max_age_seconds  = 3600
    }
  ]
  
  # Add lifecycle rules for production (archive older files instead of deleting)
  lifecycle_rules = [
    {
      action = {
        type          = "SetStorageClass"
        storage_class = "NEARLINE"
      }
      condition = {
        age = 90  # Move to nearline after 90 days
      }
    },
    {
      action = {
        type          = "SetStorageClass"
        storage_class = "COLDLINE"
      }
      condition = {
        age = 365  # Move to coldline after 1 year
      }
    }
  ]
  
  labels = local.labels
}

# Secrets
module "secrets" {
  source     = "../../modules/secret_manager"
  project_id = var.project_id
  
  secrets = {
    jwt_secret = {
      secret_id           = "jwt-secret-${local.environment}"
      description         = "JWT secret for authentication"
      secret_data         = var.jwt_secret
      enable_rotation     = true
      rotation_period     = "2592000s"  # 30 days
    }
  }
  
  # Grant access to the application service account
  service_accounts = {
    "${var.gcp_service_account}" = {
      role    = "roles/secretmanager.secretAccessor"
      secrets = ["jwt-secret-${local.environment}"]
    }
  }
  
  labels = local.labels
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
  min_instances      = var.min_instances
  max_instances      = var.max_instances
  cpu                = "2000m"
  memory             = "2Gi"
  service_account_email = var.gcp_service_account
  
  # Configure health checks
  startup_probe = {
    http_get = {
      path = "/health"
    }
    initial_delay_seconds = 10
    failure_threshold     = 3
  }
  
  liveness_probe = {
    http_get = {
      path = "/health"
    }
    initial_delay_seconds = 30
    period_seconds        = 30
  }
  
  # VPC access if needed
  vpc_connector = var.vpc_connector_name
  vpc_egress    = var.vpc_connector_name != null ? "all-traffic" : null
  
  # Add labels and annotations
  labels = local.labels
  additional_annotations = {
    "run.googleapis.com/vpc-access-egress" = "all-traffic"
  }
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
  min_instances      = var.min_instances
  max_instances      = var.max_instances
  cpu                = "2000m"
  memory             = "2Gi"
  service_account_email = var.gcp_service_account
  
  # Configure health checks
  startup_probe = {
    http_get = {
      path = "/"
    }
    initial_delay_seconds = 10
    failure_threshold     = 3
  }
  
  liveness_probe = {
    http_get = {
      path = "/"
    }
    initial_delay_seconds = 30
    period_seconds        = 30
  }
  
  labels = local.labels
}

# Setup for monitoring and logging if enabled
resource "google_monitoring_alert_policy" "service_latency" {
  count = var.enable_monitoring ? 1 : 0
  
  display_name = "High Service Latency"
  combiner     = "OR"
  
  conditions {
    display_name = "High Backend Latency"
    
    condition_threshold {
      filter          = "resource.type = \"cloud_run_revision\" AND resource.labels.service_name = \"${local.services.backend.name}\" AND metric.type = \"run.googleapis.com/request_latencies\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 1000  # 1 second
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_PERCENTILE_99"
      }
    }
  }
  
  documentation {
    content   = "High latency detected for backend service. Please investigate potential performance issues."
    mime_type = "text/markdown"
  }
  
  notification_channels = []  # Add notification channels if available
  alert_strategy {
    auto_close = "1800s"  # Auto-close after 30 minutes if resolved
  }
  
  user_labels = local.labels
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

output "firestore_database" {
  description = "The Firestore database ID"
  value       = module.firestore.database_id
}

output "secret_ids" {
  description = "Created secret IDs"
  value       = module.secrets.secret_ids
}