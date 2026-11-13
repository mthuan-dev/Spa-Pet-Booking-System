import { useEffect } from 'react'
import Hero from '../../features/home/components/Hero.jsx'
import ServicesSection from '../../features/home/components/ServicesSection.jsx'
import AboutSection from '../../features/home/components/AboutSection.jsx'
import ReviewsSection from '../../features/home/components/ReviewsSection.jsx'

export default function HomePage() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const items = document.querySelectorAll(
      '.services-section .section-heading > *, .service-strip, .about-section__lead, .reason-list li, .reviews-section__heading > *, .review-quote',
    )
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('has-entered')
        observer.unobserve(entry.target)
      })
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 })

    items.forEach((item) => {
      item.classList.add('home-reveal')
      observer.observe(item)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Hero />
      <ServicesSection />
      <AboutSection />
      <ReviewsSection />
    </>
  )
}
