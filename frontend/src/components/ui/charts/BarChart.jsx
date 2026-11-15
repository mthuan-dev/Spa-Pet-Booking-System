import ReactApexChart from 'react-apexcharts';

const BarChart = ({ data = [], xaxis = {}, yaxis = {}, title = '', periodLabel = '', tooltip = {}, colors = ['#008FFB'] }) => {
  return (
    <ReactApexChart
      options={{
        chart: {
          fontFamily: 'inherit',
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },
        xaxis,
        yaxis,
        tooltip,
        dataLabels: {
          enabled: false,
        },
        colors,
        title: {
          text: title,
        },
        ...(periodLabel && {
          subtitle: {
            text: periodLabel,
            align: 'right',
            offsetY: 2,
            floating: true,
            style: { fontSize: '12px', color: '#8c8c8c' },
          },
          responsive: [{
            breakpoint: 1200,
            options: { subtitle: { offsetY: 26, floating: false } },
          }],
        }),
      }}
      series={data}
      type="bar"
      height={300}
    />
  );
};

export default BarChart;
