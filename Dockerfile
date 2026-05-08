FROM node:20-alpine
#creer un groupe et utilisateur non root avec UID/GUID fixes
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser

WORKDIR /app
COPY package.json ./
COPY src/ ./src/

#donner la propriete des fichiers a appuser 
RUN chown -R appuser:appgroup /app

#basculer vers l'utilisateur non-root
USER appuser
EXPOSE 3002

CMD [ "node", "src/index.js"]
