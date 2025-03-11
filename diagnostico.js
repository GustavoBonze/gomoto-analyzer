// diagnostico.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

console.log('=== INICIANDO DIAGNÓSTICO DA PLANILHA EXCEL ===');

// Verificar ambiente
console.log('\n[AMBIENTE]');
console.log('Diretório atual:', __dirname);
console.log('Conteúdo do diretório atual:');
try {
  console.log(fs.readdirSync(__dirname).join(', '));
} catch (e) {
  console.error('Erro ao listar diretório:', e.message);
}

// Verificar pasta de dados
console.log('\n[PASTA DE DADOS]');
const dataDir = path.join(__dirname, 'data');
console.log('Pasta de dados:', dataDir);
console.log('A pasta existe?', fs.existsSync(dataDir) ? 'SIM' : 'NÃO');

if (fs.existsSync(dataDir)) {
  console.log('Conteúdo da pasta de dados:');
  try {
    console.log(fs.readdirSync(dataDir).join(', '));
  } catch (e) {
    console.error('Erro ao listar pasta de dados:', e.message);
  }
}

// Verificar arquivo Excel
console.log('\n[ARQUIVO EXCEL]');
const excelPath = path.join(dataDir, 'GOMOTO1.xlsx');
console.log('Caminho do arquivo:', excelPath);
console.log('O arquivo existe?', fs.existsSync(excelPath) ? 'SIM' : 'NÃO');

if (fs.existsSync(excelPath)) {
  try {
    const stats = fs.statSync(excelPath);
    console.log('Tamanho do arquivo:', stats.size, 'bytes');
    console.log('Data de modificação:', stats.mtime);
    
    // Tentar ler o arquivo Excel
    console.log('\n[LEITURA DO EXCEL]');
    try {
      console.log('Tentando ler o arquivo Excel...');
      const workbook = XLSX.readFile(excelPath, { 
        cellDates: true,
        cellNF: true
      });
      
      console.log('Leitura bem-sucedida!');
      console.log('Planilhas encontradas:', workbook.SheetNames.join(', '));
      
      // Examinar cada planilha
      workbook.SheetNames.forEach(sheetName => {
        console.log(`\n[PLANILHA: ${sheetName}]`);
        const sheet = workbook.Sheets[sheetName];
        
        // Converter para JSON para análise
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        console.log(`Total de linhas: ${data.length}`);
        
        if (data.length > 0) {
          // Mostrar cabeçalhos (primeira linha)
          console.log('Cabeçalhos:');
          if (data[0] && data[0].length > 0) {
            console.log(data[0]);
          } else {
            console.log('(Nenhum cabeçalho encontrado)');
          }
          
          // Converter com header para verificar estrutura
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          console.log(`Total de registros (com cabeçalho): ${jsonData.length}`);
          
          if (jsonData.length > 0) {
            console.log('Exemplo de registro:');
            console.log(JSON.stringify(jsonData[0], null, 2));
            
            // Mostrar chaves encontradas
            const keys = Object.keys(jsonData[0]);
            console.log(`Chaves encontradas: ${keys.join(', ')}`);
          }
        }
      });
      
    } catch (e) {
      console.error('Erro ao ler Excel:', e);
    }
    
  } catch (e) {
    console.error('Erro ao obter informações do arquivo:', e.message);
  }
}

console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');