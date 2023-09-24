// message broker
const messageBroker = require('amqplib');
const {
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
  USER_BINDING_KEY,
} = require('../config');

// create a channel
const createChannel = async () => {
  try {
    const connection = await messageBroker.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    (await channel).assertExchange(EXCHANGE_NAME, 'direct', false);
    return channel;
  } catch (error) {
    console.log('error in channel creation', error);
  }
};

// publish message
const publishMessage = async message => {
  try {
    let channel = await createChannel();
    channel.publish(EXCHANGE_NAME, USER_BINDING_KEY, Buffer.from(message));
    console.log('message from contact service is published', message);
  } catch (error) {
    console.log('error in publishing message', error);
  }
};

module.exports = { publishMessage };
