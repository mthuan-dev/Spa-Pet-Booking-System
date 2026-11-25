import { useQuery } from '@tanstack/react-query'
import { api } from '../../../api/client.js'
import { queryClient } from '../../../lib/query-client.js'

function StarRating({ rating }) {
  return (
    <div className="review-quote__rating" role="img" aria-label={`${rating} trên 5 sao`}>
      {Array.from({ length: rating }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="m12 2.2 2.95 6 6.62.96-4.79 4.67 1.13 6.6L12 17.32l-5.91 3.11 1.13-6.6-4.79-4.67 6.62-.96L12 2.2Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsSection() {
  const { data: reviews = [], isPending, isError, refetch } = useQuery({
    queryKey: ['public-reviews'], queryFn: () => api.get('/public/reviews'),
  }, queryClient)
  return (
    <section className="reviews-section page-gutter" aria-labelledby="reviews-title">
      <div className="reviews-section__heading">
        <h2 id="reviews-title">Lời khách kể</h2>
        <p>Nhận xét từ khách hàng đã sử dụng dịch vụ tại spa.</p>
      </div>
      <div className="review-list">
        {isPending && <p>Đang tải đánh giá...</p>}
        {isError && <p>Chưa tải được đánh giá. <button type="button" onClick={() => refetch()}>Thử lại</button></p>}
        {!isPending && !isError && !reviews.length && <p>Chưa có đánh giá.</p>}
        {reviews.map((review) => (
          <blockquote className="review-quote" key={review.id}>
            <StarRating rating={review.rating} />
            <p>“{review.comment}”</p>
            <footer>{review.userName}<span aria-hidden="true">, </span><span className="review-quote__pet">sen của {review.petName}</span></footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
