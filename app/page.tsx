import { redirect } from 'next/navigation';

export default function RootPage() {
  // Garantir que a primeira tela ao abrir o sistema seja o Login
  redirect('/login');
}
