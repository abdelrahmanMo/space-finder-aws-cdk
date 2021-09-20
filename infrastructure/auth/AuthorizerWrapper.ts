import { CfnOutput } from "aws-cdk-lib";
import { CognitoUserPoolsAuthorizer, RestApi } from "aws-cdk-lib/lib/aws-apigateway";
import { UserPool, UserPoolClient } from "aws-cdk-lib/lib/aws-cognito";
import { Construct } from "constructs";


export class AuthorizerWrapper{
    private _scope: Construct
    private _api: RestApi

    private _userPool: UserPool;
    private _userPoolClient: UserPoolClient;

    public authorizer: CognitoUserPoolsAuthorizer;

    constructor(scope: Construct, api: RestApi){
        this._scope = scope;
        this._api = api;
        this._initialize();
    
    }

    private _initialize(){
        this._createUserPool();
        this._addUserPoolClient();
        this._createAuthorizer();
    }

    private _createUserPool(){
        this._userPool = new UserPool(this._scope,'SpaceUserPool',{
            userPoolName:'SpaceUserPool',
            selfSignUpEnabled:true,
            signInAliases:{
                username: true,
                email: true
            }
        });

        new CfnOutput(this._scope,'UserPoolId',{
            value:this._userPool.userPoolId
        })
    }

    private _addUserPoolClient(){
        this._userPoolClient = this._userPool.addClient('SpaceUserPool-client',{
            userPoolClientName: 'SpaceUserPool-client',
            authFlows:{
                adminUserPassword:true,
                custom:true,
                userPassword:true,
                userSrp:true
            },
            generateSecret: false
        });
        new CfnOutput(this._scope,'UserPoolClientId',{
            value:this._userPoolClient.userPoolClientId
        })
    }

    private _createAuthorizer(){
        this.authorizer = new CognitoUserPoolsAuthorizer(this._scope,'SpaceUserAuthorizer',{
            cognitoUserPools: [this._userPool],
            authorizerName: 'SpaceUserAuthorizer',
            identitySource: 'method.request.header.Authorization'
        })
        this.authorizer._attachToApi(this._api);

    }

}