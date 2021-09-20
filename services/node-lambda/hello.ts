import {v4 as uuid} from 'uuid'

async function handler (event:any, context:any) {
    return {
        statusCode: 200,
        body: "Hello from Lambda! " + uuid(),
    };
};

export {handler}