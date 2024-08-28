'use client'
import { useEffect, useState } from 'react'
import Preview from '@/components/preview'
import type { Content } from '@/types/type'
import { addContent, deleteContent, getContents, updateContent } from '@/lib/indexed-db'
import { useToast } from '@/components/ui/use-toast'
import { Workspace } from '@/components/workspace'
import { Header } from '@/components/header'

export default function Home() {
  const [contents, setContents] = useState<Content[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const data = await getContents()
        setContents(data)
      } catch (error) {
        toast({
          title: 'Failed to load contents',
          description: 'Please refresh the page.',
          duration: 1000,
        })
      }
    }

    fetchContents()
  }, [toast])

  const handleContentSubmit = async (content: Content) => {
    if ('id' in content) {
      await updateContent(content)
      setContents(contents.map(item => (item.id === content.id ? content : item)))
      toast({
        title: 'Content updated',
        description: 'Content updated successfully.',
        duration: 1000,
      })
    } else {
      const id = await addContent(content)
      setContents([...contents, { ...content, id }])
      toast({
        title: 'Content added',
        description: 'Content added successfully.',
        duration: 1000,
      })
    }
  }

  const handleContentDelete = async (content: Content) => {
    try {
      setContents(contents.filter(item => item.id !== content.id))
      await deleteContent(content.id!)
      toast({
        title: 'Content deleted',
        description: 'Content deleted successfully',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to delete content',
        description: 'Please try again.',
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header contents={contents} setContents={setContents} />
      <main className="flex h-[calc(100%-58px)]">
        <div className="hidden w-full sm:block sm:w-[460px] overflow-y-auto sm:min-w-[460px] h-full">
          <Preview contents={contents} className="w-full h-full flex flex-col p-4 m-auto" />
        </div>
        <div className="flex-grow flex justify-center bg-card text-card-foreground overflow-y-auto">
          <Workspace
            contents={contents}
            onContentSubmit={handleContentSubmit}
            onContentDelete={handleContentDelete}
          />
        </div>
      </main>
    </div>
  )
}
