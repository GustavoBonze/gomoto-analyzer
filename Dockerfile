# Use a imagem oficial do Node.js como base
FROM node:16-alpine

# Cria e define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Cria as pastas necessárias (se não existirem)
RUN mkdir -p data public

# Expõe a porta que a aplicação vai usar
EXPOSE 3000

# Define o comando para iniciar a aplicação
CMD ["node", "app.js"]