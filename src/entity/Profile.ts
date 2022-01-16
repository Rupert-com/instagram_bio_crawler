import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm'

interface IProfile {
  bio?: string
  discovered: boolean
  followers?: number
  following?: number
  full_name?: string
  image?: string
  level: number
  is_private?: boolean
  pk: number
  posts?: number
  username: string
}

@Entity()
export class Profile {
  @Column({ primary: true, type: 'bigint' })
  pk: number

  @Column({ type: 'smallint' })
  level: number

  @Column({ type: 'varchar' })
  username: string

  @Column({ type: 'varchar', nullable: true })
  full_name?: string

  @Column({ type: 'varchar', nullable: true })
  bio?: string

  @Column({ type: 'boolean', nullable: true, default: true })
  discovered: boolean

  @Column({ type: 'boolean', nullable: true })
  is_private?: boolean

  @Column({ type: 'varchar', nullable: true })
  image?: string

  @Column({ type: 'integer', nullable: true })
  posts?: number

  @Column({ type: 'bigint', nullable: true })
  followers?: number

  @Column({ type: 'bigint', nullable: true })
  following?: number

  constructor(params: IProfile) {
    if (params) {
      const { bio, discovered, followers, following, full_name, image, level, is_private, pk, posts, username } = params
      this.bio = bio
      this.discovered = discovered
      this.followers = followers
      this.following = following
      this.full_name = full_name
      this.image = image
      this.level = level
      this.is_private = is_private
      this.pk = pk
      this.posts = posts
      this.username = username
    }
  }
}
