FROM node:lts-alpine AS build
WORKDIR /usr/local/dotnet-identity-spa
COPY . .
RUN npm i
RUN npm run build
RUN mv default.conf dist/dotnet-identity-spa/browser

FROM nginx:latest
COPY --from=build /usr/local/dotnet-identity-spa/dist/dotnet-identity-spa/browser /usr/share/nginx/html
RUN mv /usr/share/nginx/html/default.conf /etc/nginx/config.d/
EXPOSE 80
