// app.js - Aplicação principal
const express = require('express');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Função para processar os dados da planilha
function processExcelData(filePath) {
  try {
    console.log(`Tentando ler o arquivo: ${filePath}`);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`Arquivo não encontrado: ${filePath}`);
      throw new Error(`Arquivo Excel não encontrado: ${filePath}`);
    }
    
    // Ler o arquivo Excel
    const workbook = XLSX.readFile(filePath, {
      cellDates: true,
      cellNF: true
    });
    
    console.log(`Planilhas encontradas: ${workbook.SheetNames.join(', ')}`);
    
    // Extrair dados de cada planilha
    const sheets = workbook.SheetNames;
    const result = {};
    
    sheets.forEach(sheet => {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      console.log(`Planilha '${sheet}': ${data.length} registros`);
      result[sheet] = data;
    });
    
    return result;
  } catch (error) {
    console.error('Erro ao processar o arquivo Excel:', error);
    throw error;
  }
}

// Detecção do arquivo Excel - tentar diferentes versões do nome
let excelFilePath = '';
const possibleNames = [
  'GOMOTO1.xlsx',
  'GOMOTO 1.xlsx',
  'gomoto1.xlsx',
  'gomoto 1.xlsx'
];

for (const name of possibleNames) {
  const testPath = path.join(__dirname, 'data', name);
  if (fs.existsSync(testPath)) {
    excelFilePath = testPath;
    console.log(`Arquivo Excel encontrado: ${name}`);
    break;
  }
}

if (!excelFilePath) {
  console.error('NENHUM ARQUIVO EXCEL ENCONTRADO. Tentei os seguintes nomes:', possibleNames);
  excelFilePath = path.join(__dirname, 'data', 'GOMOTO1.xlsx'); // Valor padrão
}

console.log(`Caminho final do Excel: ${excelFilePath}`);

// API para obter os dados financeiros
app.get('/api/financial-data', (req, res) => {
  try {
    console.log(`Processando requisição para dados financeiros...`);
    const excelData = processExcelData(excelFilePath);
    
    // Processamento dos dados financeiros
    const despesas = excelData['Despesas'] || [];
    const receitas = excelData['Renda'] || [];
    
    console.log(`Despesas: ${despesas.length} registros encontrados`);
    console.log(`Receitas: ${receitas.length} registros encontrados`);
    
    // Agrupar por mês
    const despesasPorMes = {};
    const receitasPorMes = {};
    
    despesas.forEach(item => {
      if (!item.Data) return;
      
      const data = new Date(item.Data);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      despesasPorMes[mesAno] = (despesasPorMes[mesAno] || 0) + (item.Valor || 0);
    });
    
    receitas.forEach(item => {
      if (!item.Data) return;
      
      const data = new Date(item.Data);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      receitasPorMes[mesAno] = (receitasPorMes[mesAno] || 0) + (item['Valor Recebido'] || 0);
    });
    
    // Calcular resultado por mês
    const meses = [...new Set([...Object.keys(despesasPorMes), ...Object.keys(receitasPorMes)])].sort();
    const resultadoMensal = meses.map(mes => {
      const despesa = despesasPorMes[mes] || 0;
      const receita = receitasPorMes[mes] || 0;
      const resultado = receita - despesa;
      
      return {
        mes,
        despesa,
        receita,
        resultado
      };
    });
    
    // Análise por tipo de despesa
    const tiposDespesas = {};
    despesas.forEach(item => {
      const tipo = item['Tipo de Despesa'] || 'Outros';
      tiposDespesas[tipo] = (tiposDespesas[tipo] || 0) + (item.Valor || 0);
    });
    
    // Análise por moto
    const motosDespesas = {};
    const motosReceitas = {};
    
    despesas.forEach(item => {
      if (!item.Veículo) return;
      motosDespesas[item.Veículo] = (motosDespesas[item.Veículo] || 0) + (item.Valor || 0);
    });
    
    receitas.forEach(item => {
      if (!item.Veículo) return;
      motosReceitas[item.Veículo] = (motosReceitas[item.Veículo] || 0) + (item['Valor Recebido'] || 0);
    });
    
    // Calcular ROI por moto
    const motos = [...new Set([...Object.keys(motosDespesas), ...Object.keys(motosReceitas)])];
    const roiPorMoto = motos.map(placa => {
      const despesaTotal = motosDespesas[placa] || 0;
      const receitaTotal = motosReceitas[placa] || 0;
      const resultado = receitaTotal - despesaTotal;
      const roi = despesaTotal > 0 ? (resultado / despesaTotal * 100) : 0;
      
      return {
        placa,
        despesa: despesaTotal,
        receita: receitaTotal,
        resultado,
        roi
      };
    });
    
    // Projeção anual baseada nos valores de locação semanal
    const valorSemanal = 350;
    const valorMensal = valorSemanal * 4.33;
    const valorAnual = valorSemanal * 52;
    const custoMensalManutencao = 200;
    const custoMensalSeguro = 180;
    const custoMensalTotal = custoMensalManutencao + custoMensalSeguro;
    const custoAnual = custoMensalTotal * 12;
    const lucroAnual = valorAnual - custoAnual;
    
    // Projeção com diferentes taxas de ocupação
    const projecaoOcupacao = [0.7, 0.8, 0.9, 0.95, 1.0].map(taxa => {
      const receitaProjetada = valorAnual * taxa;
      const lucroProjetado = receitaProjetada - custoAnual;
      const roiAnual = lucroProjetado / 13000 * 100; // Assumindo investimento de 13000
      
      return {
        taxa: taxa * 100,
        receita: receitaProjetada,
        lucro: lucroProjetado,
        roi: roiAnual
      };
    });
    
    // Retornar dados processados
    res.json({
      resultadoMensal,
      tiposDespesas: Object.entries(tiposDespesas).map(([tipo, valor]) => ({ tipo, valor })),
      roiPorMoto,
      projecaoFinanceira: {
        valorSemanal,
        valorMensal,
        valorAnual,
        custoMensalTotal,
        custoAnual,
        lucroAnual,
        paybackMeses: 13000 / (lucroAnual / 12)
      },
      projecaoOcupacao
    });
    
  } catch (error) {
    console.error('Erro ao processar dados:', error);
    res.status(500).json({ error: 'Erro ao processar dados da planilha', details: error.message });
  }
});

