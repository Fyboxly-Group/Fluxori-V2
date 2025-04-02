/**
 * Module for creating Google Cloud Scheduler jobs
 *
 * This module manages Cloud Scheduler jobs for triggering Cloud Run services
 * with appropriate authentication and configurations.
 */

variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region to deploy the Cloud Scheduler job to"
  type        = string
}

variable "name" {
  description = "The name of the Cloud Scheduler job"
  type        = string
}

variable "description" {
  description = "The description of the Cloud Scheduler job"
  type        = string
  default     = ""
}

variable "schedule" {
  description = "The cron schedule expression"
  type        = string
}

variable "time_zone" {
  description = "The timezone of the schedule"
  type        = string
  default     = "UTC"
}

variable "target_uri" {
  description = "The URI of the endpoint to be called when the job is triggered"
  type        = string
}

variable "http_method" {
  description = "The HTTP method to use (GET, POST, PUT, DELETE, etc.)"
  type        = string
  default     = "POST"
}

variable "body" {
  description = "The HTTP request body"
  type        = string
  default     = ""
}

variable "headers" {
  description = "HTTP headers to send with the request"
  type        = map(string)
  default     = {}
}

variable "oidc_token" {
  description = "Configuration for OIDC token-based authentication"
  type = object({
    service_account_email = string
    audience              = optional(string)
  })
  default = null
}

variable "attempt_deadline" {
  description = "The deadline for job attempts in seconds"
  type        = number
  default     = 180
}

variable "retry_config" {
  description = "Configuration for how to retry failed jobs"
  type = object({
    retry_count          = optional(number, 3)
    max_retry_duration   = optional(string, "0s")
    min_backoff_duration = optional(string, "5s")
    max_backoff_duration = optional(string, "60s")
    max_doublings        = optional(number, 5)
  })
  default = {}
}

resource "google_cloud_scheduler_job" "job" {
  name        = var.name
  description = var.description
  schedule    = var.schedule
  time_zone   = var.time_zone
  region      = var.region
  project     = var.project_id
  
  attempt_deadline = "${var.attempt_deadline}s"
  
  retry_config {
    retry_count          = var.retry_config.retry_count
    max_retry_duration   = var.retry_config.max_retry_duration
    min_backoff_duration = var.retry_config.min_backoff_duration
    max_backoff_duration = var.retry_config.max_backoff_duration
    max_doublings        = var.retry_config.max_doublings
  }
  
  http_target {
    uri         = var.target_uri
    http_method = var.http_method
    
    headers = var.headers
    
    dynamic "oidc_token" {
      for_each = var.oidc_token != null ? [var.oidc_token] : []
      content {
        service_account_email = oidc_token.value.service_account_email
        audience              = oidc_token.value.audience != null ? oidc_token.value.audience : var.target_uri
      }
    }
    
    body = var.body != "" ? base64encode(var.body) : null
  }
}

output "job_id" {
  description = "The ID of the Cloud Scheduler job"
  value       = google_cloud_scheduler_job.job.id
}

output "job_name" {
  description = "The name of the Cloud Scheduler job"
  value       = google_cloud_scheduler_job.job.name
}