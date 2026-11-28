import catAvatar from '../../../assets/images/pet-avatars/cat.png'
import dogAvatar from '../../../assets/images/pet-avatars/dog.png'

export function defaultPetAvatar(species) {
  const type = species?.toLowerCase()
  return type?.includes('mèo') || type?.includes('cat') ? catAvatar : dogAvatar
}
