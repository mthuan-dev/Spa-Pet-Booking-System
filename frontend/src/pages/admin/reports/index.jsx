import { Card, Col, DatePicker, Flex, Row, Select, Space } from 'antd';
import PageHeader from '~/components/ui/page-header.jsx';
import { useBookingsReport } from '~/features/admin/reports/api/get-bookings-report.js';
import { useEffect, useMemo, useState } from 'react';
import { useServicesReport } from '~/features/admin/reports/api/get-services-report.js';
import { convertToVnCurrency } from '~/utils/convert.js';
import dayjs from 'dayjs';
import BarChart from '~/components/ui/charts/BarChart.jsx';

const { RangePicker } = DatePicker;

const FILTER_OPTIONS = [
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

const ReportPage = () => {
  const [filter, setFilter] = useState(FILTER_OPTIONS[0].value);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
  });
  const { data: reportData = [] } = useBookingsReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });

  const { data: serviceReportData = [] } = useServicesReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });

  const { bookingReport, revenueReport } = useMemo(() => {
    return {
      bookingReport: {
        data: [
          {
            name: 'Lượt đặt lịch',
            data: reportData?.map((item) => item.totalBookings),
          },
        ],
        categories: reportData?.map((item) => item.date),
      },
      revenueReport: {
        data: [
          {
            name: 'Doanh thu',
            data: reportData?.map((item) => item.revenue),
          },
        ],
        categories: reportData?.map((item) => item.date),
      },
    };
  }, [reportData]);

  const serviceReport = useMemo(() => {
    return {
      data: [
        {
          name: 'Lượt đặt lịch',
          data: serviceReportData?.map((item) => item.totalBookings),
        },
        {
          name: 'Doanh thu',
          data: serviceReportData?.map((item) => item.revenue),
        },
      ],
      categories: serviceReportData?.map((item) => item.serviceName),
    };
  }, [serviceReportData]);

  const { periodLabel, dateAxis, dateTooltip } = useMemo(() => {
    const start = dayjs(dateRange.startDate), end = dayjs(dateRange.endDate);
    const sameMonth = start.isSame(end, 'month');
    const periodLabel = sameMonth
      ? `Tháng ${start.format('MM/YYYY')}`
      : `${start.format(start.isSame(end, 'year') ? 'DD/MM' : 'DD/MM/YYYY')}–${end.format('DD/MM/YYYY')}`;
    const categories = reportData.map((item) => item.date);
    const interval = categories.length <= 10 ? 1 : categories.length <= 31 ? 5 : Math.ceil(categories.length / 8);
    const labels = new Map(categories.map((value, index) => {
      const date = dayjs(value);
      const monthChanged = index > 0 && !date.isSame(dayjs(categories[index - 1]), 'month');
      const endpoint = index === 0 || index === categories.length - 1;
      const regularTick = interval === 1 || (categories.length <= 31 ? date.date() % interval === 0 : index % interval === 0);
      const label = endpoint || monthChanged || regularTick
        ? date.format(!sameMonth && (index === 0 || monthChanged) ? 'DD/MM' : 'DD') : '';
      return [value, label];
    }));
    return {
      periodLabel,
      dateAxis: {
        categories,
        labels: { rotate: 0, rotateAlways: false, hideOverlappingLabels: true, formatter: (value) => labels.get(value) ?? '' },
        tooltip: { formatter: (value) => dayjs(value).format('DD/MM/YYYY') },
      },
      dateTooltip: { x: { formatter: (value, { dataPointIndex } = {}) => dayjs(categories[dataPointIndex] ?? value).format('DD/MM/YYYY') } },
    };
  }, [reportData, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    switch (filter) {
      case 'WEEK':
        setDateRange({
          startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
          endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
        });
        break;
      case 'MONTH':
        setDateRange({
          startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
          endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
        });
        break;
      case 'CUSTOM':
        break;
      default:
        break;
    }
  }, [filter]);

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader
          heading="Báo cáo & Thống kê"
          links={[{ title: 'Trang chủ', href: '/admin' }, { title: 'Báo cáo & Thống kê' }]}
        />
        <Space>
          <Select
            style={{
              width: 220,
            }}
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value) => setFilter(value)}
          />
          <RangePicker
            allowClear={false}
            value={[dayjs(dateRange.startDate), dayjs(dateRange.endDate)]}
            onChange={(dates) => {
              if (!dates?.[0] || !dates?.[1]) return;
              setFilter('CUSTOM');
              setDateRange({
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
              });
            }}
          />
        </Space>
      </Flex>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card>
            <BarChart
              title="Thống kê đặt lịch spa"
              periodLabel={periodLabel}
              data={bookingReport?.data || []}
              xaxis={dateAxis}
              tooltip={dateTooltip}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <BarChart
              title="Thống kê doanh thu spa"
              periodLabel={periodLabel}
              data={revenueReport?.data || []}
              xaxis={dateAxis}
              tooltip={dateTooltip}
              yaxis={[
                {
                  opposite: true,
                  labels: {
                    formatter: (val) => convertToVnCurrency(val),
                  },
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card>
            <BarChart
              title="Thống kê lượt đặt và doanh thu theo dịch vụ"
              periodLabel={periodLabel}
              data={serviceReport?.data || []}
              xaxis={{ categories: serviceReport?.categories || [] }}
              yaxis={[
                {
                  labels: {
                    formatter: (val) => val,
                  },
                },
                {
                  opposite: true,
                  labels: {
                    formatter: (val) => convertToVnCurrency(val),
                  },
                },
              ]}
              colors={['#008FFB', '#00E396']}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ReportPage;
