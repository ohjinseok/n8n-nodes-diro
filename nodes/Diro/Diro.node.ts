import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodePropertyOptions,
  IHttpRequestMethods,
  IDataObject,
  ResourceMapperFields,
  FieldType,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

async function getAllResults(
  context: IExecuteFunctions,
  url: string,
  qs: IDataObject,
): Promise<IDataObject[]> {
  const allResults: IDataObject[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await context.helpers.httpRequestWithAuthentication.call(
      context,
      'diroApi',
      {
        method: 'GET' as IHttpRequestMethods,
        url,
        qs: { ...qs, limit, offset },
        json: true,
      },
    );

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

export class Diro implements INodeType {
  description: INodeTypeDescription = {
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
      // Resource Selection
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

      // Document Operations
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

      // Template Operations
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

      // ===== Document: Generate =====
      {
        displayName: 'Template',
        name: 'templateId',
        type: 'options',
        required: true,
        typeOptions: {
          loadOptionsMethod: 'getTemplates',
        },
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate'],
          },
        },
        default: '',
        description: 'The template to use for document generation',
      },
      {
        displayName: 'Template Fields',
        name: 'templateFields',
        type: 'resourceMapper',
        noDataExpression: true,
        required: true,
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate'],
          },
        },
        default: {
          mappingMode: 'defineBelow',
          value: null,
        },
        typeOptions: {
          loadOptionsDependsOn: ['templateId'],
          resourceMapper: {
            resourceMapperMethod: 'getTemplateFields',
            mode: 'add',
            fieldWords: {
              singular: 'field',
              plural: 'fields',
            },
            addAllFields: true,
            multiKeyMatch: false,
          },
        },
      },
      {
        displayName: 'Array Fields (JSON)',
        name: 'arrayFields',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            resource: ['document'],
            operation: ['generate'],
          },
        },
        description:
          'JSON object for array fields like lineItems. Example: {"lineItems": [{"qty": 1, "description": "Item 1", "unitPrice": 100}]}',
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

      // ===== Document: Get =====
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

      // ===== Document: Get Many =====
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

      // ===== Template: Get =====
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

      // ===== Template: Get Many =====
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

  methods = {
    loadOptions: {
      async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('diroApi');
        const baseUrl = (credentials.baseUrl as string) || 'https://www.getdiro.com';

        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
          method: 'GET' as IHttpRequestMethods,
          url: `${baseUrl}/api/v1/templates`,
          qs: { limit: 100 },
          json: true,
        });

        const templates = response.data?.templates || [];
        return templates.map((template: IDataObject) => ({
          name: template.title as string,
          value: template.id as string,
          description: (template.description as string) || undefined,
        }));
      },
    },
    resourceMapping: {
      async getTemplateFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
        const templateId = this.getNodeParameter('templateId', 0) as string;

        if (!templateId) {
          return { fields: [] };
        }

        const credentials = await this.getCredentials('diroApi');
        const baseUrl = (credentials.baseUrl as string) || 'https://www.getdiro.com';

        const response = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
          method: 'GET' as IHttpRequestMethods,
          url: `${baseUrl}/api/v1/templates/${templateId}`,
          json: true,
        });

        const templateData = response.data || response;
        const fields = templateData.fields || [];

        return {
          fields: fields
            .map((field: IDataObject) => {
              const fieldType = (field.type as string || 'text').toLowerCase();
              let type: FieldType = 'string';
              let description: string | undefined;

              if (fieldType === 'number' || fieldType === 'integer' || fieldType === 'float') {
                type = 'number';
              } else if (fieldType === 'boolean' || fieldType === 'bool') {
                type = 'boolean';
              } else if (fieldType === 'date' || fieldType === 'datetime') {
                type = 'dateTime';
              } else if (fieldType === 'array') {
                // array 필드는 별도 JSON 필드에서 입력받으므로 resourceMapper에서 숨김
                return null;
              } else if (fieldType === 'image') {
                type = 'string';
                description = 'Image URL';
              }

              return {
                id: field.key as string,
                displayName: (field.label as string) || (field.key as string),
                type,
                required: (field.required as boolean) || false,
                defaultMatch: false,
                canBeUsedToMatch: true,
                display: true,
                ...(description && { description }),
              };
            })
            .filter(Boolean) as ResourceMapperFields['fields'],
        };
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const credentials = await this.getCredentials('diroApi');
    const baseUrl = (credentials.baseUrl as string) || 'https://www.getdiro.com';

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        if (resource === 'document') {
          if (operation === 'generate') {
            const templateId = this.getNodeParameter('templateId', i) as string;
            const templateFields = this.getNodeParameter('templateFields', i) as IDataObject;
            const arrayFieldsStr = this.getNodeParameter('arrayFields', i) as string;
            const options = this.getNodeParameter('options', i) as IDataObject;

            // Extract field values from resourceMapper
            const data: IDataObject = {};
            const fieldValues = (templateFields.value as IDataObject) || {};
            for (const [key, value] of Object.entries(fieldValues)) {
              if (value !== undefined && value !== null && value !== '') {
                data[key] = value;
              }
            }

            // Merge array fields from JSON input
            if (arrayFieldsStr && arrayFieldsStr !== '{}') {
              try {
                const arrayData = JSON.parse(arrayFieldsStr) as IDataObject;
                Object.assign(data, arrayData);
              } catch {
                throw new NodeApiError(this.getNode(), {
                  message: 'Invalid JSON in Array Fields',
                  description: 'Please provide valid JSON for array fields',
                });
              }
            }

            // Validate that data is not empty
            if (Object.keys(data).length === 0) {
              throw new NodeApiError(this.getNode(), {
                message: 'No template data provided',
                description: 'Please provide at least one field value in Template Fields or Array Fields. Cannot generate document with empty data.',
              });
            }

            const body: IDataObject = {
              templateId,
              data,
            };

            if (options.format) {
              body.format = options.format;
            }
            if (options.width && (options.width as number) > 0) {
              body.width = options.width;
            }
            if (options.height && (options.height as number) > 0) {
              body.height = options.height;
            }

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
              method: 'POST' as IHttpRequestMethods,
              url: `${baseUrl}/api/v1/documents`,
              body,
              json: true,
            });

            // Validate response structure for generate operation
            if (responseData && typeof responseData === 'object' && 'data' in responseData) {
              const dataField = (responseData as IDataObject).data;

              // Check if we mistakenly received a list response instead of single document
              if (dataField && typeof dataField === 'object' && 'documents' in dataField && 'pagination' in dataField) {
                throw new NodeApiError(this.getNode(), {
                  message: 'Unexpected API response format',
                  description: 'Expected a single document but received a document list. This indicates the POST request may have been processed as GET. Please check your API server configuration, or contact Diro support if this persists.',
                  httpCode: '500',
                });
              }
            }
          } else if (operation === 'get') {
            const documentId = this.getNodeParameter('documentId', i) as string;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
              method: 'GET' as IHttpRequestMethods,
              url: `${baseUrl}/api/v1/documents/${documentId}`,
              json: true,
            });
          } else if (operation === 'getMany') {
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;
            const filters = this.getNodeParameter('filters', i) as IDataObject;

            const qs: IDataObject = {};

            if (filters.templateId) {
              qs.templateId = filters.templateId;
            }

            if (returnAll) {
              responseData = await getAllResults(this, `${baseUrl}/api/v1/documents`, qs);
            } else {
              const limit = this.getNodeParameter('limit', i) as number;
              qs.limit = limit;

              const response = await this.helpers.httpRequestWithAuthentication.call(
                this,
                'diroApi',
                {
                  method: 'GET' as IHttpRequestMethods,
                  url: `${baseUrl}/api/v1/documents`,
                  qs,
                  json: true,
                },
              );

              responseData = response.data?.documents || [];
            }
          } else if (operation === 'delete') {
            const documentId = this.getNodeParameter('documentId', i) as string;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
              method: 'DELETE' as IHttpRequestMethods,
              url: `${baseUrl}/api/v1/documents/${documentId}`,
              json: true,
            });
          } else {
            throw new NodeApiError(this.getNode(), {
              message: `Unknown operation: ${operation}`,
            });
          }
        } else if (resource === 'template') {
          if (operation === 'get') {
            const templateId = this.getNodeParameter('templateId', i) as string;

            responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'diroApi', {
              method: 'GET' as IHttpRequestMethods,
              url: `${baseUrl}/api/v1/templates/${templateId}`,
              json: true,
            });
          } else if (operation === 'getMany') {
            const returnAll = this.getNodeParameter('returnAll', i) as boolean;

            if (returnAll) {
              responseData = await getAllResults(this, `${baseUrl}/api/v1/templates`, {});
            } else {
              const limit = this.getNodeParameter('limit', i) as number;

              const response = await this.helpers.httpRequestWithAuthentication.call(
                this,
                'diroApi',
                {
                  method: 'GET' as IHttpRequestMethods,
                  url: `${baseUrl}/api/v1/templates`,
                  qs: { limit },
                  json: true,
                },
              );

              responseData = response.data?.templates || [];
            }
          } else {
            throw new NodeApiError(this.getNode(), {
              message: `Unknown operation: ${operation}`,
            });
          }
        } else {
          throw new NodeApiError(this.getNode(), {
            message: `Unknown resource: ${resource}`,
          });
        }

        // Handle response based on operation type
        if (Array.isArray(responseData)) {
          // getMany operations return arrays directly
          for (const item of responseData) {
            returnData.push({ json: item as IDataObject });
          }
        } else {
          // Single item operations (generate, get, delete)
          let finalData: IDataObject;

          // Check if response has standard wrapper format { success: true, data: {...} }
          const hasDataProperty = responseData && typeof responseData === 'object' && 'data' in responseData;

          if (hasDataProperty) {
            const wrappedData = (responseData as IDataObject).data;

            // Additional safety check: verify it's not a list response
            if (wrappedData && typeof wrappedData === 'object') {
              if ('documents' in wrappedData && 'pagination' in wrappedData) {
                // This should have been caught earlier, but just in case
                throw new NodeApiError(this.getNode(), {
                  message: 'Received unexpected list response',
                  description: `Operation '${operation}' should return a single item but received a list with pagination.`,
                });
              }
              finalData = wrappedData as IDataObject;
            } else {
              finalData = responseData as IDataObject;
            }
          } else {
            finalData = responseData as IDataObject;
          }

          returnData.push({ json: finalData });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
