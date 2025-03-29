/**
 * Module for creating Google Cloud Run services
 *
 * This module provides a complete implementation for deploying containerized applications to
 * Google Cloud Run with appropriate scaling, networking, and security configurations.
 */

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region to deploy the Cloud Run service to"
  type        = string
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
}

variable "image" {
  description = "The container image to deploy"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU allocation for the container"
  type        = string
  default     = "1000m"
}

variable "memory" {
  description = "Memory allocation for the container"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "timeout_seconds" {
  description = "Maximum request timeout in seconds"
  type        = number
  default     = 300
}

variable "concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 80
}

variable "env_vars" {
  description = "Environment variables to set in the container"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secret environment variables"
  type = list(object({
    name        = string
    secret_name = string
    version     = string
  }))
  default = []
}

variable "service_account_email" {
  description = "Service account email to use for the service"
  type        = string
  default     = null
}

variable "allow_public_access" {
  description = "Whether to allow unauthenticated access"
  type        = bool
  default     = false
}

variable "vpc_connector" {
  description = "VPC connector to use for the service"
  type        = string
  default     = null
}

variable "vpc_egress" {
  description = "VPC egress settings (all-traffic or private-ranges-only)"
  type        = string
  default     = null
  
  validation {
    condition     = var.vpc_egress == null || var.vpc_egress == "all-traffic" || var.vpc_egress == "private-ranges-only"
    error_message = "VPC egress must be either all-traffic or private-ranges-only."
  }
}

variable "startup_probe" {
  description = "Configuration for startup probe"
  type = object({
    initial_delay_seconds = optional(number, 0)
    timeout_seconds      = optional(number, 1)
    period_seconds       = optional(number, 3)
    failure_threshold    = optional(number, 3)
    http_get = optional(object({
      path = string
      port = optional(number)
    }))
    tcp_socket = optional(object({
      port = number
    }))
  })
  default = null
}

variable "liveness_probe" {
  description = "Configuration for liveness probe"
  type = object({
    initial_delay_seconds = optional(number, 0)
    timeout_seconds      = optional(number, 1)
    period_seconds       = optional(number, 10)
    failure_threshold    = optional(number, 3)
    http_get = optional(object({
      path = string
      port = optional(number)
    }))
    tcp_socket = optional(object({
      port = number
    }))
  })
  default = null
}

variable "command" {
  description = "Optional command to run in the container"
  type        = list(string)
  default     = []
}

variable "args" {
  description = "Optional arguments to pass to the container entry point"
  type        = list(string)
  default     = []
}

variable "ingress" {
  description = "Ingress traffic settings for Cloud Run (all, internal, or internal-and-cloud-load-balancing)"
  type        = string
  default     = "all"
  
  validation {
    condition     = contains(["all", "internal", "internal-and-cloud-load-balancing"], var.ingress)
    error_message = "Ingress must be one of: all, internal, or internal-and-cloud-load-balancing."
  }
}

variable "labels" {
  description = "Labels to apply to the Cloud Run service"
  type        = map(string)
  default     = {}
}

variable "additional_annotations" {
  description = "Additional annotations to add to the Cloud Run service template"
  type        = map(string)
  default     = {}
}

locals {
  default_annotations = {
    "autoscaling.knative.dev/minScale" = var.min_instances
    "autoscaling.knative.dev/maxScale" = var.max_instances
  }
  
  combined_annotations = merge(local.default_annotations, var.additional_annotations)
}

