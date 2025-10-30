const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
      }
}

async function processMessage(msg) {
    const reportData = JSON.parse(msg.content)
    try {
        if(reportData.products && reportData.products.length > 0) {
            await updateReport(reportData.products)
            console.log(`✔ REPORT UPDATED`)
            console.log('--- CURRENT SALES REPORT ---')
            await printReport()
            console.log('---------------------------')
        } else {
            console.log(`X ERROR, NO PRODUCTS FOUND IN MESSAGE`)
        }
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}

async function consume() {
    console.log(`SUCCESSFULLY SUBSCRIBED TO QUEUE: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
}

consume()
