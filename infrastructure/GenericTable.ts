import {AttributeType, Table} from 'aws-cdk-lib/lib/aws-dynamodb';
import { Stack } from 'aws-cdk-lib';
import {NodejsFunction} from 'aws-cdk-lib/lib/aws-lambda-nodejs';
import { LambdaIntegration } from 'aws-cdk-lib/lib/aws-apigateway';
import { join } from 'path';

export interface TableProps{
    tableName: string,
    primaryKey: string,
    createLambdaPath?: string,
    readLambdaPath?: string,
    updateLambdaPath?: string,
    deleteLambdaPath?: string,
    secondaryIndexes?: string[],
}

export class GenericTable{
    private _props:TableProps;
    private _stack: Stack;
    private _table: Table;


    private _createLambda : NodejsFunction | undefined;
    private _readLambda   : NodejsFunction | undefined;
    private _updateLambda : NodejsFunction | undefined;
    private _deleteLambda : NodejsFunction | undefined;

    public createLambdaIntegration:LambdaIntegration;
    public readLambdaIntegration:LambdaIntegration;
    public updateLambdaIntegration:LambdaIntegration;
    public deleteLambdaIntegration:LambdaIntegration;

    public constructor(stack: Stack,props:TableProps) {
        this._props = props;
        this._stack = stack;
        this._initialize();
    }


    private _initialize() {
        this._createTable();
        this._addSecondaryIndexes();
        this._createLambdas();
        this._grantTableRights();
    }

    private _createTable(){
        this._table = new Table(this._stack,this._props.tableName,{
            partitionKey:{
                name: this._props.primaryKey,
                type: AttributeType.STRING
            },
            tableName: this._props.tableName
        })
    }

    private _addSecondaryIndexes(){
        if(this._props.secondaryIndexes){
            for(const secondaryIndexes of this._props.secondaryIndexes){
                this._table.addGlobalSecondaryIndex({
                    indexName: secondaryIndexes,
                    partitionKey:{
                        name:secondaryIndexes,
                        type: AttributeType.STRING
                    }
                })
            }
        }
    }

    private _createLambdas(){
        if(this._props.createLambdaPath){
            this._createLambda = this._createSingleLambda(this._props.createLambdaPath)
            this.createLambdaIntegration = new LambdaIntegration(this._createLambda);
        }
        if(this._props.readLambdaPath){
            this._readLambda = this._createSingleLambda(this._props.readLambdaPath)
            this.readLambdaIntegration = new LambdaIntegration(this._readLambda);
        }
        if(this._props.updateLambdaPath){
            this._updateLambda = this._createSingleLambda(this._props.updateLambdaPath)
            this.updateLambdaIntegration = new LambdaIntegration(this._updateLambda);
        }
        if(this._props.deleteLambdaPath){
            this._deleteLambda = this._createSingleLambda(this._props.deleteLambdaPath)
            this.deleteLambdaIntegration = new LambdaIntegration(this._deleteLambda);
        }
    }

    private _createSingleLambda(lambdaName:string):NodejsFunction{
        const lambdaId = `${this._props.tableName}-${lambdaName}`;

        return new NodejsFunction(this._stack,lambdaId,{
            entry: (join(__dirname,'..','services',this._props.tableName,`${lambdaName}.ts`)),
            handler: 'handler',
            functionName: lambdaId,
            environment:{
                TABLE_NAME: this._props.tableName,
                PRIMARY_KEY: this._props.primaryKey
            }
        })
    }

    private _grantTableRights(){
        if(this._createLambda){
            this._table.grantWriteData(this._createLambda);
        }
        if(this._readLambda){
            this._table.grantReadData(this._readLambda);
        }
        if(this._updateLambda){
            this._table.grantWriteData(this._updateLambda);
        }
        if(this._deleteLambda){
            this._table.grantWriteData(this._deleteLambda);
        }
        
    }

}