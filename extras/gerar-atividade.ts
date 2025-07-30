import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import 'dotenv/config';

// Definição da interface para o objeto de atividade
interface Atividade {
  id: string;
  ordem: number;
  data: string;
  categoria: string;
  pasta: string;
  arquivo: string;
  imagemUrl: string;
}

// Carrega as credenciais do Firebase a partir de variáveis de ambiente
function getFirebaseCredentials() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccount) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.');
  }
  try {
    return JSON.parse(serviceAccount);
  } catch (error) {
    throw new Error('Falha ao fazer o parse das credenciais do Firebase. Verifique o formato do JSON.');
  }
}

// Inicializa o Firebase Admin SDK
try {
  const serviceAccount = getFirebaseCredentials();
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!storageBucket) {
    throw new Error('A variável de ambiente NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET não está definida.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucket,
  });
} catch (error) {
  if (error instanceof Error) {
    console.error(`Erro na inicialização do Firebase: ${error.message}`);
  } else {
    console.error('Ocorreu um erro desconhecido durante a inicialização do Firebase.');
  }
  process.exit(1);
}

const bucket = admin.storage().bucket();
const FOLDER_ATIVIDADES = 'atividades/';

// Função principal para gerar o JSON de atividades
async function gerarAtividades() {
  console.log('Iniciando a geração do arquivo de atividades...');

  try {
    const [pastas] = await bucket.getFiles({ prefix: FOLDER_ATIVIDADES, delimiter: '/' });

    const categorias = pastas
      .filter(file => file.name.endsWith('/'))
      .map(folder => folder.name.split('/')[1]);
      
    const todasAtividades: Atividade[] = [];
    let totalAtividades = 0;

    console.log(`Encontradas ${categorias.length} categorias. Processando...`);

    for (const categoriaId of categorias) {
      if (!categoriaId) continue;

      const pastaCompleta = `${FOLDER_ATIVIDADES}${categoriaId}/`;
      const [arquivos] = await bucket.getFiles({ prefix: pastaCompleta });

      const arquivosJpg = arquivos.filter(file => 
        file.name.toLowerCase().endsWith('.jpg') && file.name !== pastaCompleta
      );

      console.log(`  - Categoria '${categoriaId}': ${arquivosJpg.length} atividades encontradas.`);

      for (const arquivo of arquivosJpg) {
        const nomeArquivo = path.basename(arquivo.name);
        const ordemStr = nomeArquivo.replace(/\.jpg$/i, '');
        const ordem = parseInt(ordemStr, 10);

        if (isNaN(ordem)) {
          console.warn(`    - Aviso: O arquivo '${nomeArquivo}' na categoria '${categoriaId}' não tem um nome numérico e será ignorado.`);
          continue;
        }

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${arquivo.name}`;

        const atividade: Atividade = {
          id: randomUUID(),
          ordem: ordem,
          data: new Date().toISOString(),
          categoria: categoriaId,
          pasta: pastaCompleta.slice(0, -1),
          arquivo: nomeArquivo,
          imagemUrl: publicUrl,
        };

        todasAtividades.push(atividade);
        totalAtividades++;
      }
    }

    // Ordena as atividades por categoria e depois pela ordem do arquivo
    todasAtividades.sort((a, b) => {
        if (a.categoria < b.categoria) return -1;
        if (a.categoria > b.categoria) return 1;
        return a.ordem - b.ordem;
    });

    const caminhoArquivo = path.join(__dirname, '..', 'src', 'data', 'atividades.json');
    await fs.writeFile(caminhoArquivo, JSON.stringify(todasAtividades, null, 2));

    console.log('\n--- Resumo ---');
    console.log(`Total de categorias processadas: ${categorias.length}`);
    console.log(`Total de atividades geradas: ${totalAtividades}`);
    console.log(`Arquivo 'atividades.json' salvo com sucesso em: ${caminhoArquivo}`);
    console.log('--- Fim ---');

  } catch (error) {
    console.error('\nOcorreu um erro ao gerar as atividades:', error);
    process.exit(1);
  }
}

// Executa a função principal
gerarAtividades();
