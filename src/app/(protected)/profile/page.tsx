'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Spinner from '@/components/Spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { Crown, ExternalLink } from 'lucide-react';

const updateNameSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
});

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: 'A senha atual é obrigatória.' }),
    newPassword: z.string().min(6, { message: 'A nova senha deve ter pelo menos 6 caracteres.' }),
}).refine(data => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da atual.",
    path: ["newPassword"],
});


export default function ProfilePage() {
  const { user, logOut, updateProfile, updatePassword, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const nameForm = useForm<z.infer<typeof updateNameSchema>>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
    }
  });

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
      toast({ title: 'Sessão encerrada com sucesso!' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    }
  };

  const handleUpdateName = async (values: z.infer<typeof updateNameSchema>) => {
    try {
      await updateProfile(values);
      toast({ title: 'Nome atualizado com sucesso!' });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro ao atualizar o nome',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
      });
    }
  };

  const handleUpdatePassword = async (values: z.infer<typeof updatePasswordSchema>) => {
    try {
      await updatePassword(values);
      toast({ title: 'Senha atualizada com sucesso!' });
      passwordForm.reset();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro ao atualizar a senha',
            description: 'Por favor, verifique sua senha atual e tente novamente.',
        });
    }
  }

  if (loading || !user) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <span>Status da Assinatura</span>
            {user.isSubscriber ? (
                <Badge>Assinante Ativo</Badge>
            ) : (
                <Badge variant="secondary">Não Assinante</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {user.isSubscriber 
                ? 'Você tem acesso a todos os recursos premium.' 
                : 'Atualize para o plano premium e desbloqueie todo o potencial do Kidobra!'}
          </CardDescription>
        </CardHeader>
        {!user.isSubscriber && (
             <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Crown className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">Torne-se um Assinante</h3>
                    <p className="text-muted-foreground">
                        Acesse recursos exclusivos e crie eBooks ainda mais incríveis.
                    </p>
                    <Button asChild className="bg-accent hover:bg-accent/90">
                        <Link href="https://leonardocintra.com.br" target="_blank">
                            Assinar Agora
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>Veja e edite suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Provedor de Autenticação</Label>
            <Input value={user.provider} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Form {...nameForm}>
          <form onSubmit={nameForm.handleSubmit(handleUpdateName)}>
            <CardHeader>
              <CardTitle>Atualizar Nome</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={nameForm.formState.isSubmitting}>
                {nameForm.formState.isSubmitting && <Spinner size="sm" className="mr-2" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {user.provider === 'password' && (
         <Card>
            <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}>
                    <CardHeader>
                    <CardTitle>Atualizar Senha</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha Atual</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Sua senha atual" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nova Senha</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Sua nova senha" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter>
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting && <Spinner size="sm" className="mr-2" />}
                        Atualizar Senha
                    </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Sair</CardTitle>
            <CardDescription>Encerre sua sessão em todos os dispositivos.</CardDescription>
        </CardHeader>
        <CardFooter>
             <Button variant="destructive" onClick={handleLogout}>
                Sair
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
