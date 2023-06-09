FROM node:19

# Creamos directorio de trabajo
RUN mkdir -p /usr/src/app

# Establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Instalamos las dependencias de npm
COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Copiamos los archivos del proyecto en el directorio de trabajo
COPY ./src .

# Exponemos el puerto 3000
EXPOSE 3000

CMD [ "npm", "run", "dev"]
