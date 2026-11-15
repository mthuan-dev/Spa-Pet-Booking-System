const DATE_FILTER_OPTIONS = [
  {
    value: 'WEEK',
    label: 'Tuần này',
  },
  {
    value: 'MONTH',
    label: 'Tháng này',
  },
  {
    value: 'CUSTOM',
    label: 'Tùy chỉnh',
  },
];

const PAYMENT_METHOD_FILTER_OPTIONS = [
  {
    value: '',
    label: 'Tất cả',
  },
  {
    value: 'VNPAY',
    label: 'VNPAY',
  },
  {
    value: 'CASH',
    label: 'Tiền mặt',
  },
];

const STATUS_FILTER_OPTIONS = [
  {
    value: '',
    label: 'Tất cả',
  },
  {
    value: 'COMPLETED',
    label: 'COMPLETED',
  },
  {
    value: 'PENDING',
    label: 'PENDING',
  },
  { value: 'CONFIRMED', label: 'CONFIRMED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
];

export { DATE_FILTER_OPTIONS, PAYMENT_METHOD_FILTER_OPTIONS, STATUS_FILTER_OPTIONS };