// API para obter dados de clientes e motos
app.get('/api/operational-data', (req, res) => {
  try {
    console.log(`Processando requisição para dados operacionais...`);
    const excelData = processExcelData(excelFilePath);
    
    // Processamento dos dados operacionais
    const locatarios = excelData['Locatário'] || [];
    const motos = excelData['Dados das Motos'] || [];
    const filaLocadores = excelData['Fila de locadores'] || [];
    
    console.log(`Locatários: ${locatarios.length} registros encontrados`);
    console.log(`Motos: ${motos.length} registros encontrados`);
    console.log(`Fila: ${filaLocadores.length} registros encontrados`);
    
    // Estatísticas de locatários
    const numLocatarios = locatarios.filter(l => l.Nome).length;
    
    // Estatísticas de motos
    const numMotos = motos.filter(m => m.Placa).length;
    
    // Estatísticas de fila
    const numFila = filaLocadores.length;
    const razaoDemandaOferta = numMotos > 0 ? numFila / numMotos : 0;
    
    res.json({
      estatisticasClientes: {
        numLocatarios,
        numFila,
        razaoDemandaOferta
      },
      estatisticasMotos: {
        numMotos,
        modelos: motos
          .filter(m => m['Marca/Modelo'])
          .map(m => ({ placa: m.Placa, modelo: m['Marca/Modelo'] }))
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar dados operacionais:', error);
    res.status(500).json({ error: 'Erro ao processar dados operacionais', details: error.message });
  }
});

// Inicialização - verificar se o arquivo existe
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Verificar se o arquivo Excel existe
  if (fs.existsSync(excelFilePath)) {
    console.log(`Arquivo Excel encontrado: ${excelFilePath}`);
  } else {
    console.error(`ATENÇÃO: Arquivo Excel não encontrado: ${excelFilePath}`);
    console.error(`Por favor, verifique se o arquivo está na pasta 'data' com o nome correto.`);
  }
});