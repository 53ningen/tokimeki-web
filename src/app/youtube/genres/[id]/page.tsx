import prisma from '@/db/prisma'
import { getDictionary } from '@/i18n/dictionaries'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import YouTubeTypeVideosPage from './pages/[page]/page'

export const revalidate = 43200

interface Props {
  params: Promise<{ id: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata | null> => {
  const p = await params
  const id = p.id ? parseInt(p.id) : undefined
  const page = parseInt('1')
  if (!id || isNaN(page) || page < 1) {
    return null
  }
  const type = await getYouTubeVideoType(id)
  if (!type) {
    return null
  } else {
    const { youtube: t } = await getDictionary()
    const title = `${type.name} - ${t.title}`
    const description = `${type.name} - ${t.desc}`
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    }
  }
}

export const generateStaticParams = async () => {
  return []
}

const YouTubeTypeVideos = async ({ params }: Props) => {
  const p = await params
  const id = p.id
  const idNum = parseInt(id)
  if (!id || isNaN(idNum) || idNum < 1) {
    notFound()
  }
  const page = '1'
  const type = await getYouTubeVideoType(parseInt(id))
  if (!type) {
    notFound()
  }
  return YouTubeTypeVideosPage({ params: Promise.resolve({ id, page }) })
}

const getYouTubeVideoType = unstable_cache(async (id: number) =>
  prisma.youtube_types.findUnique({
    where: {
      id,
    },
  })
)

export default YouTubeTypeVideos