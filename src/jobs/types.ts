export enum JobType {
  PROCESS_DATA = 'process_data',
  FILE_PROCESSING = 'file_processing',
  DATA_ENRICHMENT = 'data_enrichment',
  TRANSACTION_VERIFICATION = 'transaction_verification',
  COMPLEX_CALCULATION = 'complex_calculation'
}

export interface JobData {
  [key: string]: any;
}
