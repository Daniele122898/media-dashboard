export interface HashEventData {
  path: string;
}

export interface MultiHashEventData {
  paths: string[];
}

export interface MultiHashResponse {
  path: string;
  hash: string;
}
