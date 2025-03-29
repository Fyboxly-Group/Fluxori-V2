variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources to"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The zone to deploy resources to"
  type        = string
  default     = "us-central1-a"
}

variable "mongodb_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret for JWT token generation"
  type        = string
  sensitive   = true
}

variable "gcp_service_account" {
  description = "GCP service account email for the application"
  type        = string
  default     = null
}

variable "min_instances" {
  description = "Minimum number of instances for the services"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances for the services"
  type        = number
  default     = 5
}