resource "google_cloud_run_service" "service" {
  name     = var.service_name
  location = var.region
  project  = var.project_id
  
  metadata {
    labels = var.labels
  }

  template {
    spec {
      containers {
        image = var.image
        
        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }
        
        ports {
          container_port = var.container_port
        }
        
        dynamic "command" {
          for_each = length(var.command) > 0 ? [1] : []
          content {
            command = var.command
          }
        }
        
        dynamic "args" {
          for_each = length(var.args) > 0 ? [1] : []
          content {
            args = var.args
          }
        }

        dynamic "env" {
          for_each = var.env_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        dynamic "env" {
          for_each = var.secrets
          content {
            name = env.value.name
            value_from {
              secret_key_ref {
                name = env.value.secret_name
                key  = env.value.version
              }
            }
          }
        }
        
        dynamic "startup_probe" {
          for_each = var.startup_probe != null ? [var.startup_probe] : []
          content {
            initial_delay_seconds = startup_probe.value.initial_delay_seconds
            timeout_seconds       = startup_probe.value.timeout_seconds
            period_seconds        = startup_probe.value.period_seconds
            failure_threshold     = startup_probe.value.failure_threshold
            
            dynamic "http_get" {
              for_each = startup_probe.value.http_get != null ? [startup_probe.value.http_get] : []
              content {
                path = http_get.value.path
                port = http_get.value.port != null ? http_get.value.port : var.container_port
              }
            }
            
            dynamic "tcp_socket" {
              for_each = startup_probe.value.tcp_socket != null ? [startup_probe.value.tcp_socket] : []
              content {
                port = tcp_socket.value.port
              }
            }
          }
        }
        
        dynamic "liveness_probe" {
          for_each = var.liveness_probe != null ? [var.liveness_probe] : []
          content {
            initial_delay_seconds = liveness_probe.value.initial_delay_seconds
            timeout_seconds       = liveness_probe.value.timeout_seconds
            period_seconds        = liveness_probe.value.period_seconds
            failure_threshold     = liveness_probe.value.failure_threshold
            
            dynamic "http_get" {
              for_each = liveness_probe.value.http_get != null ? [liveness_probe.value.http_get] : []
              content {
                path = http_get.value.path
                port = http_get.value.port != null ? http_get.value.port : var.container_port
              }
            }
            
            dynamic "tcp_socket" {
              for_each = liveness_probe.value.tcp_socket != null ? [liveness_probe.value.tcp_socket] : []
              content {
                port = tcp_socket.value.port
              }
            }
          }
        }
      }

      timeout_seconds = var.timeout_seconds
      container_concurrency = var.concurrency
      service_account_name = var.service_account_email

      dynamic "vpc_access" {
        for_each = var.vpc_connector != null ? [1] : []
        content {
          connector = var.vpc_connector
          egress    = var.vpc_egress
        }
      }
    }

    metadata {
      annotations = local.combined_annotations
      labels      = var.labels
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  
  autogenerate_revision_name = true

  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

# Configure ingress settings
resource "google_cloud_run_service_iam_policy" "ingress_policy" {
  count = var.ingress != "all" ? 1 : 0
  
  location    = google_cloud_run_service.service.location
  project     = google_cloud_run_service.service.project
  service     = google_cloud_run_service.service.name
  
  policy_data = jsonencode({
    bindings = [{
      role    = "roles/run.ingress"
      members = var.ingress == "internal" ? ["serviceAccount:${var.service_account_email}"] : 
                var.ingress == "internal-and-cloud-load-balancing" ? [
                  "serviceAccount:${var.service_account_email}",
                  "serviceAccount:service-${var.project_id}@compute-system.iam.gserviceaccount.com"
                ] : []
    }]
  })
}

# Allow unauthenticated access if specified
resource "google_cloud_run_service_iam_member" "public" {
  count    = var.allow_public_access ? 1 : 0
  service  = google_cloud_run_service.service.name
  location = google_cloud_run_service.service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Create IAM binding for Cloud Run services that need authenticated access
resource "google_cloud_run_service_iam_binding" "service_access" {
  count    = var.allow_public_access ? 0 : 1
  location = google_cloud_run_service.service.location
  service  = google_cloud_run_service.service.name
  role     = "roles/run.invoker"
  members  = var.service_account_email != null ? ["serviceAccount:${var.service_account_email}"] : []
}

output "service_url" {
  description = "The URL of the deployed service"
  value       = google_cloud_run_service.service.status[0].url
}

output "service_name" {
  description = "The name of the service"
  value       = google_cloud_run_service.service.name
}

output "service_id" {
  description = "The ID of the service"
  value       = google_cloud_run_service.service.id
}

output "latest_revision_name" {
  description = "The name of the latest revision"
  value       = google_cloud_run_service.service.status[0].latest_created_revision_name
}

output "service_status" {
  description = "The status of the Cloud Run service"
  value       = google_cloud_run_service.service.status[0].conditions
}