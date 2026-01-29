import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class DiroApi implements ICredentialType {
    name: string;
    displayName: string;
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
//# sourceMappingURL=DiroApi.credentials.d.ts.map