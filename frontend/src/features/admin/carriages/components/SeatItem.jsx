import { Flex } from 'antd';
import { useSortable } from '@dnd-kit/react/sortable';

const SeatItem = ({ id, index, title, position = 1, cols = 1, rows = 1 }) => {
  const { ref, isDragging } = useSortable({ id, index });

  return (
    <div
      ref={ref}
      className="style-item-sortable style-item-grid-sortable text-xs"
      style={{
        height: 120,
        width: `${100 / (cols * rows)}%`,
        cursor: 'grab',
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="style-wrapper-sortable">
        <Flex vertical>
          <h1 className="font-semibold text-lg">{position}</h1>
          <h1 className="font-semibold text-xs"> {title}</h1>
        </Flex>
      </div>
    </div>
  );
};

export default SeatItem;
