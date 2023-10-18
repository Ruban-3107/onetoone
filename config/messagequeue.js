const amqp = require("amqplib");
let channel;
let connection;
const msgExchange = "Notification";
const config = require('./config');

class MessageQueue {
  constructor() {}

  connect() {
    return new Promise((resolve, reject) => {
      amqp
        .connect(
         config.message_queue
        )
        .then((conn) => {
          connection = conn;
          return conn.createChannel();
        })
        .then((ch) => {
          channel = ch;

          return ch
            .assertExchange(msgExchange, "fanout",{durable:false})
            .then((ok) => {
              console.log("MessageQueue -> constructor -> ok", ok);
              resolve();
            });
        })
        .catch((error) => {
          console.error("MessageQueue -> constructor -> error", error);
          reject(error);
        });
    });
  }

 async send(message) {
    try {
      channel.publish(msgExchange, "queue_name", Buffer.from(message));
      console.log(" [x] Sent %s", message);
       await channel.close();
       await connection.close();
    } catch (error) {
      console.log("MessageQueue -> send -> error", error);
    } finally {
      console.log("connection close")

    }
  }
}

module.exports = MessageQueue;
