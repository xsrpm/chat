# ¿Para que es este repositorio?

Servidor backend para chat (broadcast server)

# Dependencias de Desarrollo

* IDE: Visual Studio Code
* Nodejs 10 o mayor

# Dependencias de Ejecución

* Nodejs 10 o mayor

# Ejecución

    npm start

Normalmente en local el endpoint será accedido:

    let url = "ws://localhost:8080/ws";
Normalmente en produccion el endpoint será accedido:

    let url = "wss://chat-backend.cemp2703.repl.co/ws";

El protocolo wss se usa entre direcciones seguras (https)

# Fuente
https://javascript.info/websocket

docker build -t cemp2703/chat-backend:1.0.0 .

docker run --rm -it -p 8080:8080/tcp cemp2703/chat-backend:1.0.0