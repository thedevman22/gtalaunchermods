import AuthForm from '@/components/AuthForm'

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <AuthForm mode="login" />
    </div>
  )
}
