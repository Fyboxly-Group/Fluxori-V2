/**
 * Module for managing Google Secret Manager resources
 *
 * This module provides a comprehensive solution for managing secrets in Google Secret Manager,
 * including secret creation, versioning, rotation, access control, and more.
 */

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "secrets" {
  description = "Map of secrets to create"
  type = map(object({
    secret_id                   = string
    description                 = optional(string, "")
    automatic_replication       = optional(bool, true)
    replication_locations       = optional(list(string), [])
    secret_data                 = optional(string, null)
    enable_rotation             = optional(bool, false)
    rotation_period             = optional(string, null)
    next_rotation_time          = optional(string, null)
    rotation_notification_email = optional(string, null)
    expiration_time             = optional(string, null)
    expire_time                 = optional(string, null)
    ttl                         = optional(string, null)
  }))
}

variable "labels" {
  description = "Labels to apply to all secrets"
  type        = map(string)
  default     = {}
}

variable "service_accounts" {
  description = "Map of service accounts and their roles for accessing secrets"
  type = map(object({
    role = string  # e.g., "roles/secretmanager.secretAccessor"
    secrets = list(string)  # List of secret_ids this SA can access
  }))
  default = {}
}

variable "access_bindings" {
  description = "Map of IAM bindings to apply to all secrets"
  type = map(list(string))
  default = {}
  # Example: { "roles/secretmanager.secretAccessor" = ["serviceAccount:my-sa@project.iam.gserviceaccount.com"] }
}

variable "enable_secret_manager_api" {
  description = "Whether to enable the Secret Manager API"
  type        = bool
  default     = true
}

locals {
  # Filter secrets with secret_data provided
  secrets_with_data = {
    for k, v in var.secrets : k => v if v.secret_data != null
  }
  
  # Create a map of service accounts and secrets they should access
  sa_secret_bindings = flatten([
    for sa_name, sa_config in var.service_accounts : [
      for secret_id in sa_config.secrets : {
        sa        = sa_name
        role      = sa_config.role
        secret_id = secret_id
      }
    ]
  ])
}

# Enable Secret Manager API if requested
resource "google_project_service" "secret_manager_api" {
  count   = var.enable_secret_manager_api ? 1 : 0
  project = var.project_id
  service = "secretmanager.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_secret_manager_secret" "secrets" {
  for_each  = var.secrets
  project   = var.project_id
  secret_id = each.value.secret_id
  
  labels = var.labels
  
  replication {
    dynamic "user_managed" {
      for_each = each.value.automatic_replication ? [] : [1]
      content {
        dynamic "replicas" {
          for_each = each.value.replication_locations
          content {
            location = replicas.value
          }
        }
      }
    }
    
    automatic = each.value.automatic_replication
  }
  
  dynamic "rotation" {
    for_each = each.value.enable_rotation ? [1] : []
    content {
      next_rotation_time = each.value.next_rotation_time
      rotation_period    = each.value.rotation_period
    }
  }
  
  dynamic "topics" {
    for_each = each.value.rotation_notification_email != null ? [1] : []
    content {
      name = each.value.rotation_notification_email
    }
  }
  
  dynamic "expiration" {
    for_each = each.value.ttl != null || each.value.expire_time != null || each.value.expiration_time != null ? [1] : []
    content {
      ttl          = each.value.ttl
      expire_time  = each.value.expire_time
    }
  }
  
  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "versions" {
  for_each = local.secrets_with_data
  
  secret      = google_secret_manager_secret.secrets[each.key].id
  secret_data = each.value.secret_data
  
  depends_on = [google_secret_manager_secret.secrets]
}

# IAM bindings for specific service accounts
resource "google_secret_manager_secret_iam_member" "sa_access" {
  for_each = {
    for idx, binding in local.sa_secret_bindings : 
    "${binding.sa}-${binding.secret_id}-${binding.role}" => binding
    if contains(keys(var.secrets), binding.secret_id)
  }
  
  project   = var.project_id
  secret_id = google_secret_manager_secret.secrets[each.value.secret_id].secret_id
  role      = each.value.role
  member    = "serviceAccount:${each.value.sa}"
}

# IAM bindings for all secrets
resource "google_secret_manager_secret_iam_binding" "all_secrets_bindings" {
  for_each = {
    for role, members in var.access_bindings : 
    role => members
  }
  
  project   = var.project_id
  secret_id = "*"
  role      = each.key
  members   = each.value
}

output "secret_ids" {
  description = "Map of created secret IDs"
  value = {
    for k, v in google_secret_manager_secret.secrets : k => v.secret_id
  }
}

output "secret_versions" {
  description = "Map of created secret versions"
  value = {
    for k, v in google_secret_manager_secret_version.versions : k => v.version
  }
}

output "secret_state" {
  description = "Map of the state of the created secrets"
  value = {
    for k, v in google_secret_manager_secret.secrets : k => v.replication.0.automatic
  }
}

output "secret_full_ids" {
  description = "Map of created secret full resource IDs"
  value = {
    for k, v in google_secret_manager_secret.secrets : k => v.id
  }
}

output "access_details" {
  description = "Details of service account access to secrets"
  value = {
    for idx, binding in google_secret_manager_secret_iam_member.sa_access : 
    idx => {
      service_account = binding.member
      secret = binding.secret_id
      role = binding.role
    }
  }
}