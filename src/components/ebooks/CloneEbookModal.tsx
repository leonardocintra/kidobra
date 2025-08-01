'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Spinner from '../Spinner';
import type { Ebook } from '@/lib/types';

const formSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
});

interface CloneEbookModalProps {
  ebook: Ebook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (ebook: Ebook, novoNome: string) => Promise<void>;
}

export default function CloneEbookModal({ ebook, open, onOpenChange, onSubmit }: CloneEbookModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (ebook) {
      form.reset({ nome: `${ebook.nome} - Cópia` });
    }
  }, [ebook, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!ebook) return;
    setIsSubmitting(true);
    try {
      await onSubmit(ebook, values.nome);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ebook) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clonar eBook</DialogTitle>
          <DialogDescription>Crie uma cópia de "{ebook.nome}". Você pode alterar o nome da cópia abaixo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Cópia</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner size="sm" className="mr-2" />}
                Clonar eBook
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
