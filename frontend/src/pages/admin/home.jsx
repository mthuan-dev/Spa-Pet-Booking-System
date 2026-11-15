// /admin

import { Card, Col, Flex, Row } from 'antd';
import PageHeader from '~/components/ui/page-header.jsx';
import { useBookingsReport } from '~/features/admin/reports/api/get-bookings-report.js';
import { useMemo } from 'react';
import { useServicesReport } from '~/features/admin/reports/api/get-services-report.js';
import { convertToVnCurrency } from '~/utils/convert.js';
import dayjs from 'dayjs';
import BarChart from '~/components/ui/charts/BarChart.jsx';
import { useCustomersReport } from '~/features/admin/reports/api/get-customers-report.js';
import PieChart from '~/components/ui/charts/PieChart.jsx';

const ReportPage = () => {
  const { data: reportData } = useBookingsReport({
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
    queryConfig: {
      initialData: [],
    },
  });

  const { data: serviceReportData } = useServicesReport({
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
    queryConfig: {
      initialData: [],
    },
  });

  const { data: userOrdersReportData } = useCustomersReport({
    startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
    queryConfig: {
      initialData: {},
    },
  });

  // Dùng useMemo để chuyển dữ liệu doanh thu và dữ liệu theo dịch vụ thành định dạng phù hợp cho biểu đồ
  const revenueReport = useMemo(() => {
    return {
      data: [
        {
          name: 'Doanh thu',
          data: reportData?.map((item) => item.revenue),
        },
      ],
      categories: reportData?.map((item) => item.date),
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

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader heading="Trang chủ" links={[]} />
      </Flex>
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card>
            <PieChart
              title="Thống kê khách hàng spa"
              data={
                ((userOrdersReportData?.guestCustomers || 0) + (userOrdersReportData?.memberCustomers || 0) > 0)
                  ? [userOrdersReportData?.guestCustomers, userOrdersReportData?.memberCustomers]
                  : []
              }
              colors={['#00E396', '#008FFB']}
              labels={['Khách vãng lai', 'Khách nội bộ']}
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
