import { LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
  const object = await MOUL_BUCKET.get('/moul/wasm/wasm_exec.js')
  if (object === null) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set(
    'Cache-Control',
    'public, max-age=31540000000, stale-while-revalidate=31540000000'
  )
  return new Response(object.body, {
    headers,
  })
}