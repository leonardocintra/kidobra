export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  provider: 'password' | 'google';
  isSubscriber: boolean;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string;
  ordem: number;
  todasAtividades: boolean;
}

export interface Atividade {
  id: string;
  ordem: number;
  data: string;
  categoria: string;
  pasta: string;
  arquivo: string;
  imagemUrl: string;
}

export interface Ebook {
  id: string;
  nome: string;
  data: string;
  atividades: string[];
}
