FROM node:18-alpine 

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 9000

CMD ["yarn", "dev"]
