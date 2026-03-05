export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
