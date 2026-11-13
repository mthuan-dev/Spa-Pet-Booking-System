import { useSearchParams } from 'react-router-dom';
import { useServiceCatalog } from '../api/catalog.js';
import { PET_TYPES } from './catalogShared.jsx';
import WeightPriceAccordion from './WeightPriceAccordion.jsx';

const WeightPriceManagementPage = () => {
  const query = useServiceCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedType = searchParams.get('loai');
  const petType = PET_TYPES.some((item) => item.value === selectedType) ? selectedType : 'DOG';
  return (
    <WeightPriceAccordion query={query} petType={petType}
      onTypeChange={(value) => setSearchParams({ loai: value })} />
  );
};

export default WeightPriceManagementPage;
