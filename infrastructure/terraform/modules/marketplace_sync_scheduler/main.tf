/**
 * Marketplace Sync Scheduler Module
 *
 * This module creates and configures the Cloud Scheduler job that triggers 
 * the marketplace synchronization process in the Fluxori application.
 */

# Required inputs
variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region to deploy the Cloud Scheduler job to"
  type        = string
  default     = "us-central1"
}

variable "service_account_email" {
  description = "The service account email that the scheduler will use for authentication"
  type        = string
}

variable "sync_endpoint_url" {
  description = "The URL of the marketplace sync endpoint"
  type        = string
}

# Configurable scheduler settings
variable "schedule_cron" {
  description = "The CRON schedule expression for the sync job"
  type        = string
  default     = "*/15 * * * *"  # Default: every 15 minutes
}

variable "scheduler_job_name" {
  description = "Name of the Cloud Scheduler job"
  type        = string
  default     = "marketplace-sync-scheduler"
}

variable "scheduler_job_description" {
  description = "Description of the Cloud Scheduler job"
  type        = string
  default     = "Triggers periodic marketplace data synchronization"
}

variable "scheduler_time_zone" {
  description = "The timezone for the scheduler"
  type        = string
  default     = "UTC"
}

# Configure scheduler retry settings
variable "scheduler_retry_count" {
  description = "Number of retry attempts if the job fails"
  type        = number
  default     = 3
}

variable "scheduler_min_backoff_seconds" {
  description = "Minimum time between retry attempts in seconds"
  type        = number
  default     = 30
}

variable "scheduler_max_backoff_seconds" {
  description = "Maximum time between retry attempts in seconds"
  type        = number
  default     = 300
}

variable "scheduler_max_retry_duration_seconds" {
  description = "Maximum time to retry in seconds"
  type        = number
  default     = 600
}

variable "scheduler_max_doublings" {
  description = "Maximum number of times to double the backoff between retries"
  type        = number
  default     = 5
}

# Authentication headers
variable "custom_headers" {
  description = "Additional HTTP headers to include with the scheduler request"
  type        = map(string)
  default     = {}
  sensitive   = true
}

# Create the Cloud Scheduler job
resource "google_cloud_scheduler_job" "marketplace_sync_job" {
  name        = var.scheduler_job_name
  description = var.scheduler_job_description
  schedule    = var.schedule_cron
  time_zone   = var.scheduler_time_zone
  region      = var.region
  project     = var.project_id
  
  # Configure retry policy to handle transient failures
  retry_config {
    retry_count          = var.scheduler_retry_count
    max_retry_duration   = "${var.scheduler_max_retry_duration_seconds}s"
    min_backoff_duration = "${var.scheduler_min_backoff_seconds}s"
    max_backoff_duration = "${var.scheduler_max_backoff_seconds}s"
    max_doublings        = var.scheduler_max_doublings
  }
  
  # HTTP target configuration
  http_target {
    uri         = var.sync_endpoint_url
    http_method = "POST"
    
    # Use OIDC for authentication to the Cloud Run service
    # This is more secure than using a shared secret in headers
    oidc_token {
      service_account_email = var.service_account_email
      audience              = var.sync_endpoint_url
    }
    
    # Include any required headers
    headers = var.custom_headers
    
    # Optional body for the request - can be empty or include specific parameters
    body = base64encode(jsonencode({
      source = "cloud-scheduler",
      triggerType = "scheduled",
      timestamp = "$${SCHEDULER_TIME}"  # Special Cloud Scheduler variable
    }))
  }
}

# Create the IAM binding to allow the scheduler to invoke the Cloud Run service
resource "google_cloud_run_service_iam_binding" "scheduler_invoker" {
  location = var.region
  project  = var.project_id
  service  = element(split("/", var.sync_endpoint_url), length(split("/", var.sync_endpoint_url)) - 1)
  role     = "roles/run.invoker"
  members  = [
    "serviceAccount:${var.service_account_email}"
  ]
}

# Outputs
output "scheduler_job_id" {
  description = "The ID of the Cloud Scheduler job"
  value       = google_cloud_scheduler_job.marketplace_sync_job.id
}

output "scheduler_job_name" {
  description = "The name of the Cloud Scheduler job"
  value       = google_cloud_scheduler_job.marketplace_sync_job.name
}

output "next_schedule_time" {
  description = "The time the next job is scheduled to run"
  value       = google_cloud_scheduler_job.marketplace_sync_job.state
}