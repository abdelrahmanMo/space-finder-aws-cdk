import { APIGatewayProxyEvent } from 'aws-lambda';
import {handler} from '../../services/SpacesTable/Create';

const event : APIGatewayProxyEvent = {
    body:{
        name:'someName'
    }
} as any

 const result =  handler(event as any,{} as any).then(apiResult =>{
     const items = JSON.parse(apiResult.body);
     console.log(123)
 });