#Specifying the base img:
FROM node:18
WORKDIR /.
COPY package*.json ./
# Copy application code excluding node_modules
COPY . .
# Install dependencies
RUN npm install

CMD ["node","server.js"]