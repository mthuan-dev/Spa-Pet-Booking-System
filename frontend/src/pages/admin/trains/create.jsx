import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Button, Flex, Form, Input, Select, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomAsyncSelect from '~/components/ui/CustomAsyncSelect.jsx';
import PageHeader from '~/components/ui/page-header.jsx';
import RULES from '~/app/config/rule.js';
import { useCarriageLayouts } from '~/features/carriages/api/get-layouts.jsx';
import { move } from '@dnd-kit/helpers';
import { useCreateTrain } from '~/features/trains/api/create-train.jsx';
import { useAllSeatTypes } from '~/features/trains/api/get-all-seat-types.jsx';
import { useGetRoutes } from '~/features/trains/api/get-routes.js';
import CarriageSortableItem from '~/features/trains/components/CarriageSortableItem.jsx';
import SelectedCarriagesTable from '~/features/trains/components/SelectedCarriagesTable.jsx';
import TrainContainer from '~/features/trains/components/TrainContainer.jsx';

const TrainsManagement = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const [carriages, setCarriages] = useState([]);

  const [selectedCarriage, setSelectedCarriage] = useState(null);

  const [seatPrices, setSeatPrices] = useState([]);

  const { data: allSeatTypes } = useAllSeatTypes({
    retry: false,
  });

  const { data: routes } = useGetRoutes();

  const mutation = useCreateTrain({
    mutationConfig: {
      onSuccess: ({ id }) => {
        navigate(`/admin/trains/${id}`);
        message.success('OK bro!');
      },
      onError: () => {
        message.error('Something went wrong!');
      },
    },
  });

  useEffect(() => {
    if (allSeatTypes) {
      setSeatPrices(
        allSeatTypes?.map((seatType) => ({ seat_type_id: seatType.id, price: seatType.original_price_per_km })),
      );
    }
  }, [allSeatTypes]);

  const handleDragEnd = (event) => {
    if (!event.canceled) setCarriages((items) => move(items, event));
  };

  const handleAddCarriage = () => {
    if (selectedCarriage) {
      setCarriages((prev) => [...prev, { ...selectedCarriage, id: crypto.randomUUID() }]);
    }
  };

  const handleRemoveCarriage = (index) => {
    setCarriages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      try {
        const validatedSeatPrices = seatPrices.map((item) => ({
          seat_type_id: item.seat_type_id,
          price: parseFloat(item.price) > 0 ? parseFloat(item.price) : 0,
        }));
        const data = {
          name: values?.name,
          routeId: values?.route,
          carriagesList: carriages.map((item) => item.value),
          seatPricesList: validatedSeatPrices,
        };
        mutation.mutate({ data });
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        message.error('Vui lòng nhập giá vé cho tất cả các loại ghế');
      }
    });
  };

  const handleChangePriceOfItem = (id, price) => {
    setSeatPrices((prev) => prev.map((item) => (item.seat_type_id === id ? { ...item, price } : item)));
  };

  const formattedCarriages = useMemo(() => {
    return carriages.map((item, index) => ({
      index,
      key: item.id,
      name: item.label,
      structure: `${item.floors} tầng, ${item.row_count} hàng`,
      seats: item.seats.length,
    }));
  }, [carriages]);

  const routesOptions = useMemo(
    () =>
      routes?.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [routes],
  );

  return (
    <>
      <Flex align="center" justify="space-between" className="mb-2">
        <PageHeader
          heading="Tạo tàu"
          links={[
            { title: 'Trang chủ', href: '/admin' },
            { title: 'Tàu hỏa', href: '/admin/trains' },
            { title: 'Tạo tàu hỏa' },
          ]}
        />
        <Space>
          <Button onClick={handleSave} type="primary" icon={<SaveOutlined />}>
            Tạo ngay
          </Button>
        </Space>
      </Flex>
      <Flex className="" gap={20}>
        <Flex vertical align="center" className="w-[40%] bg-white border-[1px] border-[#ccc] rounded-lg p-4">
          <Flex justify="center" className="py-4 w-full ">
            <TrainContainer onDragEnd={handleDragEnd}>
              {carriages?.map((item, index) => (
                <CarriageSortableItem
                  key={item.id}
                  id={item.id}
                  index={index}
                  label={item.label}
                  floors={item.floors}
                  row_count={item.row_count}
                  seats={item.seats}
                />
              ))}
            </TrainContainer>
          </Flex>
        </Flex>
        <Form
          form={form}
          initialValues={{
            name: '',
            routes: null,
            seat_prices: [],
          }}
          layout="vertical"
          className="w-[60%]"
        >
          <Flex vertical className="w-full" gap={20}>
            <Flex vertical className="w-full  bg-white border border-[#ccc] rounded-lg p-4">
              <h1 className="text-lg font-semibold text-center">Thông tin tàu hỏa</h1>
              <Form.Item
                label="Tên tàu"
                name="name"
                rules={RULES.createTrain.name}
                required={true}
                validateTrigger="onChange"
              >
                <Input placeholder="Nhập tên toa tàu..." />
              </Form.Item>

              <Form.Item label="Tuyến đường" name="route" rules={RULES.createTrain.route} required={true}>
                <Select options={routesOptions} />
              </Form.Item>
              <Form.Item label="Chọn toa tàu">
                <Flex gap={8}>
                  <CustomAsyncSelect
                    loadQuery={useCarriageLayouts}
                    setValue={setSelectedCarriage}
                    config={{ value: 'id', label: 'name', floors: 'floors', row_count: 'row_count', seats: 'seats' }}
                  />
                  <Button onClick={handleAddCarriage} type="primary" icon={<PlusOutlined />} />
                </Flex>
              </Form.Item>
              <Flex vertical gap={12}>
                <h1>Các toa đã chọn</h1>
                <SelectedCarriagesTable
                  data={formattedCarriages}
                  handleRemoveItem={handleRemoveCarriage}
                  isEdit={true}
                />
              </Flex>
            </Flex>
            <Flex vertical className="w-full  bg-white border border-[#ccc] rounded-lg p-4" gap={10}>
              <h1 className="text-lg font-semibold text-center">Thông tin giá ghế</h1>
              <Flex vertical gap={10}>
                {allSeatTypes?.map((item) => (
                  <Form.Item
                    key={item.id}
                    label={item.name}
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập giá vé',
                      },
                    ]}
                    required={true}
                    validateTrigger="onChange"
                  >
                    <Input
                      placeholder="Nhập giá vé..."
                      type="number"
                      defaultValue={item.original_price_per_km}
                      onChange={(e) => {
                        handleChangePriceOfItem(item.id, e.target.value);
                      }}
                    />
                  </Form.Item>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </Form>
      </Flex>
    </>
  );
};

export default TrainsManagement;
