import photos from '@/lib/media/classic-photos.json';
import customer from '@/lib/media/customer-home.json';
import approved from '@/lib/media/editorial-photos.json';

// "Nesillerin Emeği" (story) waits for the customer's own photograph: replace it here, the layout stays.
export const homeMedia = {
  story: approved.assets['hikaye-ana'],
  storyDetail: approved.assets['hikaye-dal'],
  oil: approved.assets['zeytinyagi-dikey'],
  olive: approved.assets['zeytin-kase'],
  branch: photos.assets['zeytin-dali'],
  factory: customer.assets.fabrika,
  care: customer.assets['her-tanede-ayni-ozen-el'],
  harvest: customer.assets['bereketin-hasat-vakti'],
};
