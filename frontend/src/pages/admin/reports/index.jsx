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
            defaultValue={FILTER_OPTIONS[0].value}
            style={{
              width: 220,
            }}
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(value) => setFilter(value)}
          />
          <RangePicker
            disabled={filter !== 'CUSTOM'}
            value={[dayjs(dateRange.startDate), dayjs(dateRange.endDate)]}
            onChange={(dates) => {
              setDateRange({
                startDate: dates[0]?.format('YYYY-MM-DD'),
                endDate: dates[1]?.format('YYYY-MM-DD'),
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
              data={bookingReport?.data || []}
              xaxis={{ categories: bookingReport?.categories || [] }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <BarChart
              title="Thống kê doanh thu spa"
              data={revenueReport?.data || []}
              xaxis={{ categories: revenueReport?.categories || [] }}
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
