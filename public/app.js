// public/app.js
document.addEventListener('DOMContentLoaded', function() {
  console.log("Aplicação inicializada");
  
  // Carregar dados financeiros
  fetchFinancialData();
  
  // Carregar dados operacionais
  fetchOperationalData();
  
  // Configurar navegação
  setupNavigation();
});

// Formatação de valores monetários
function formatCurrency(value) {
  if (value === undefined || value === null) {
    console.warn('Valor indefinido para formatação de moeda');
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Cores para gráficos
const chartColors = [
  '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
  '#4895ef', '#560bad', '#b5179e', '#f15bb5', '#00bbf9'
];

// Configuração de navegação via âncoras
function setupNavigation() {
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remover classe active de todos os links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Adicionar classe active ao link clicado
      this.classList.add('active');
      
      // Navegar até a seção
      const sectionId = this.getAttribute('href');
      const section = document.querySelector(sectionId);
      
      if (section) {
        window.scrollTo({
          top: section.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Buscar dados financeiros da API
async function fetchFinancialData() {
  try {
    console.log("Buscando dados financeiros...");
    const response = await fetch('/api/financial-data');
    
    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Dados financeiros recebidos:", data);
    
    if (data) {
      // Atualizar métricas no dashboard
      updateDashboardMetrics(data);
      
      // Criar gráficos
      createFinancialCharts(data);
      
      // Preencher tabelas
      populateFinancialTables(data);
      
      // Atualizar projeções
      updateProjections(data);
    } else {
      console.error("Dados financeiros vazios ou inválidos");
      mostrarErro("Erro nos dados", "Os dados financeiros recebidos são vazios ou inválidos");
    }
  } catch (error) {
    console.error('Erro ao carregar dados financeiros:', error);
    mostrarErro('Erro ao carregar dados financeiros', 'Verifique se o arquivo Excel está na pasta correta. ' + error.message);
  }
}

// Buscar dados operacionais da API
async function fetchOperationalData() {
  try {
    console.log("Buscando dados operacionais...");
    const response = await fetch('/api/operational-data');
    
    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Dados operacionais recebidos:", data);
    
    if (data) {
      // Atualizar métricas operacionais
      updateOperationalMetrics(data);
      
      // Criar gráficos operacionais
      createOperationalCharts(data);
      
      // Preencher tabelas operacionais
      populateOperationalTables(data);
    } else {
      console.error("Dados operacionais vazios ou inválidos");
      mostrarErro("Erro nos dados", "Os dados operacionais recebidos são vazios ou inválidos");
    }
  } catch (error) {
    console.error('Erro ao carregar dados operacionais:', error);
    mostrarErro('Erro ao carregar dados operacionais', 'Verifique se o arquivo Excel está na pasta correta. ' + error.message);
  }
}

// Função para mostrar mensagens de erro
function mostrarErro(titulo, mensagem) {
  // Criar modal de erro
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal fade show';
  modalDiv.style.display = 'block';
  modalDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
  
  modalDiv.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">${titulo}</h5>
          <button type="button" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>${mensagem}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalDiv);
  
  // Adicionar event listeners para fechar o modal
  const closeButtons = modalDiv.querySelectorAll('.btn-close, .btn-secondary');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modalDiv.style.display = 'none';
      document.body.removeChild(modalDiv);
    });
  });
}

// Atualizar métricas no dashboard
function updateDashboardMetrics(data) {
  try {
    console.log("Atualizando métricas do dashboard com:", data);
  
    // Calcular totais
    let receitaTotal = 0;
    let despesaTotal = 0;
    
    if (data.resultadoMensal && Array.isArray(data.resultadoMensal)) {
      data.resultadoMensal.forEach(item => {
        receitaTotal += item.receita || 0;
        despesaTotal += item.despesa || 0;
      });
    } else {
      console.warn("resultadoMensal não é um array válido:", data.resultadoMensal);
    }
    
    const resultadoTotal = receitaTotal - despesaTotal;
    
    // Atualizar elementos no DOM
    const receitaElement = document.getElementById('receita-total');
    if (receitaElement) {
      receitaElement.textContent = formatCurrency(receitaTotal);
    } else {
      console.warn("Elemento 'receita-total' não encontrado no DOM");
    }
    
    const despesaElement = document.getElementById('despesa-total');
    if (despesaElement) {
      despesaElement.textContent = formatCurrency(despesaTotal);
    } else {
      console.warn("Elemento 'despesa-total' não encontrado no DOM");
    }
    
    const resultadoElement = document.getElementById('resultado-total');
    if (resultadoElement) {
      resultadoElement.textContent = formatCurrency(resultadoTotal);
      resultadoElement.classList.add(resultadoTotal >= 0 ? 'text-positive' : 'text-negative');
    } else {
      console.warn("Elemento 'resultado-total' não encontrado no DOM");
    }
    
    // Payback estimado
    const paybackMeses = data.projecaoFinanceira?.paybackMeses;
    const paybackElement = document.getElementById('payback-estimado');
    if (paybackElement && paybackMeses !== undefined) {
      paybackElement.textContent = `${paybackMeses.toFixed(1)} meses`;
    } else {
      console.warn("Elemento 'payback-estimado' não encontrado ou valor indefinido");
    }
  } catch (e) {
    console.error("Erro ao atualizar métricas do dashboard:", e);
  }
}

// Criar gráficos financeiros
function createFinancialCharts(data) {
  try {
    console.log("Criando gráficos financeiros com:", data);
  
    // Gráfico de resultados mensais
    if (data.resultadoMensal && Array.isArray(data.resultadoMensal)) {
      createResultadoMensalChart(data.resultadoMensal);
    } else {
      console.warn("Não foi possível criar gráfico de resultado mensal: dados inválidos");
    }
    
    // Gráfico de tipos de despesas
    if (data.tiposDespesas && Array.isArray(data.tiposDespesas)) {
      createDespesasTipoChart(data.tiposDespesas);
    } else {
      console.warn("Não foi possível criar gráfico de tipos de despesas: dados inválidos");
    }
    
    // Gráfico de ROI por moto
    if (data.roiPorMoto && Array.isArray(data.roiPorMoto)) {
      createRoiMotosChart(data.roiPorMoto);
      
      // Gráfico de receita vs despesa por moto
      createReceitaDespesaMotosChart(data.roiPorMoto);
    } else {
      console.warn("Não foi possível criar gráficos de ROI: dados inválidos");
    }
    
    // Gráfico de projeção por ocupação
    if (data.projecaoOcupacao && Array.isArray(data.projecaoOcupacao)) {
      createProjecaoOcupacaoChart(data.projecaoOcupacao);
    } else {
      console.warn("Não foi possível criar gráfico de projeção: dados inválidos");
    }
  } catch (e) {
    console.error("Erro ao criar gráficos financeiros:", e);
  }
}

// Gráfico de resultados mensais - simplificado (sem linhas)
function createResultadoMensalChart(dados) {
  try {
    console.log("Criando gráfico de resultado mensal com:", dados);
    const ctxElement = document.getElementById('chart-resultado-mensal');
    
    if (!ctxElement) {
      console.warn("Elemento 'chart-resultado-mensal' não encontrado no DOM");
      return;
    }
    
    const ctx = ctxElement.getContext('2d');
    
    // Limpar qualquer gráfico anterior
    if (window.resultadoMensalChart) {
      window.resultadoMensalChart.destroy();
    }
    
    // Preparar dados
    const labels = dados.map(item => {
      // Formatar o mês para exibição (2025-01 -> Jan/2025)
      const [ano, mes] = item.mes.split('-');
      const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const nomeMes = nomesMeses[parseInt(mes) - 1];
      return `${nomeMes}/${ano}`;
    });
    
    const receitas = dados.map(item => item.receita);
    const despesas = dados.map(item => item.despesa);
    
    window.resultadoMensalChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receitas',
            data: receitas,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Despesas',
            data: despesas,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true
            },
            ticks: {
              callback: function(value) {
                // Abreviar valores grandes (R$ 24.000 -> R$ 24K)
                if (value >= 1000) {
                  return 'R$ ' + (value / 1000).toFixed(0) + 'K';
                }
                return 'R$ ' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatCurrency(context.raw);
              }
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao criar gráfico de resultado mensal:", e);
  }
}

// Gráfico de tipos de despesas
function createDespesasTipoChart(dados) {
  try {
    console.log("Criando gráfico de tipos de despesas com:", dados);
    const ctxElement = document.getElementById('chart-despesas-tipo');
    
    if (!ctxElement) {
      console.warn("Elemento 'chart-despesas-tipo' não encontrado no DOM");
      return;
    }
    
    const ctx = ctxElement.getContext('2d');
    
    // Limpar qualquer gráfico anterior
    if (window.despesasTipoChart) {
      window.despesasTipoChart.destroy();
    }
    
    // Ordenar dados por valor
    dados.sort((a, b) => b.valor - a.valor);
    
    // Limitar para os 7 maiores tipos + "Outros"
    let dadosProcessados = [];
    if (dados.length > 7) {
      const maiores = dados.slice(0, 6);
      const outros = {
        tipo: 'Outros',
        valor: dados.slice(6).reduce((sum, item) => sum + item.valor, 0)
      };
      dadosProcessados = [...maiores, outros];
    } else {
      dadosProcessados = dados;
    }
    
    // Preparar dados para o gráfico
    const labels = dadosProcessados.map(item => item.tipo);
    const values = dadosProcessados.map(item => item.valor);
    
    window.despesasTipoChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: chartColors,
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao criar gráfico de tipos de despesas:", e);
  }
}

// Gráfico de ROI por moto - melhorado
function createRoiMotosChart(dados) {
  try {
    console.log("Criando gráfico de ROI com:", dados);
    const ctxElement = document.getElementById('chart-roi-motos');
    
    if (!ctxElement) {
      console.warn("Elemento 'chart-roi-motos' não encontrado no DOM");
      return;
    }
    
    const ctx = ctxElement.getContext('2d');
    
    // Limpar qualquer gráfico anterior
    if (window.roiMotosChart) {
      window.roiMotosChart.destroy();
    }
    
    // Preparar dados - em vez de ROI, mostrar lucro vs investimento
    const labels = dados.map(item => item.placa);
    const investimentos = dados.map(item => item.despesa);
    const lucros = dados.map(item => item.receita);
    const margens = dados.map(item => ((item.receita / Math.max(1, item.despesa)) * 100).toFixed(1) + '%');
    
    window.roiMotosChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Investimento Total',
            data: investimentos,
            backgroundColor: 'rgba(108, 117, 125, 0.7)',
            borderColor: 'rgba(108, 117, 125, 1)',
            borderWidth: 1,
            order: 2
          },
          {
            label: 'Receita Total',
            data: lucros,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor (R$)'
            },
            ticks: {
              callback: function(value) {
                if (value >= 1000) {
                  return 'R$ ' + (value / 1000).toFixed(1) + 'K';
                }
                return 'R$ ' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const datasetLabel = context.dataset.label;
                const value = formatCurrency(context.raw);
                const index = context.dataIndex;
                
                if (datasetLabel === 'Investimento Total') {
                  return [
                    datasetLabel + ': ' + value,
                    'Margem: ' + margens[index]
                  ];
                }
                
                return datasetLabel + ': ' + value;
              }
            }
          },
          title: {
            display: true,
            text: 'Investimento vs. Receita por Moto',
            font: {
              size: 16
            }
          },
          subtitle: {
            display: true,
            text: 'O valor percentual representa a margem (Receita ÷ Investimento)',
            font: {
              size: 12,
              style: 'italic'
            },
            padding: {
              bottom: 10
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao criar gráfico de ROI por moto:", e);
  }
}

// Gráfico de receita vs despesa por moto
function createReceitaDespesaMotosChart(dados) {
  try {
    console.log("Criando gráfico de receita vs despesa com:", dados);
    const ctxElement = document.getElementById('chart-receita-despesa-motos');
    
    if (!ctxElement) {
      console.warn("Elemento 'chart-receita-despesa-motos' não encontrado no DOM");
      return;
    }
    
    const ctx = ctxElement.getContext('2d');
    
    // Limpar qualquer gráfico anterior
    if (window.receitaDespesaMotosChart) {
      window.receitaDespesaMotosChart.destroy();
    }
    
    // Preparar dados
    const labels = dados.map(item => item.placa);
    const receitas = dados.map(item => item.receita);
    const despesas = dados.map(item => item.despesa);
    
    window.receitaDespesaMotosChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receita',
            data: receitas,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          },
          {
            label: 'Despesa',
            data: despesas,
            backgroundColor: 'rgba(220, 53, 69, 0.7)',
            borderColor: 'rgba(220, 53, 69, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao criar gráfico de receita vs despesa por moto:", e);
  }
}

// Gráfico de projeção por ocupação
function createProjecaoOcupacaoChart(dados) {
  try {
    console.log("Criando gráfico de projeção com:", dados);
    const ctxElement = document.getElementById('chart-projecao-ocupacao');
    
    if (!ctxElement) {
      console.warn("Elemento 'chart-projecao-ocupacao' não encontrado no DOM");
      return;
    }
    
    const ctx = ctxElement.getContext('2d');
    
    // Limpar qualquer gráfico anterior
    if (window.projecaoOcupacaoChart) {
      window.projecaoOcupacaoChart.destroy();
    }
    
    // Preparar dados
    const labels = dados.map(item => `${item.taxa}% Ocupação`);
    const receitas = dados.map(item => item.receita);
    const lucros = dados.map(item => item.lucro);
    
    window.projecaoOcupacaoChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Receita Anual',
            data: receitas,
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
          },
          {
            label: 'Lucro Anual',
            data: lucros,
            backgroundColor: 'rgba(40, 167, 69, 0.7)',
            borderColor: 'rgba(40, 167, 69, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value).replace('R$', '');
              }
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao criar gráfico de projeção por ocupação:", e);
  }
}

