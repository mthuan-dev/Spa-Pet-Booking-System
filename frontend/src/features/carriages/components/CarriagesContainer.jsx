import { DragDropProvider } from '@dnd-kit/react';

const CarriagesContainer = ({ children, onDragEnd }) => {
  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <div className="table bg-[#f2f2f2] w-[460px] mx-auto p-4 rounded-lg">
        <div className="relative ">{children}</div>
      </div>
    </DragDropProvider>
  );
};
export default CarriagesContainer;
