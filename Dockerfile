FROM sonarsource/sonar-scanner-cli:4.6

ENV WORKDIR=/app

RUN mkdir /app/
COPY . /app/
WORKDIR /app

RUN npm install
RUN npm i -g
RUN rm -rf src

CMD sonar-scanner