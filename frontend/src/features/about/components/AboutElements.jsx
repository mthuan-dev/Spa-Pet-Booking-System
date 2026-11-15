import { ABOUT } from '../data/aboutData.js'

export function AboutPhoto({ photo, className = '', eager = false, caption = true }) {
  return (
    <figure className={`about-photo ${className}`}>
      <div className="about-photo__crop">
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      {caption && photo.caption && <figcaption>{photo.caption}</figcaption>}
    </figure>
  )
}

export function AboutLocation() {
  return (
    <div className="about-location">
      <div className="about-location__copy">
        <h2>Hẹn ở MEOMEO nhé!</h2>
        <a className="about-button about-visit__directions" href={ABOUT.mapsUrl} target="_blank" rel="noopener noreferrer">Chỉ đường</a>
      </div>
      <iframe
        src={ABOUT.mapEmbed}
        title="Bản đồ đến MEOMEO tại 273 An Dương Vương, Phường Chợ Quán"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
