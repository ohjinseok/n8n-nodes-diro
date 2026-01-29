"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiroApi = void 0;
class DiroApi {
    name = 'diroApi';
    displayName = 'Diro API';
    documentationUrl = 'https://docs.getdiro.com/authentication';
    properties = [
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
            default: 'https://getdiro.com',
            description: 'Base URL for the Diro API. Change only for self-hosted instances.',
        },
    ];
    authenticate = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };
    test = {
        request: {
            baseURL: '={{$credentials.baseUrl}}',
            url: '/api/v1/templates',
            method: 'GET',
        },
    };
}
exports.DiroApi = DiroApi;
//# sourceMappingURL=DiroApi.credentials.js.map