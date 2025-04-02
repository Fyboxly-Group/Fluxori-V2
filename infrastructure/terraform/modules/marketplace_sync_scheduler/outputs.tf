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