"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diro = void 0;
const n8n_workflow_1 = require("n8n-workflow");
async function getAllResults(context, url, qs) {
    const allResults = [];
    let offset = 0;
    const limit = 100;
    while (true) {
        const response = await context.helpers.httpRequestWithAuthentication.call(context, 'diroApi', {
            method: 'GET',
            url,
            qs: { ...qs, limit, offset },
            json: true,
        });
        const items = response.data?.documents || response.data?.templates || [];
        allResults.push(...items);
        const total = response.data?.pagination?.total || 0;
        offset += limit;
        if (offset >= total || items.length === 0) {
            break;
        }
    }
    return allResults;
}
class Diro {
    description = {
        displayName: 'Diro',
        name: 'diro',
        icon: 'file:diro.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Generate PDF/PNG documents from templates using Diro API',
        defaults: {
            name: 'Diro',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'diroApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Document',
                        value: 'document',
                        description: 'Generate and manage documents',
                    },
                    {
                        name: 'Template',
                        value: 'template',
                        description: 'Manage document templates',
                    },
                ],
                default: 'document',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                    },
                },
                options: [
                    {
                        name: 'Generate',
                        value: 'generate',
                        description: 'Generate a new document from a template',
                        action: 'Generate a document',
                    },
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a document by ID',
                        action: 'Get a document',
                    },
                    {
                        name: 'Get Many',
                        value: 'getMany',
                        description: 'Get many documents',
                        action: 'Get many documents',
                    },
                    {
                        name: 'Delete',
                        value: 'delete',
                        description: 'Delete a document',
                        action: 'Delete a document',
                    },
                ],
                default: 'generate',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['template'],
                    },
                },
                options: [
                    {
                        name: 'Get',
                        value: 'get',
                        description: 'Get a template by ID',
                        action: 'Get a template',
                    },
                    {
                        name: 'Get Many',
                        value: 'getMany',
                        description: 'Get many templates',
                        action: 'Get many templates',
                    },
                ],
                default: 'getMany',
            },
            {
                displayName: 'Template ID',
                name: 'templateId',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['generate'],
                    },
                },
                default: '',
                description: 'The ID of the template to use for document generation',
            },
            {
                displayName: 'Data',
                name: 'data',
                type: 'json',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['generate'],
                    },
                },
                default: '{}',
                description: 'JSON object with field values. Keys should match template field keys (e.g., {"name": "John", "score": 85}).',
            },
            {
                displayName: 'Options',
                name: 'options',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['generate'],
                    },
                },
                options: [
                    {
                        displayName: 'Format',
                        name: 'format',
                        type: 'options',
                        options: [
                            { name: 'PDF', value: 'pdf' },
                            { name: 'PNG', value: 'png' },
                        ],
                        default: 'pdf',
                        description: 'Output format for the generated document',
                    },
                    {
                        displayName: 'Width',
                        name: 'width',
                        type: 'number',
                        default: 0,
                        description: 'Custom page width in pixels (0 to use template default)',
                    },
                    {
                        displayName: 'Height',
                        name: 'height',
                        type: 'number',
                        default: 0,
                        description: 'Custom page height in pixels (0 to use template default)',
                    },
                ],
            },
            {
                displayName: 'Document ID',
                name: 'documentId',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['get', 'delete'],
                    },
                },
                default: '',
                description: 'The ID of the document',
            },
            {
                displayName: 'Return All',
                name: 'returnAll',
                type: 'boolean',
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['getMany'],
                    },
                },
                default: false,
                description: 'Whether to return all results or only up to a given limit',
            },
            {
                displayName: 'Limit',
                name: 'limit',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['getMany'],
                        returnAll: [false],
                    },
                },
                typeOptions: {
                    minValue: 1,
                    maxValue: 100,
                },
                default: 20,
                description: 'Max number of results to return',
            },
            {
                displayName: 'Filters',
                name: 'filters',
                type: 'collection',
                placeholder: 'Add Filter',
                default: {},
                displayOptions: {
                    show: {
                        resource: ['document'],
                        operation: ['getMany'],
                    },
                },
                options: [
                    {
                        displayName: 'Template ID',
                        name: 'templateId',
                        type: 'string',
                        default: '',
                        description: 'Filter documents by template ID',
                    },
                ],
            },
            {
                displayName: 'Template ID',
                name: 'templateId',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        resource: ['template'],
                        operation: ['get'],
                    },
                },
                default: '',
                description: 'The ID of the template',
            },
            {
                displayName: 'Return All',
                name: 'returnAll',
                type: 'boolean',
                displayOptions: {
                    show: {
                        resource: ['template'],
                        operation: ['getMany'],
                    },
                },
                default: false,
                description: 'Whether to return all results or only up to a given limit',
            },
            {
                displayName: 'Limit',
                name: 'limit',
                type: 'number',
                displayOptions: {
                    show: {
                        resource: ['template'],
                        operation: ['getMany'],
                        returnAll: [false],
                    },
                },
                typeOptions: {
                    minValue: 1,
                    maxValue: 100,
                },
                default: 20,
                description: 'Max number of results to return',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('diroApi');
        const baseUrl = credentials.baseUrl || 'https://getdiro.com';
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                if (resource === 'document') {
                    if (operation === 'generate') {
                        const templateId = this.getNodeParameter('templateId', i);
                        const dataString = this.getNodeParameter('data', i);
                        const options = this.getNodeParameter('options', i);
                        let data;
                        try {
                            data = JSON.parse(dataString);
                        }
                        catch {
                            throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                                message: 'Invalid JSON in Data field',
                                description: 'Please provide valid JSON for the data field',
                            });
                        }
                        const body = {
                            templateId,
                            data,
                        };
                        if (options.format) {
                            body.format = options.format;
                        }
                        if (options.width && options.width > 0) {
                            body.width = options.width;
                        }
                        if (options.height && options.height > 0) {
                            body.height = options.height;
                        }
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
                            method: 'POST',
                            url: `${baseUrl}/api/v1/documents`,
                            body,
                            json: true,
                        });
                    }
                    else if (operation === 'get') {
                        const documentId = this.getNodeParameter('documentId', i);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
                            method: 'GET',
                            url: `${baseUrl}/api/v1/documents/${documentId}`,
                            json: true,
                        });
                    }
                    else if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        const filters = this.getNodeParameter('filters', i);
                        const qs = {};
                        if (filters.templateId) {
                            qs.templateId = filters.templateId;
                        }
                        if (returnAll) {
                            responseData = await getAllResults(this, `${baseUrl}/api/v1/documents`, qs);
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            qs.limit = limit;
                            const response = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
                                method: 'GET',
                                url: `${baseUrl}/api/v1/documents`,
                                qs,
                                json: true,
                            });
                            responseData = response.data?.documents || [];
                        }
                    }
                    else if (operation === 'delete') {
                        const documentId = this.getNodeParameter('documentId', i);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
                            method: 'DELETE',
                            url: `${baseUrl}/api/v1/documents/${documentId}`,
                            json: true,
                        });
                    }
                    else {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: `Unknown operation: ${operation}`,
                        });
                    }
                }
                else if (resource === 'template') {
                    if (operation === 'get') {
                        const templateId = this.getNodeParameter('templateId', i);
                        responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
                            method: 'GET',
                            url: `${baseUrl}/api/v1/templates/${templateId}`,
                            json: true,
                        });
                    }
                    else if (operation === 'getMany') {
                        const returnAll = this.getNodeParameter('returnAll', i);
                        if (returnAll) {
                            responseData = await getAllResults(this, `${baseUrl}/api/v1/templates`, {});
                        }
                        else {
                            const limit = this.getNodeParameter('limit', i);
                            const response = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
                                method: 'GET',
                                url: `${baseUrl}/api/v1/templates`,
                                qs: { limit },
                                json: true,
                            });
                            responseData = response.data?.templates || [];
                        }
                    }
                    else {
                        throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                            message: `Unknown operation: ${operation}`,
                        });
                    }
                }
                else {
                    throw new n8n_workflow_1.NodeApiError(this.getNode(), {
                        message: `Unknown resource: ${resource}`,
                    });
                }
                if (Array.isArray(responseData)) {
                    for (const item of responseData) {
                        returnData.push({ json: item });
                    }
                }
                else {
                    const data = responseData.data || responseData;
                    returnData.push({ json: data });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.Diro = Diro;
//# sourceMappingURL=Diro.node.js.map