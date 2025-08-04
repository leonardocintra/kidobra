'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Book } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Spinner from '@/components/Spinner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { signIn, googleSignIn, loading, user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await signIn(values);
      toast({ title: 'Login bem-sucedido!', description: 'Bem-vindo de volta!' });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: 'Email ou senha inválidos. Por favor, tente novamente.',
      });
    }
  };

  const onGoogleSignIn = async () => {
    try {
        await googleSignIn();
        // The redirection is handled by the AuthContext now
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro de Login com Google',
            description: error instanceof Error ? error.message : 'Não foi possível fazer login com o Google.',
        });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Book className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Kidobra</CardTitle>
          <CardDescription>Entre em sua conta para criar eBooks incríveis</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting || loading}>
                {(form.formState.isSubmitting || loading) && <Spinner size="sm" className="mr-2" />}
                Entrar
              </Button>
            </form>
          </Form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={loading}>
            {loading ? <Spinner size="sm" /> : <GoogleIcon />}
            <span className="ml-2">Google</span>
          </Button>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="/signup" className="underline text-accent-foreground hover:text-accent">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 rounded-md bg-foreground p-4 text-background">
        <p>
            <span className="font-bold">Status:</span>{' '}
            {loading ? 'Verificando...' : user ? 'Conectado' : 'Não conectado'}
        </p>
        {user && <p className="text-xs">Email: {user.email}</p>}
      </div>
    </div>
  );
}
