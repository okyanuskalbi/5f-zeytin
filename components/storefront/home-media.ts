import photos from '@/lib/media/classic-photos.json';
import customer from '@/lib/media/customer-home.json';

// Two pending customer assets can be replaced here, without changing the layout.
export const homeMedia = {
  story: photos.assets.zeytinlik,
  oil: photos.assets.zeytinyagi,
  olive: photos.assets['kirma-zeytin'],
  branch: photos.assets['zeytin-dali'],
  factory: customer.assets.fabrika,
  care: customer.assets['her-tanede-ayni-ozen-el'],
  harvest: customer.assets['bereketin-hasat-vakti'],
};
