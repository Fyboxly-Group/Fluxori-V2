/**
 * Module for creating and configuring Firestore database
 *
 * This module provides a comprehensive solution for managing Firestore databases
 * and their associated collections, documents, and access controls.
 */

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region for the Firestore database"
  type        = string
}

variable "database_id" {
  description = "The ID of the Firestore database"
  type        = string
  default     = "(default)"
}

variable "database_type" {
  description = "The type of Firestore database (FIRESTORE_NATIVE or DATASTORE_MODE)"
  type        = string
  default     = "FIRESTORE_NATIVE"

  validation {
    condition     = var.database_type == "FIRESTORE_NATIVE" || var.database_type == "DATASTORE_MODE"
    error_message = "The database_type must be either FIRESTORE_NATIVE or DATASTORE_MODE."
  }
}

variable "concurrency_mode" {
  description = "The concurrency mode for the Firestore database (OPTIMISTIC or PESSIMISTIC)"
  type        = string
  default     = "OPTIMISTIC"

  validation {
    condition     = var.concurrency_mode == "OPTIMISTIC" || var.concurrency_mode == "PESSIMISTIC"
    error_message = "The concurrency_mode must be either OPTIMISTIC or PESSIMISTIC."
  }
}

variable "app_engine_integration_mode" {
  description = "App Engine integration mode (ENABLED or DISABLED)"
  type        = string
  default     = "DISABLED"

  validation {
    condition     = var.app_engine_integration_mode == "ENABLED" || var.app_engine_integration_mode == "DISABLED"
    error_message = "The app_engine_integration_mode must be either ENABLED or DISABLED."
  }
}

variable "delete_protection_state" {
  description = "Delete protection state (DELETE_PROTECTION_STATE_UNSPECIFIED, DELETE_PROTECTION_ENABLED, or DELETE_PROTECTION_DISABLED)"
  type        = string
  default     = "DELETE_PROTECTION_DISABLED"

  validation {
    condition     = contains(["DELETE_PROTECTION_STATE_UNSPECIFIED", "DELETE_PROTECTION_ENABLED", "DELETE_PROTECTION_DISABLED"], var.delete_protection_state)
    error_message = "The delete_protection_state must be one of DELETE_PROTECTION_STATE_UNSPECIFIED, DELETE_PROTECTION_ENABLED, or DELETE_PROTECTION_DISABLED."
  }
}

variable "point_in_time_recovery_enabled" {
  description = "Whether point-in-time recovery is enabled"
  type        = bool
  default     = false
}

variable "ttl_collections" {
  description = "Map of collections to configure with TTL (Time To Live)"
  type = map(object({
    field       = string
    collection_group = string
  }))
  default = {}
}

variable "indexes" {
  description = "List of composite indexes to create"
  type = list(object({
    collection = string
    fields = list(object({
      field_path   = string
      order        = string
      array_config = optional(string)
    }))
    query_scope = optional(string, "COLLECTION")
  }))
  default = []
}

variable "field_indexes" {
  description = "List of field indexes to create"
  type = list(object({
    collection = string
    fields = list(object({
      field_path   = string
      array_config = optional(string)
    }))
  }))
  default = []
}

variable "backup_schedule" {
  description = "Backup schedule configuration (if empty, no backup schedule will be created)"
  type = object({
    retention_days = optional(number, 7)
    time           = optional(string, "00:00")
    recurrence     = optional(string, "0 0 * * *") # Default: Daily at midnight
  })
  default = null
}

variable "create_default_roles" {
  description = "Whether to create default IAM roles for common application patterns"
  type        = bool
  default     = true
}

variable "service_accounts" {
  description = "Map of service accounts and their roles for Firestore"
  type = map(list(string))
  default = {}
  # Example: { "my-sa@project.iam.gserviceaccount.com" = ["roles/datastore.user"] }
}

variable "labels" {
  description = "Labels to apply to the Firestore database"
  type        = map(string)
  default     = {}
}

variable "enable_ttl_service" {
  description = "Whether to enable the Firestore TTL service"
  type        = bool
  default     = false
}

resource "google_project_service" "firestore" {
  project = var.project_id
  service = "firestore.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_project_service" "artifactregistry" {
  count   = var.backup_schedule != null ? 1 : 0
  project = var.project_id
  service = "artifactregistry.googleapis.com"
  
  disable_dependent_services = false
  disable_on_destroy         = false
}

resource "google_firestore_database" "database" {
  project                     = var.project_id
  name                        = var.database_id
  location_id                 = var.region
  type                        = var.database_type
  concurrency_mode            = var.concurrency_mode
  app_engine_integration_mode = var.app_engine_integration_mode
  delete_protection_state     = var.delete_protection_state
  
  point_in_time_recovery_enabled = var.point_in_time_recovery_enabled
  
  depends_on = [google_project_service.firestore]

  lifecycle {
    prevent_destroy = true
  }
}

# Enable TTL service if requested
resource "google_firestore_field" "ttl_collections" {
  for_each = var.enable_ttl_service ? var.ttl_collections : {}
  
  project         = var.project_id
  database        = google_firestore_database.database.name
  collection      = each.value.collection_group
  field           = each.value.field
  ttl_config {}
}

# Create composite indexes
resource "google_firestore_index" "composite_indexes" {
  for_each = { for idx, index in var.indexes : idx => index }
  
  project      = var.project_id
  database     = google_firestore_database.database.name
  collection   = each.value.collection
  query_scope  = each.value.query_scope
  
  dynamic "fields" {
    for_each = each.value.fields
    content {
      field_path   = fields.value.field_path
      order        = fields.value.order
      array_config = fields.value.array_config
    }
  }
  
  depends_on = [google_firestore_database.database]
}

# Configure backups if requested
resource "google_firestore_backup_schedule" "backup_schedule" {
  count    = var.backup_schedule != null ? 1 : 0
  project  = var.project_id
  database = google_firestore_database.database.name
  location = var.region
  
  retention {
    days = var.backup_schedule.retention_days
  }
  
  recurrence {
    crontab = var.backup_schedule.recurrence
  }
  
  depends_on = [
    google_firestore_database.database,
    google_project_service.artifactregistry
  ]
}

# Create IAM roles for service accounts
resource "google_project_iam_member" "service_account_roles" {
  for_each = {
    for pair in flatten([
      for sa, roles in var.service_accounts : [
        for role in roles : {
          sa   = sa
          role = role
        }
      ]
    ]) : "${pair.sa}-${pair.role}" => pair
  }
  
  project = var.project_id
  role    = each.value.role
  member  = "serviceAccount:${each.value.sa}"
}

# Create default IAM roles if requested
resource "google_project_iam_member" "default_roles" {
  for_each = var.create_default_roles ? {
    "app_backend"      = "roles/datastore.user"
    "app_data_service" = "roles/datastore.owner"
  } : {}
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
}

output "database_id" {
  description = "The ID of the Firestore database"
  value       = google_firestore_database.database.name
}

output "database_location" {
  description = "The region of the Firestore database"
  value       = google_firestore_database.database.location_id
}

output "database_type" {
  description = "The type of the Firestore database"
  value       = google_firestore_database.database.type
}

output "ttl_collections" {
  description = "Collections with TTL configured"
  value       = { for k, v in google_firestore_field.ttl_collections : k => v.collection }
}

output "database_name" {
  description = "The fully qualified name of the Firestore database"
  value       = "projects/${var.project_id}/databases/${google_firestore_database.database.name}"
}

output "backup_schedule_id" {
  description = "The ID of the backup schedule, if created"
  value       = var.backup_schedule != null ? google_firestore_backup_schedule.backup_schedule[0].id : null
}