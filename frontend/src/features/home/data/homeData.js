import { mockServices } from '../../../mocks/data.js'

export const SERVICES = mockServices.filter((service) => service.madichvu <= 4)

export const SERVICE_CREDITS = {
  1: {
    label: 'Dog shower, animal photography · CC0',
    title: 'Dog shower, animal photography',
    creator: 'rawpixel',
    licence: 'CC0 1.0',
    source: 'rawpixel',
    href: 'https://www.rawpixel.com/image/6025967/photo-image-public-domain-person-dog',
  },
  2: {
    label: 'White Shih tzu Trimmed · CC BY-SA 3.0',
    title: 'White Shih tzu Trimmed',
    creator: 'Cenedlaetholwr Cymreig',
    licence: 'CC BY-SA 3.0',
    source: 'Wikimedia Commons',
    href: 'https://commons.wikimedia.org/w/index.php?curid=98875190',
  },
  3: {
    label: 'Brushing Out the Pyrenees 2 · CC BY-SA 2.0',
    title: 'Brushing Out the Pyrenees 2',
    creator: 'Monkey Mash Button',
    licence: 'CC BY-SA 2.0',
    source: 'Flickr',
    href: 'https://www.flickr.com/photos/62698615@N08/7192358190',
  },
  4: {
    label: 'Sage Mix · CC BY-SA 2.0',
    title: 'Sage Mix',
    creator: 'anglerp1',
    licence: 'CC BY-SA 2.0',
    source: 'Flickr',
    href: 'https://www.flickr.com/photos/88869149@N00/457382511',
  },
}

export const SAMPLE_REVIEWS = [
  {
    madanhgia: 1,
    madatlich: 22,
    userName: 'Ngọc Anh',
    petName: 'Mochi',
    sosao: 5,
    binhluan: 'Mochi về nhà thơm tho, lông mềm mà vẫn rất thoải mái.',
  },
  {
    madanhgia: 2,
    madatlich: 24,
    userName: 'Gia Linh',
    petName: 'Bắp',
    sosao: 5,
    binhluan: 'Mình thích nhất là có thời lượng rõ để dễ sắp xếp lịch.',
  },
  {
    madanhgia: 3,
    madatlich: 19,
    userName: 'Thanh Hà',
    petName: 'Đậu',
    sosao: 5,
    binhluan: 'Bộ lông được chải gọn, nhìn Đậu nhẹ nhõm hẳn.',
  },
].map((review) => ({
  ...review,
  is_hidden: 0,
  ngaytao: '2026-10-26T08:00:00',
  ngaycapnhat: '2026-10-26T08:00:00',
  id: review.madanhgia,
  rating: review.sosao,
  comment: review.binhluan,
}))

export const CONTACT_INFO = {
  phone: '09xx xxx xxx',
  email: 'hello@meomeo.vn',
  address: 'Địa chỉ spa sẽ cập nhật',
}
