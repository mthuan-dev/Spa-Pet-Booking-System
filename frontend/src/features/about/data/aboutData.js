import bath from '../../../assets/images/services/dog-shower-animal-photography.webp'
import portrait from '../../../assets/images/about-picture/hinhcho.jpg'
import brush from '../../../assets/images/services/brushing-out-the-pyrenees-2.jpg'
import sage from '../../../assets/images/services/sage-mix.jpg'
import attentive from '../../../assets/images/about-picture/cham-soc-tan-tam.jpg'
import gentle from '../../../assets/images/about-picture/cham-soc-diu-dang.jpg'
import joyful from '../../../assets/images/about-picture/niem-vui-tron-ven.jpg'
import story from '../../../assets/images/about-picture/chuyen-chung-minh.jpg'
import meticulousCare from '../../../assets/images/about-picture/cham-soc-ti-mi.jpg'
import moment1 from '../../../assets/images/about-picture/moment-1.jpg'
import moment2 from '../../../assets/images/about-picture/moment-2.jpg'
import moment3 from '../../../assets/images/about-picture/moment-3.jpg'
import moment4 from '../../../assets/images/about-picture/moment-4.jpg'

export const TAB_PHOTOS = {
  story: { src: story, alt: 'Câu chuyện của chúng mình tại MEOMEO' },
  care: { src: meticulousCare, alt: 'Chăm sóc tỉ mỉ cho từng bé thú cưng' },
}
export const MOMENT_PHOTOS = [moment1, moment2, moment3, moment4].map((src, index) => ({
  src, alt: `Khoảnh khắc đáng yêu ${index + 1} của những người bạn nhỏ`,
}))

export const CARE_MOMENTS = [
  { src: attentive, title: 'Chăm sóc tận tâm', alt: 'Khoảnh khắc chăm sóc tận tâm tại spa thú cưng', description: 'Chỉn chu trong từng bước chăm sóc, từ làm sạch bộ lông đến những chi tiết nhỏ nhất.' },
  { src: gentle, title: 'Dịu dàng với từng bé', alt: 'Thú cưng được chăm sóc dịu dàng', description: 'Lắng nghe và làm quen theo nhịp của bé, để mỗi lần ghé thăm đều thật thoải mái.' },
  { src: joyful, title: 'Niềm vui trọn vẹn', alt: 'Người bạn nhỏ trong khoảnh khắc vui vẻ', description: 'Một diện mạo gọn gàng, một bộ lông mềm thơm và niềm vui khi trở về bên sen.' },
]

const address = '273 An Dương Vương, Phường Chợ Quán, Thành phố Hồ Chí Minh, Việt Nam.'
export const ABOUT = Object.freeze({ address, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` })
export const PHOTOS = {
  portrait: { src: portrait, width: 1280, height: 960, alt: 'Chú chó trắng quấn khăn xanh' },
  bath: { src: bath, width: 1024, height: 683, alt: 'Một chú chó đang được tắm và làm sạch bộ lông', caption: 'Chăm chút từ những điều nhỏ.' },
  brush: { src: brush, width: 1024, height: 683, alt: 'Chải bộ lông dày cho một chú chó Pyrenees', caption: 'Chậm một chút, dịu dàng hơn.' },
  sage: { src: sage, width: 1024, height: 768, alt: 'Chú chó Sage với ánh nhìn gần gũi', caption: 'Những người bạn khiến mỗi ngày vui hơn.' },
}
export const TABS = [
  { id: 'story', label: 'Câu chuyện của chúng mình' }, { id: 'grooming', label: 'Spa & Grooming' },
  { id: 'care', label: 'Sự chăm sóc tận tâm' }, { id: 'moments', label: 'Khoảnh khắc đáng yêu' }, { id: 'visit', label: 'Ghé thăm MEOMEO' },
]
export const VALUES = [
  { title: 'Tận tâm', text: 'Mỗi bé có tính cách, thói quen và nhu cầu riêng. Sự chăm sóc bắt đầu từ việc quan tâm đến những khác biệt ấy.' },
  { title: 'Chuyên nghiệp', text: 'Dịch vụ, thời lượng dự kiến và mức phí theo cân nặng được trình bày rõ ràng, để sen dễ chọn điều phù hợp cho bé.' },
  { title: 'Yêu thương', text: 'Sự thoải mái của bé là điều chúng mình trân trọng, trong từng lần chải lông và từng chút chăm sóc.' },
]
export const GROOMING = [
  { title: 'Tắm thơm & sấy lông', text: 'Làm sạch nhẹ nhàng, sấy khô và chải lại bộ lông.', duration: '60 phút dự kiến', routeId: 1 },
  { title: 'Cắt tỉa tạo kiểu', text: 'Tỉa gọn theo dáng lông và sự thoải mái của Boss.', duration: '90 phút dự kiến', routeId: 2 },
  { title: 'Chải lông & gỡ rối', text: 'Chải và gỡ rối để bộ lông mềm, tơi và gọn hơn.', duration: '30 phút dự kiến', routeId: 3 },
  { title: 'Gói chăm sóc trọn buổi', text: 'Kết hợp tắm, sấy, chải lông và chăm chút diện mạo.', duration: '150 phút dự kiến', routeId: 4 },
]
export const EXPERIENCE = [
  { title: 'Chọn điều bé cần', text: 'Xem dịch vụ, thời lượng dự kiến và mức phí theo cân nặng trước khi đặt hẹn.' },
  { title: 'Hẹn một buổi phù hợp', text: 'Chọn thú cưng, dịch vụ và khung giờ trong trang đặt lịch.' },
  { title: 'Chăm chút bộ lông', text: 'Tắm sấy, chải gỡ rối hoặc cắt tỉa theo dịch vụ sen đã lựa chọn.' },
  { title: 'Gặp lại Boss thơm tho', text: 'Đón bé sau buổi chăm sóc; sen có thể xem lại thông tin lịch hẹn trong tài khoản.' },
]
export const CARE = [
  { title: 'Dịu dàng với từng bé', text: 'Một bé mạnh dạn và một bé rụt rè cần những nhịp làm quen khác nhau. Chúng mình hướng đến sự chăm sóc tôn trọng tính cách riêng ấy.' },
  { title: 'Chỉn chu trong chăm sóc', text: 'Chú trọng vệ sinh, sự gọn gàng và cách thao tác phù hợp khi tắm, sấy, chải hay cắt tỉa lông.' },
  { title: 'Thoải mái là điều quan trọng', text: 'Làm đẹp cho bé bắt đầu từ sự quan tâm, để mỗi lần ghé spa là một trải nghiệm dễ chịu hơn.' },
]
