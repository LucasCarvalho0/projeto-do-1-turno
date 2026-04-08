import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Simplificando o middleware para evitar erros de inicialização do Supabase Auth Helpers
  // e permitir o acesso às rotas protegidas durante o desenvolvimento do layout.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
