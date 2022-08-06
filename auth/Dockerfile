FROM node:alpine

WORKDIR /app
COPY package.json .
# --only=prod will not install devDependencies, which we don't need at runtime in prod
RUN npm install --only=prod
COPY . .

CMD ["npm", "start"]