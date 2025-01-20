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



export const consumeEvent=async (key,callback)=>{
    if(!channel)
    {
        await connectrabbitmq();
    }

    const q= await channel.assertQueue("",{exclusive:true});

   await channel.bindQueue(q.queue,EXCHANGE_NAME,key);
   channel.consume(q.queue,(msg)=>{
    if(msg!==null)
    {
       
        callback(JSON.parse(msg.content.toString()));
        channel.ack(msg);
    }
    })
    logger.info(`event consumed ${key}`)
}