import { Link } from 'react-router-dom'
import { useServices } from '../../catalog/hooks/useServices.js'
import { imageUrl } from '../../../api/imageUrl.js'
import { ROUTES } from '../../../app/routes/routePaths.js'

export default function ServicesSection() {
  const { data, loading, error, retry } = useServices()
  return (
    <section className="services-section page-gutter" id="services" aria-labelledby="services-title">
      <div className="section-heading section-heading--split">
        <h2 id="services-title">Dịch vụ cho boss</h2>
        <p className="services-section__intro">Chọn buổi chăm vừa với bộ lông, tính cách và lịch sinh hoạt của thú cưng</p>
      </div>

      <div className="service-list">
        {loading && <p>Đang tải dịch vụ...</p>}
        {error && <p>{error} <button type="button" onClick={retry}>Thử lại</button></p>}
        {!loading && !error && !data?.length && <p>Chưa có dịch vụ đang mở đặt lịch.</p>}
        {(data || []).slice(0, 4).map((service) => {
          return (
            <article className="service-strip" key={service.id}>
              <img
                className="service-strip__photo"
                src={imageUrl(service.imageUrl) || undefined}
                alt={service.name}
                loading="lazy"
                decoding="async"
                width="1280"
                height="850"
              />
              <div className="service-strip__scrim" aria-hidden="true" />
              <div className="service-strip__copy">
                <h3>{service.name}</h3>
                <p className="service-strip__description">{service.description}</p>
                <div className="service-strip__details">
                  <span>{service.category === 'COMBO' ? 'Gói kết hợp' : 'Dịch vụ đơn'}</span>
                  <span>{service.durationMinutes} phút</span>
                  <span>Giá theo cân nặng</span>
                  <Link to={ROUTES.SERVICE_DETAIL(service.id)}>Xem chi tiết <span aria-hidden="true">↗</span></Link>
                </div>
              </div>           
            </article>
          )
        })}
      </div>
    </section>
  )
}