// Preencher tabelas de dados financeiros
function populateFinancialTables(data) {
  try {
    console.log("Populando tabelas financeiras com:", data);
    
    // Tabela de motos
    const tabelaElement = document.getElementById('tabela-financeiro-motos');
    if (!tabelaElement) {
      console.warn("Elemento 'tabela-financeiro-motos' não encontrado no DOM");
      return;
    }
    
    tabelaElement.innerHTML = '';
    
    if (data.roiPorMoto && Array.isArray(data.roiPorMoto)) {
      data.roiPorMoto.forEach(moto => {
        const row = document.createElement('tr');
        
        // Placa
        const cellPlaca = document.createElement('td');
        cellPlaca.textContent = moto.placa;
        row.appendChild(cellPlaca);
        
        // Receita
        const cellReceita = document.createElement('td');
        cellReceita.textContent = formatCurrency(moto.receita);
        row.appendChild(cellReceita);
        
        // Despesa
        const cellDespesa = document.createElement('td');
        cellDespesa.textContent = formatCurrency(moto.despesa);
        row.appendChild(cellDespesa);
        
        // Resultado
        const cellResultado = document.createElement('td');
        cellResultado.textContent = formatCurrency(moto.resultado);
        cellResultado.className = moto.resultado >= 0 ? 'text-positive' : 'text-negative';
        row.appendChild(cellResultado);
        
        // ROI
        const cellRoi = document.createElement('td');
        cellRoi.textContent = `${moto.roi.toFixed(2)}%`;
        cellRoi.className = moto.roi >= 0 ? 'text-positive' : 'text-negative';
        row.appendChild(cellRoi);
        tabelaElement.appendChild(row);
      });
    } else {
      console.warn("Não foi possível preencher tabela de motos: dados inválidos");
    }
    
    // Tabela de projeção de ocupação
    const tabelaProjecaoElement = document.getElementById('tabela-projecao-ocupacao');
    if (!tabelaProjecaoElement) {
      console.warn("Elemento 'tabela-projecao-ocupacao' não encontrado no DOM");
      return;
    }
    
    tabelaProjecaoElement.innerHTML = '';
    
    if (data.projecaoOcupacao && Array.isArray(data.projecaoOcupacao)) {
      data.projecaoOcupacao.forEach(cenario => {
        const row = document.createElement('tr');
        
        // Taxa de Ocupação
        const cellTaxa = document.createElement('td');
        cellTaxa.textContent = `${cenario.taxa}%`;
        row.appendChild(cellTaxa);
        
        // Receita Anual
        const cellReceita = document.createElement('td');
        cellReceita.textContent = formatCurrency(cenario.receita);
        row.appendChild(cellReceita);
        
        // Lucro Anual
        const cellLucro = document.createElement('td');
        cellLucro.textContent = formatCurrency(cenario.lucro);
        row.appendChild(cellLucro);
        
        // ROI Anual
        const cellRoi = document.createElement('td');
        cellRoi.textContent = `${cenario.roi.toFixed(2)}%`;
        row.appendChild(cellRoi);
        
        tabelaProjecaoElement.appendChild(row);
      });
    } else {
      console.warn("Não foi possível preencher tabela de projeção: dados inválidos");
    }
  } catch (e) {
    console.error("Erro ao preencher tabelas financeiras:", e);
  }
}

