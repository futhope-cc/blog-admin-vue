import { registerMock } from '@/api/request'
import { now, ok } from './helpers'
import type { SiteProfile, SiteProfileUpdateParams } from '@/api/types'

let profile: SiteProfile = {
  id: '1',
  nickname: '站长',
  avatar: '',
  bio: '个人简介待完善',
  techStack: '',
  socialLinks: '',
  email: '',
  gitee: '',
  directions: '',
  workExperience: '',
  updateTime: now(),
}

registerMock('get', '/profile', () => ok<SiteProfile>(profile))

registerMock('put', '/profile', (config) => {
  const body = config.data as SiteProfileUpdateParams
  profile = {
    ...profile,
    nickname: body.nickname,
    avatar: body.avatar,
    bio: body.bio,
    techStack: body.techStack,
    socialLinks: body.socialLinks,
    email: body.email,
    gitee: body.gitee,
    directions: body.directions,
    workExperience: body.workExperience,
    updateTime: now(),
  }
  return ok(null)
})
