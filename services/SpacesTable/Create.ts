import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent,APIGatewayProxyResult,Context } from 'aws-lambda'
import { MissingFieldError, validateAsSpaceEntry } from '../Shared/InputValidator'
import {getEventBody} from '../Shared/Utils'

import {v4 as uuid} from 'uuid'


const TABLE_NAME = process.env.TABLE_NAME
const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();


async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>{

    const result:APIGatewayProxyResult ={
        statusCode:200,
        body: 'Hello from DynamoDB!'
    }
    try {
        const item = getEventBody(event);
        item.spaceId = uuid() ;
        validateAsSpaceEntry(item);
        await dbClient.put({
            TableName : TABLE_NAME!,
            Item : item
        }).promise()

    result.body = JSON.stringify(`Created item with id:  ${item.spaceId} `);
    } catch (error) {
        if( error instanceof MissingFieldError){
            result.statusCode = 403;
        }else{
            result.statusCode = 500;
        }
       
        result.body = error.message
    }


    return result;

}

export {handler}