// Atualizar métricas operacionais
function updateOperationalMetrics(data) {
  try {
    console.log("Atualizando métricas operacionais com:", data);
    
    if (!data.estatisticasClientes || !data.estatisticasMotos) {
      console.warn("Dados operacionais inválidos:", data);
      return;
    }
    
    // Atualizar valores no DOM
    const totalMotosElement = document.getElementById('total-motos');
    if (totalMotosElement) {
      totalMotosElement.textContent = data.estatisticasMotos.numMotos || 0;
    } else {
      console.warn("Elemento 'total-motos' não encontrado no DOM");
    }
    
    const totalLocatariosElement = document.getElementById('total-locatarios');
    if (totalLocatariosElement) {
      totalLocatariosElement.textContent = data.estatisticasClientes.numLocatarios || 0;
    } else {
      console.warn("Elemento 'total-locatarios' não encontrado no DOM");
    }
    
    const totalFilaElement = document.getElementById('total-fila');
    if (totalFilaElement) {
      totalFilaElement.textContent = data.estatisticasClientes.numFila || 0;
    } else {
      console.warn("Elemento 'total-fila' não encontrado no DOM");
    }
  } catch (e) {
    console.error("Erro ao atualizar métricas operacionais:", e);
  }
}

// Criar gráficos operacionais
function createOperationalCharts(data) {
  try {
    console.log("Criando gráficos operacionais com:", data);
    
    if (!data.estatisticasClientes) {
      console.warn("Dados de estatísticas de clientes inválidos");
      return;
    }
    
    // Gráfico de demanda vs oferta
    createDemandaOfertaChart(data.estatisticasClientes);
  } catch (e) {
    console.error("Erro ao criar gráficos operacionais:", e);
  }
}

