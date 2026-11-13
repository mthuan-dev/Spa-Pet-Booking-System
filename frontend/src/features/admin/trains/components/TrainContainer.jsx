import { DragDropProvider } from '@dnd-kit/react';
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';

const verticalModifiers = [RestrictToVerticalAxis];

const TrainContainer = ({ children, onDragEnd, vertical = false }) => {
  return (
    <DragDropProvider onDragEnd={onDragEnd} modifiers={vertical ? verticalModifiers : undefined}>
      <div className="table mx-auto p-4 rounded-lg w-[272px] bg-[#f2f2f2]">
        <div className="relative ">{children}</div>
      </div>
    </DragDropProvider>
  );
};
export default TrainContainer;
