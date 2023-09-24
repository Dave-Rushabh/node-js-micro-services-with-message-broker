// message broker
const messageBroker = require('amqplib');
const {
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
  USER_BINDING_KEY,
  QUEUE_NAME,
} = require('../config');
const { subscribeEvents } = require('../controllers/userControllers');

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

// subscribe message
const subscribeMessage = async () => {
  const channel = await createChannel();
  const applicationQueue = await channel.assertQueue(QUEUE_NAME);
  channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, USER_BINDING_KEY);
  channel.consume(applicationQueue.queue, data => {
    console.log("contact service's data received ==>", data.content.toString());
    subscribeEvents(JSON.parse(data.content.toString()));
    channel.ack(data);
  });
};

module.exports = { subscribeMessage };