// Gráfico de demanda vs oferta - corrigido
function createDemandaOfertaChart(dados) {
  try {
    console.log("Criando gráfico de demanda vs oferta com:", dados);
    const ctxElement = document.getElementById('chart-demanda-oferta');
    
    if (!ctxElement) {
      console.warn("Elemento 'chart-demanda-oferta' não encontrado no DOM");
      return;
    }
    
    const ctx = ctxElement.getContext('2d');
    
    // Limpar qualquer gráfico anterior
    if (window.demandaOfertaChart) {
      window.demandaOfertaChart.destroy();
    }
    
    // Preparar dados - mostrar apenas clientes na fila vs capacidade total
    const totalMotos = dados.numLocatarios || 0;
    const clientesNaFila = dados.numFila || 0;
    
    // Neste gráfico, queremos mostrar a capacidade total vs demanda na fila
    window.demandaOfertaChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Motos Alugadas', 'Clientes na Fila'],
        datasets: [{
          data: [totalMotos, clientesNaFila],
          backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(0, 123, 255, 0.7)'],
          borderColor: ['rgba(40, 167, 69, 1)', 'rgba(0, 123, 255, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
          title: {
            display: true,
            text: 'Relação entre Motos Alugadas e Demanda na Fila',
            font: {
              size: 14
            }
          }
        }
      }
    });
  } catch (e) {
    console.error("Erro ao criar gráfico de demanda vs oferta:", e);
  }
}

