import React, { useEffect } from 'react'
import { useDocumentInfo } from 'payload/components/utilities'

export const MyCustomUIField = ((props: any) => {
  const { id } = useDocumentInfo()

  useEffect(() => {
    console.log(id)
  }, [id])
  console.log(id, props)
  return (
    <p>Hello world</p>
  )
})

export const MyCustomUICell = ((props: any) => {
  const { id } = useDocumentInfo()

  useEffect(() => {
    console.log(id)
  }, [id])
  return (
    <p>Hello world</p>
  )
})
