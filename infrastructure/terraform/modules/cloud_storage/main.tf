/**
 * Module for creating and configuring Google Cloud Storage buckets
 */

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "bucket_name" {
  description = "The name of the GCS bucket"
  type        = string
}

variable "location" {
  description = "The location of the bucket"
  type        = string
  default     = "US"
}

variable "storage_class" {
  description = "The storage class of the bucket"
  type        = string
  default     = "STANDARD"
  
  validation {
    condition     = contains(["STANDARD", "MULTI_REGIONAL", "REGIONAL", "NEARLINE", "COLDLINE", "ARCHIVE"], var.storage_class)
    error_message = "The storage_class must be one of STANDARD, MULTI_REGIONAL, REGIONAL, NEARLINE, COLDLINE, or ARCHIVE."
  }
}

variable "versioning_enabled" {
  description = "Whether to enable versioning for the bucket"
  type        = bool
  default     = false
}

variable "uniform_bucket_level_access" {
  description = "Whether to enable uniform bucket-level access"
  type        = bool
  default     = true
}

variable "public_access_prevention" {
  description = "Public access prevention setting (enforced or inherited)"
  type        = string
  default     = "enforced"
  
  validation {
    condition     = contains(["enforced", "inherited"], var.public_access_prevention)
    error_message = "The public_access_prevention must be either enforced or inherited."
  }
}

variable "lifecycle_rules" {
  description = "List of lifecycle rules for the bucket"
  type = list(object({
    action = object({
      type          = string
      storage_class = optional(string)
    })
    condition = object({
      age                   = optional(number)
      created_before        = optional(string)
      with_state            = optional(string)
      matches_storage_class = optional(list(string))
      num_newer_versions    = optional(number)
      days_since_noncurrent_time = optional(number)
    })
  }))
  default = []
}

variable "cors_rules" {
  description = "CORS configuration for the bucket"
  type = list(object({
    origins          = list(string)
    methods          = list(string)
    response_headers = list(string)
    max_age_seconds  = number
  }))
  default = []
}

variable "labels" {
  description = "Labels to apply to the bucket"
  type        = map(string)
  default     = {}
}

variable "force_destroy" {
  description = "When deleting a bucket, delete all objects in the bucket"
  type        = bool
  default     = false
}

resource "google_storage_bucket" "bucket" {
  name          = var.bucket_name
  location      = var.location
  project       = var.project_id
  storage_class = var.storage_class
  force_destroy = var.force_destroy
  labels        = var.labels

  uniform_bucket_level_access = var.uniform_bucket_level_access
  public_access_prevention    = var.public_access_prevention

  versioning {
    enabled = var.versioning_enabled
  }

  dynamic "lifecycle_rule" {
    for_each = var.lifecycle_rules
    content {
      action {
        type          = lifecycle_rule.value.action.type
        storage_class = lifecycle_rule.value.action.storage_class
      }
      condition {
        age                   = lifecycle_rule.value.condition.age
        created_before        = lifecycle_rule.value.condition.created_before
        with_state            = lifecycle_rule.value.condition.with_state
        matches_storage_class = lifecycle_rule.value.condition.matches_storage_class
        num_newer_versions    = lifecycle_rule.value.condition.num_newer_versions
        days_since_noncurrent_time = lifecycle_rule.value.condition.days_since_noncurrent_time
      }
    }
  }

  dynamic "cors" {
    for_each = var.cors_rules
    content {
      origin          = cors.value.origins
      method          = cors.value.methods
      response_header = cors.value.response_headers
      max_age_seconds = cors.value.max_age_seconds
    }
  }
}

output "bucket_name" {
  description = "The name of the bucket"
  value       = google_storage_bucket.bucket.name
}

output "bucket_url" {
  description = "The URL of the bucket"
  value       = google_storage_bucket.bucket.url
}

output "bucket_self_link" {
  description = "The self link of the bucket"
  value       = google_storage_bucket.bucket.self_link
}