// Preencher tabelas operacionais
function populateOperationalTables(data) {
  try {
    console.log("Populando tabelas operacionais com:", data);
    
    if (!data.estatisticasMotos || !data.estatisticasMotos.modelos) {
      console.warn("Dados de modelos de motos inválidos");
      return;
    }
    
    // Tabela de modelos de motos
    const tabelaModelosElement = document.getElementById('tabela-modelos');
    if (!tabelaModelosElement) {
      console.warn("Elemento 'tabela-modelos' não encontrado no DOM");
      return;
    }
    
    tabelaModelosElement.innerHTML = '';
    
    data.estatisticasMotos.modelos.forEach(moto => {
      const row = document.createElement('tr');
      
      // Placa
      const cellPlaca = document.createElement('td');
      cellPlaca.textContent = moto.placa || '';
      row.appendChild(cellPlaca);
      
      // Modelo
      const cellModelo = document.createElement('td');
      cellModelo.textContent = moto.modelo || '';
      row.appendChild(cellModelo);
      
      tabelaModelosElement.appendChild(row);
    });
  } catch (e) {
    console.error("Erro ao preencher tabelas operacionais:", e);
  }
}

// Atualizar seção de projeções
function updateProjections(data) {
  try {
    console.log("Atualizando projeções com:", data);
    
    if (!data.projecaoFinanceira) {
      console.warn("Dados de projeção financeira inválidos");
      return;
    }
    
    const projecao = data.projecaoFinanceira;
    
    // Atualizar valores no DOM
    const elements = {
      'valor-semanal': projecao.valorSemanal,
      'valor-mensal': projecao.valorMensal,
      'valor-anual': projecao.valorAnual,
      'custo-mensal': projecao.custoMensalTotal,
      'custo-anual': projecao.custoAnual,
      'lucro-anual': projecao.lucroAnual,
      'tempo-payback': `${projecao.paybackMeses.toFixed(1)} meses`
    };
    
    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        if (typeof value === 'string') {
          element.textContent = value;
        } else {
          element.textContent = formatCurrency(value);
        }
      } else {
        console.warn(`Elemento '${id}' não encontrado no DOM`);
      }
    }
  } catch (e) {
    console.error("Erro ao atualizar projeções:", e);
  }
}