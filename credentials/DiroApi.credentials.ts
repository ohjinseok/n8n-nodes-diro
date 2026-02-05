import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class DiroApi implements ICredentialType {
  name = 'diroApi';
  displayName = 'Diro API';
  documentationUrl = 'https://www.www.getdiro.com/docs/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'API Key from Diro Dashboard. Starts with "diro_".',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://www.getdiro.com',
      description: 'Base URL for the Diro API. Change only for self-hosted instances.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/v1/templates',
      method: 'GET',
    },
  };
}
