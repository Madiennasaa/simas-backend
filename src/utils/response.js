// Format response konsisten, biar sisi Flutter gampang bikin satu model
// ApiResponse<T> generik buat semua endpoint, gak perlu parsing beda-beda.

function success(res, data, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function failure(res, message = "Terjadi kesalahan", statusCode = 400, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { success, failure };
