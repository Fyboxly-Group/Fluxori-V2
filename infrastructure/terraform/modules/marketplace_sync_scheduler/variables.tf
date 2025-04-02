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

variable "custom_headers" {
  description = "Additional HTTP headers to include with the scheduler request"
  type        = map(string)
  default     = {}
  sensitive   = true
}