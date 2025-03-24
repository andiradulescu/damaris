export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum JobType {
  PROCESS_DATA = 'process_data',
  FILE_PROCESSING = 'file_processing',
  DATA_ENRICHMENT = 'data_enrichment',
  TRANSACTION_VERIFICATION = 'transaction_verification',
  COMPLEX_CALCULATION = 'complex_calculation'
}
