'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Spinner from '@/components/Spinner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';

const updateNameSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
});

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters long.' }),
}).refine(data => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one.",
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
      toast({ title: 'Logged out successfully!' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };

  const handleUpdateName = async (values: z.infer<typeof updateNameSchema>) => {
    try {
      await updateProfile(values);
      toast({ title: 'Name updated successfully!' });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error updating name',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    }
  };

  const handleUpdatePassword = async (values: z.infer<typeof updatePasswordSchema>) => {
    try {
      await updatePassword(values);
      toast({ title: 'Password updated successfully!' });
      passwordForm.reset();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error updating password',
            description: 'Please check your current password and try again.',
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
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and edit your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Authentication Provider</Label>
            <Input value={user.provider} disabled className="capitalize" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Form {...nameForm}>
          <form onSubmit={nameForm.handleSubmit(handleUpdateName)}>
            <CardHeader>
              <CardTitle>Update Name</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={nameForm.formState.isSubmitting}>
                {nameForm.formState.isSubmitting && <Spinner size="sm" className="mr-2" />}
                Save Changes
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
                    <CardTitle>Update Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Your current password" {...field} />
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
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="Your new password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter>
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting && <Spinner size="sm" className="mr-2" />}
                        Update Password
                    </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Log Out</CardTitle>
            <CardDescription>End your session on all devices.</CardDescription>
        </CardHeader>
        <CardFooter>
             <Button variant="destructive" onClick={handleLogout}>
                Log Out
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
