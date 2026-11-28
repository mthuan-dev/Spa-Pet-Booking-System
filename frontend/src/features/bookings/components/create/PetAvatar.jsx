import { defaultPetAvatar } from '../../../pets/utils/defaultPetAvatar.js'

export default function PetAvatar({ pet, className = '' }) {
  return (
    <span className={`pet-avatar pet-avatar--${pet?.avatarTone || 'honey'} ${className}`} aria-hidden="true">
      <img src={pet?.imageUrl || defaultPetAvatar(pet?.species)} alt="" />
    </span>
  )
}
