FROM dieuhd/sonar-quality-gate:latest

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /srv
ENTRYPOINT ["/entrypoint.sh"]