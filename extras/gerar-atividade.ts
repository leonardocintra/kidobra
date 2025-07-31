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

// Função para obter todas as categorias (subpastas)
async function obterCategorias(): Promise<string[]> {
  try {
    console.log('Buscando categorias...');
    
    // Lista todos os arquivos com o prefixo 'atividades/'
    const [files] = await bucket.getFiles({ 
      prefix: FOLDER_ATIVIDADES,
      autoPaginate: false,
      maxResults: 1000 
    });

    console.log(`Total de arquivos encontrados: ${files.length}`);

    // Extrai os nomes das categorias dos caminhos dos arquivos
    const categoriasSet = new Set<string>();
    
    files.forEach(file => {
      const fileName = file.name;
      console.log(`Processando arquivo: ${fileName}`);
      
      // Remove o prefixo 'atividades/' e divide o caminho
      const relativePath = fileName.replace(FOLDER_ATIVIDADES, '');
      const pathParts = relativePath.split('/');
      
      // Se há pelo menos uma parte do caminho (categoria), adiciona ao set
      if (pathParts.length > 1 && pathParts[0]) {
        categoriasSet.add(pathParts[0]);
        console.log(`Categoria encontrada: ${pathParts[0]}`);
      }
    });

    const categorias = Array.from(categoriasSet);
    console.log(`Categorias identificadas: ${categorias.join(', ')}`);
    
    return categorias;
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    throw error;
  }
}

// Função principal para gerar o JSON de atividades
async function gerarAtividades() {
  console.log('Iniciando a geração do arquivo de atividades...');

  try {
    const categorias = await obterCategorias();
    
    if (categorias.length === 0) {
      console.log('Nenhuma categoria encontrada. Verifique a estrutura do Firebase Storage.');
      return;
    }

    const todasAtividades: Atividade[] = [];
    let totalAtividades = 0;

    console.log(`Encontradas ${categorias.length} categorias. Processando...`);

    for (const categoriaId of categorias) {
      console.log(`\nProcessando categoria: ${categoriaId}`);
      
      const pastaCompleta = `${FOLDER_ATIVIDADES}${categoriaId}/`;
      
      try {
        // Lista todos os arquivos da categoria específica
        const [arquivos] = await bucket.getFiles({ 
          prefix: pastaCompleta,
          autoPaginate: false,
          maxResults: 1000
        });

        console.log(`  - Total de arquivos na pasta '${pastaCompleta}': ${arquivos.length}`);

        // Filtra apenas arquivos .jpg que não sejam a própria pasta
        const arquivosJpg = arquivos.filter(file => {
          const isJpg = file.name.toLowerCase().endsWith('.jpg');
          const isNotFolder = !file.name.endsWith('/');
          const isInCorrectFolder = file.name.startsWith(pastaCompleta);
          
          console.log(`    - Arquivo: ${file.name}, isJpg: ${isJpg}, isNotFolder: ${isNotFolder}, isInCorrectFolder: ${isInCorrectFolder}`);
          
          return isJpg && isNotFolder && isInCorrectFolder;
        });

        console.log(`  - Arquivos JPG válidos encontrados: ${arquivosJpg.length}`);

        for (const arquivo of arquivosJpg) {
          const nomeArquivo = path.basename(arquivo.name);
          const ordemStr = nomeArquivo.replace(/\.jpg$/i, '');
          const ordem = parseInt(ordemStr, 10);

          console.log(`    - Processando arquivo: ${nomeArquivo}, ordem extraída: ${ordemStr}`);

          if (isNaN(ordem)) {
            console.warn(`    - Aviso: O arquivo '${nomeArquivo}' na categoria '${categoriaId}' não tem um nome numérico e será ignorado.`);
            continue;
          }

          // Torna o arquivo público (caso não esteja)
          try {
            await arquivo.makePublic();
          } catch (publicError) {
            console.warn(`    - Aviso: Não foi possível tornar o arquivo '${nomeArquivo}' público:`, publicError);
          }

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${arquivo.name}`;

          const atividade: Atividade = {
            id: randomUUID(),
            ordem: ordem,
            data: new Date().toISOString(),
            categoria: categoriaId,
            pasta: pastaCompleta.slice(0, -1), // Remove a barra final
            arquivo: nomeArquivo,
            imagemUrl: publicUrl,
          };

          todasAtividades.push(atividade);
          totalAtividades++;
          
          console.log(`    - Atividade criada: ${JSON.stringify(atividade, null, 2)}`);
        }
      } catch (categoryError) {
        console.error(`Erro ao processar categoria '${categoriaId}':`, categoryError);
        continue;
      }
    }

    // Ordena as atividades por categoria e depois pela ordem do arquivo
    todasAtividades.sort((a, b) => {
      if (a.categoria < b.categoria) return -1;
      if (a.categoria > b.categoria) return 1;
      return a.ordem - b.ordem;
    });

    // Cria o diretório se não existir
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (mkdirError) {
      console.log('Diretório já existe ou erro ao criar:', mkdirError);
    }

    const caminhoArquivo = path.join(dataDir, 'atividades.json');
    await fs.writeFile(caminhoArquivo, JSON.stringify(todasAtividades, null, 2));

    console.log('\n--- Resumo ---');
    console.log(`Total de categorias processadas: ${categorias.length}`);
    console.log(`Total de atividades geradas: ${totalAtividades}`);
    console.log(`Arquivo 'atividades.json' salvo com sucesso em: ${caminhoArquivo}`);
    
    // Mostra uma amostra do conteúdo gerado
    if (todasAtividades.length > 0) {
      console.log('\n--- Amostra do conteúdo gerado ---');
      console.log(JSON.stringify(todasAtividades.slice(0, 2), null, 2));
    }
    
    console.log('--- Fim ---');

  } catch (error) {
    console.error('\nOcorreu um erro ao gerar as atividades:', error);
    process.exit(1);
  }
}

// Executa a função principal
gerarAtividades();