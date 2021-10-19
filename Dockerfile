FROM sonarsource/sonar-scanner-cli:4.6

RUN mkdir /app/
COPY . /app/
RUN npm install
RUN npm i -g

ENV WORKDIR=/app

CMD sonar-scanner