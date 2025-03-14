# GOMOTO Analyzer - Sistema de Análise de Dados (Versão Docker)

Esta aplicação fornece um dashboard completo para análise dos dados do seu negócio de locação de motos, executando em um container Docker.

## Funcionalidades

- Dashboard com métricas financeiras gerais
- Análise de receitas e despesas por moto
- Cálculo de ROI e tempo de payback
- Projeções financeiras com diferentes taxas de ocupação
- Análise da demanda e oferta
- Visualização gráfica de todos os dados

## Requisitos

- Docker
- Docker Compose (recomendado)

## Instalação e Execução com Docker

### Opção 1: Usando Docker Compose (Recomendado)

1. Crie uma pasta para o projeto e navegue até ela:

```bash
mkdir gomoto-analyzer
cd gomoto-analyzer
```

2. Crie a seguinte estrutura de diretórios:

```
gomoto-analyzer/
├── app.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── data/
│   └── GOMOTO1.xlsx
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
```

3. Coloque seu arquivo Excel na pasta `data/` com o nome `GOMOTO1.xlsx`

4. Execute o container com Docker Compose:

```bash
docker-compose up -d
```

5. Acesse a aplicação em seu navegador:

```
http://localhost:3000
```

### Opção 2: Usando Docker diretamente

1. Crie a mesma estrutura de diretórios da opção anterior

2. Construa a imagem Docker:

```bash
docker build -t gomoto-analyzer .
```

3. Execute o container:

```bash
docker run -d -p 3000:3000 -v $(pwd)/data:/usr/src/app/data -v $(pwd)/public:/usr/src/app/public -v $(pwd)/app.js:/usr/src/app/app.js --name gomoto-analyzer gomoto-analyzer
```

4. Acesse a aplicação em seu navegador:

```
http://localhost:3000
```

## Comandos Docker úteis

- Para parar o container:
```bash
docker stop gomoto-analyzer
```

- Para iniciar o container (depois de parado):
```bash
docker start gomoto-analyzer
```

- Para ver logs do container:
```bash
docker logs gomoto-analyzer
```

- Para remover o container (quando não estiver em uso):
```bash
docker rm gomoto-analyzer
```

## Atualizando os dados

Se você atualizar o arquivo Excel na pasta `data/`, pode ser necessário reiniciar o container para que as mudanças sejam refletidas:

```bash
docker restart gomoto-analyzer
```

## Estrutura de Dados

O sistema espera encontrar as seguintes planilhas em seu arquivo Excel:

1. **Despesas** - Registro de todas as despesas
2. **Renda** - Registro de receitas
3. **Locatário** - Cadastro de locatários ativos
4. **Dados das Motos** - Informações sobre as motos
5. **Fila de locadores** - Clientes em espera

## Personalizações

Se você precisar ajustar os valores de projeção (valor de locação semanal, custos de manutenção/seguro), edite o arquivo `app.js` e reinicie o container.# gomoto-analyzer
