import logger from "./logger.js"

import amqplib from "amqplib";


let connection=null;
let channel=null;

const EXCHANGE_NAME="posts";
 export const connectrabbitmq=async()=>{
    try {
        connection=await amqplib.connect(process.env.RABBITMQ_URL);
        channel=await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:true});
        logger.info("Connected to RabbitMQ");
        return channel;
    } catch (error) {
        logger.error("Error connecting to RabbitMQ",error);
    }
}


export const publishEvent=async (key,message)=>{
if(!channel)
{
    await connectrabbitmq();
}
channel.publish(EXCHANGE_NAME,key,Buffer.from(JSON.stringify(message)));
logger.info(`event published ${key}`)
    
}
