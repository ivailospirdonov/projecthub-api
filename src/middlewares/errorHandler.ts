export function errorHandler(err: any, req: any, res: any, next: any) {
  console.log("err", err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Something went wrong",
    },
  });
}
