import { APIGatewayProxyEvent } from 'aws-lambda'

// if you dosen't want to use uuid because it load many package
export function generateRandomId(): string{
    return Math.random().toString(36).slice(2);
}

export function getEventBody(event: APIGatewayProxyEvent){

    return typeof event.body == 'object' ? event.body : JSON.parse(event.body);

}