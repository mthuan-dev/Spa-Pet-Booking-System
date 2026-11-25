export function redirectToVnpay(bookingId, value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || !['sandbox.vnpayment.vn', 'secure.vnpayment.vn'].includes(url.hostname)
      || url.username || url.password) {
    throw new Error('Chưa mở được cổng thanh toán. Vui lòng vào chi tiết lịch hẹn để tiếp tục.')
  }
  sessionStorage.setItem('vnpay_pending_booking_id', String(bookingId))
  // Back should return to the previous page, not resubmit a completed checkout form.
  window.location.assign(url.href)
}

export function readVnpayReturn(search) {
  const parameters = {}
  for (const [key, value] of new URLSearchParams(search)) {
    if (!key.startsWith('vnp_')) continue
    if (Object.hasOwn(parameters, key)) throw new Error('Kết quả thanh toán không hợp lệ.')
    parameters[key] = value
  }
  return parameters
}
